import { randomBytes, randomUUID } from "crypto"
import { and, desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import {
  invitations,
  documents,
  documentCollaborators,
  accountMemberships,
  accounts,
} from "@/lib/collab-schema"
import { logAudit } from "@/lib/audit"
import { assertDocumentAccess, getDocumentRow } from "@/lib/permissions"
import { getMembership } from "@/lib/accounts"
import { syncCurrentUser, upsertUser, getUsers, displayName } from "@/lib/users"
import { sendInvitationEmail, sendInviteAcceptedEmail } from "@/lib/email"

export type InvitationRow = typeof invitations.$inferSelect

// "client" is used when a firm invites the person a document is *about* to complete their part —
// on acceptance it sets documents.clientUserId (not a collaborator row), so they get exactly
// their own filing and nothing else in the firm.
export const DOCUMENT_ROLES: readonly string[] = ["editor", "viewer", "client"]
export const ACCOUNT_ROLES: readonly string[] = ["attorney", "staff", "viewer"]
export const MEMBERSHIP_SCOPES: readonly string[] = ["all_clients", "assigned_only"]

export class InvitationError extends Error {
  constructor(
    public status: 400 | 403 | 404 | 409 | 410,
    message: string,
  ) {
    super(message)
    this.name = "InvitationError"
  }
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Link expiry:
 *   - plain collaborator / firm-team invite → 7 days.
 *   - client invite on a filing that carries a real, still-future deadline → 2 days before that
 *     deadline, clamped to [1 day from now, 7 days from now] and never past the deadline itself,
 *     so the link can't outlive the thing it exists for.
 *   - a deadline that's already passed (a client onboarded late) falls back to the plain 7 days
 *     instead of minting a link that's expired the moment it's created — a missed 83(b) window
 *     doesn't mean the client should be locked out of ever opening the invite.
 */
export function computeExpiry(deadlineDate: string | Date | null | undefined): Date {
  const now = Date.now()
  const sevenDays = new Date(now + 7 * DAY_MS)
  if (!deadlineDate) return sevenDays

  const deadline = new Date(deadlineDate).getTime()
  if (Number.isNaN(deadline) || deadline <= now) return sevenDays

  const target = deadline - 2 * DAY_MS
  const clamped = Math.max(now + DAY_MS, Math.min(target, now + 7 * DAY_MS))
  return new Date(Math.min(clamped, deadline))
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function newToken(): string {
  return randomBytes(24).toString("base64url")
}

/* ------------------------------------------------------------------ *
 *  Create
 * ------------------------------------------------------------------ */

type CreateInput = {
  inviterUserId: string
  email: string
  origin: string
} & (
  | { target: "document"; documentId: string; role: string }
  | { target: "account"; accountId: string; role: string; scope?: string }
)

export type CreatedInvitation = { invitation: InvitationRow; acceptUrl: string; emailed: boolean }

/**
 * Creates (or, if one is already pending for the same email+target, refreshes) an invitation and
 * tries to email it. The accept URL is always returned so the caller can show a copy-link button
 * regardless of whether email delivery is configured yet.
 */
export async function createInvitation(input: CreateInput): Promise<CreatedInvitation> {
  const email = normalizeEmail(input.email)
  if (!isValidEmail(email)) throw new InvitationError(400, "Enter a valid email address")

  let accountId: string | null = null
  let documentId: string | null = null
  let scope: string | null = null
  let deadlineDate: string | null = null
  let subjectTitle = ""

  if (input.target === "document") {
    if (!DOCUMENT_ROLES.includes(input.role)) throw new InvitationError(400, "Invalid role")
    // Only someone who can manage the document may share it.
    const { doc } = await assertDocumentAccess(input.inviterUserId, input.documentId, "manage")
    documentId = doc.id
    accountId = doc.accountId
    deadlineDate = doc.deadlineDate
    subjectTitle = doc.title

    if (await emailAlreadyHasDocumentAccess(doc.id, email)) {
      throw new InvitationError(409, "That person already has access to this document")
    }
  } else {
    if (!ACCOUNT_ROLES.includes(input.role)) throw new InvitationError(400, "Invalid role")
    scope = input.scope && MEMBERSHIP_SCOPES.includes(input.scope) ? input.scope : "all_clients"
    const membership = await getMembership(input.accountId, input.inviterUserId)
    if (!membership || !["owner", "attorney"].includes(membership.role)) {
      throw new InvitationError(403, "You can't invite people to this account")
    }
    const [account] = await db.select().from(accounts).where(eq(accounts.id, input.accountId)).limit(1)
    if (!account) throw new InvitationError(404, "Account not found")
    accountId = account.id
    subjectTitle = account.name

    if (await emailAlreadyHasAccountAccess(account.id, email)) {
      throw new InvitationError(409, "That person is already a member of this account")
    }
  }

  const expiresAt = computeExpiry(deadlineDate)
  const token = newToken()

  // One live invite per (email, target): refresh the existing pending row instead of stacking a
  // duplicate (Phase 7). The partial unique index enforces this too — this just makes it a clean
  // update rather than a constraint error.
  const [existing] = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.email, email),
        eq(invitations.status, "pending"),
        documentId ? eq(invitations.documentId, documentId) : eq(invitations.accountId, accountId!),
      ),
    )
    .limit(1)

  let invitation: InvitationRow
  if (existing) {
    ;[invitation] = await db
      .update(invitations)
      .set({
        token,
        role: input.role,
        scope,
        invitedByUserId: input.inviterUserId,
        expiresAt,
        createdAt: new Date(),
      })
      .where(eq(invitations.id, existing.id))
      .returning()
  } else {
    try {
      ;[invitation] = await db
        .insert(invitations)
        .values({
          id: randomUUID(),
          email,
          invitedByUserId: input.inviterUserId,
          accountId,
          documentId,
          role: input.role,
          scope,
          token,
          status: "pending",
          expiresAt,
        })
        .returning()
    } catch {
      // Lost a race with a concurrent invite for the same (email, target) — the partial unique
      // index rejected the second insert. Fall back to updating whichever row won.
      const [winner] = await db
        .select()
        .from(invitations)
        .where(
          and(
            eq(invitations.email, email),
            eq(invitations.status, "pending"),
            documentId ? eq(invitations.documentId, documentId) : eq(invitations.accountId, accountId!),
          ),
        )
        .limit(1)
      if (!winner) throw new InvitationError(409, "Couldn't create the invite — try again")
      ;[invitation] = await db
        .update(invitations)
        .set({ token, role: input.role, scope, invitedByUserId: input.inviterUserId, expiresAt, createdAt: new Date() })
        .where(eq(invitations.id, winner.id))
        .returning()
    }
  }

  await logAudit({
    action: existing ? "invite_resent" : "invited_user",
    actorUserId: input.inviterUserId,
    accountId,
    documentId,
    metadata: { email, role: input.role, scope, target: input.target },
  })

  const acceptUrl = `${input.origin}/invite/${token}`
  const emailed = await trySendInvitationEmail({
    to: email,
    inviterUserId: input.inviterUserId,
    target: input.target,
    subjectTitle,
    role: input.role,
    acceptUrl,
    expiresAt,
  }).catch(() => false)

  return { invitation, acceptUrl, emailed }
}

/* ------------------------------------------------------------------ *
 *  Accept / decline
 * ------------------------------------------------------------------ */

export type InvitationDetails = {
  token: string
  email: string
  status: InvitationRow["status"]
  target: "document" | "account"
  role: string
  subjectTitle: string
  invitedByName: string
  expiresAt: Date
  expired: boolean
}

/** Read-only view for the accept screen. Lazily marks an overdue pending invite `expired`. */
export async function getInvitationDetails(token: string): Promise<InvitationDetails> {
  const row = await loadAndMaybeExpire(token)

  let subjectTitle = ""
  if (row.documentId) {
    const doc = await getDocumentRow(row.documentId)
    subjectTitle = doc?.title ?? "a document"
  } else if (row.accountId) {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, row.accountId)).limit(1)
    subjectTitle = account?.name ?? "an account"
  }

  const inviter = (await getUsers([row.invitedByUserId])).get(row.invitedByUserId)

  return {
    token,
    email: row.email,
    status: row.status,
    target: row.documentId ? "document" : "account",
    role: row.role,
    subjectTitle,
    invitedByName: displayName(inviter),
    expiresAt: row.expiresAt,
    expired: row.status === "expired",
  }
}

/** Accepts an invite for the given signed-in user, creating the matching grant row. */
export async function acceptInvitation(
  token: string,
  accepting: { userId: string; email: string; firstName?: string | null; lastName?: string | null; imageUrl?: string | null },
): Promise<{ target: "document" | "account"; documentId: string | null; accountId: string | null }> {
  const row = await loadAndMaybeExpire(token)
  if (row.status !== "pending") {
    throw new InvitationError(410, statusMessage(row.status))
  }

  await upsertUser({
    id: accepting.userId,
    email: accepting.email,
    firstName: accepting.firstName,
    lastName: accepting.lastName,
    imageUrl: accepting.imageUrl,
  })

  if (row.documentId && row.role === "client") {
    const { attachClientToDocument } = await import("@/lib/documents")
    await attachClientToDocument(row.documentId, accepting.userId)
  } else if (row.documentId) {
    await db
      .insert(documentCollaborators)
      .values({
        id: randomUUID(),
        documentId: row.documentId,
        userId: accepting.userId,
        role: row.role,
        status: "active",
        invitedByUserId: row.invitedByUserId,
      })
      .onConflictDoUpdate({
        target: [documentCollaborators.documentId, documentCollaborators.userId],
        set: { role: row.role, status: "active", revokedAt: null },
      })
  } else if (row.accountId) {
    await db
      .insert(accountMemberships)
      .values({
        id: randomUUID(),
        accountId: row.accountId,
        userId: accepting.userId,
        role: row.role,
        scope: (row.scope as string) ?? "all_clients",
        status: "active",
        invitedByUserId: row.invitedByUserId,
      })
      .onConflictDoUpdate({
        target: [accountMemberships.accountId, accountMemberships.userId],
        set: { role: row.role, scope: (row.scope as string) ?? "all_clients", status: "active", revokedAt: null },
      })
  }

  await db
    .update(invitations)
    .set({ status: "accepted", acceptedByUserId: accepting.userId, acceptedAt: new Date() })
    .where(eq(invitations.id, row.id))

  await logAudit({
    action: "invite_accepted",
    actorUserId: accepting.userId,
    accountId: row.accountId,
    documentId: row.documentId,
    metadata: { role: row.role, invitedEmail: row.email },
  })

  notifyInviteAccepted(row, accepting.userId).catch((err) => console.error("[invitations] accepted-email failed", err))

  return {
    target: row.documentId ? "document" : "account",
    documentId: row.documentId,
    accountId: row.accountId,
  }
}

export async function declineInvitation(token: string, byUserId?: string | null): Promise<void> {
  const row = await loadAndMaybeExpire(token)
  if (row.status !== "pending") throw new InvitationError(410, statusMessage(row.status))
  await db.update(invitations).set({ status: "declined" }).where(eq(invitations.id, row.id))
  await logAudit({
    action: "invite_declined",
    actorUserId: byUserId ?? null,
    accountId: row.accountId,
    documentId: row.documentId,
    metadata: { invitedEmail: row.email },
  })
}

/* ------------------------------------------------------------------ *
 *  Manage: list / resend / revoke
 * ------------------------------------------------------------------ */

export async function listInvitationsForDocument(actorUserId: string, documentId: string): Promise<InvitationRow[]> {
  await assertDocumentAccess(actorUserId, documentId, "manage")
  return db
    .select()
    .from(invitations)
    .where(and(eq(invitations.documentId, documentId), eq(invitations.status, "pending")))
    .orderBy(desc(invitations.createdAt))
}

export async function listInvitationsForAccount(actorUserId: string, accountId: string): Promise<InvitationRow[]> {
  const membership = await getMembership(accountId, actorUserId)
  if (!membership || !["owner", "attorney"].includes(membership.role)) {
    throw new InvitationError(403, "You can't view this account's invites")
  }
  return db
    .select()
    .from(invitations)
    .where(and(eq(invitations.accountId, accountId), eq(invitations.status, "pending")))
    .orderBy(desc(invitations.createdAt))
}

export async function resendInvitation(actorUserId: string, invitationId: string, origin: string): Promise<CreatedInvitation> {
  const row = await requireManageableInvitation(actorUserId, invitationId)
  if (row.status !== "pending" && row.status !== "expired") {
    throw new InvitationError(409, "This invite can't be resent")
  }

  let deadlineDate: string | null = null
  let subjectTitle = ""
  if (row.documentId) {
    const doc = await getDocumentRow(row.documentId)
    deadlineDate = doc?.deadlineDate ?? null
    subjectTitle = doc?.title ?? ""
  } else if (row.accountId) {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, row.accountId)).limit(1)
    subjectTitle = account?.name ?? ""
  }

  const token = newToken()
  const expiresAt = computeExpiry(deadlineDate)
  const [updated] = await db
    .update(invitations)
    .set({ token, status: "pending", expiresAt, createdAt: new Date(), invitedByUserId: actorUserId })
    .where(eq(invitations.id, row.id))
    .returning()

  await logAudit({
    action: "invite_resent",
    actorUserId,
    accountId: row.accountId,
    documentId: row.documentId,
    metadata: { email: row.email, role: row.role },
  })

  const acceptUrl = `${origin}/invite/${token}`
  const emailed = await trySendInvitationEmail({
    to: row.email,
    inviterUserId: actorUserId,
    target: row.documentId ? "document" : "account",
    subjectTitle,
    role: row.role,
    acceptUrl,
    expiresAt,
  }).catch(() => false)

  return { invitation: updated, acceptUrl, emailed }
}

export async function revokeInvitation(actorUserId: string, invitationId: string): Promise<void> {
  const row = await requireManageableInvitation(actorUserId, invitationId)
  if (row.status !== "pending" && row.status !== "expired") return
  await db.update(invitations).set({ status: "revoked" }).where(eq(invitations.id, row.id))
  await logAudit({
    action: "invite_revoked",
    actorUserId,
    accountId: row.accountId,
    documentId: row.documentId,
    metadata: { email: row.email, role: row.role },
  })
}

/* ------------------------------------------------------------------ *
 *  helpers
 * ------------------------------------------------------------------ */

async function loadAndMaybeExpire(token: string): Promise<InvitationRow> {
  const [row] = await db.select().from(invitations).where(eq(invitations.token, token)).limit(1)
  if (!row) throw new InvitationError(404, "This invite link is invalid")

  if (row.status === "pending" && row.expiresAt.getTime() < Date.now()) {
    await db.update(invitations).set({ status: "expired" }).where(eq(invitations.id, row.id))
    await logAudit({
      action: "invite_expired",
      actorUserId: null,
      accountId: row.accountId,
      documentId: row.documentId,
      metadata: { email: row.email },
    })
    return { ...row, status: "expired" }
  }
  return row
}

async function requireManageableInvitation(actorUserId: string, invitationId: string): Promise<InvitationRow> {
  const [row] = await db.select().from(invitations).where(eq(invitations.id, invitationId)).limit(1)
  if (!row) throw new InvitationError(404, "Invite not found")

  if (row.documentId) {
    await assertDocumentAccess(actorUserId, row.documentId, "manage")
  } else if (row.accountId) {
    const membership = await getMembership(row.accountId, actorUserId)
    if (!membership || !["owner", "attorney"].includes(membership.role)) {
      throw new InvitationError(403, "You can't manage this invite")
    }
  }
  return row
}

async function emailAlreadyHasDocumentAccess(documentId: string, email: string): Promise<boolean> {
  // A collaborator row is keyed by user id, not email — resolve via the users mirror.
  const rows = await db
    .select()
    .from(documentCollaborators)
    .where(and(eq(documentCollaborators.documentId, documentId), eq(documentCollaborators.status, "active")))
  if (!rows.length) return false
  const usersById = await getUsers(rows.map((r) => r.userId))
  return rows.some((r) => usersById.get(r.userId)?.email === email)
}

async function emailAlreadyHasAccountAccess(accountId: string, email: string): Promise<boolean> {
  const rows = await db
    .select()
    .from(accountMemberships)
    .where(and(eq(accountMemberships.accountId, accountId), eq(accountMemberships.status, "active")))
  if (!rows.length) return false
  const usersById = await getUsers(rows.map((r) => r.userId))
  return rows.some((r) => usersById.get(r.userId)?.email === email)
}

/** Best-effort "X accepted your invite" nudge back to whoever sent it — never blocks acceptance. */
async function notifyInviteAccepted(row: InvitationRow, accepterId: string): Promise<void> {
  const ids = [row.invitedByUserId, accepterId]
  const usersById = await getUsers(ids)
  const inviter = usersById.get(row.invitedByUserId)
  if (!inviter?.email) return

  let subjectTitle = ""
  if (row.documentId) {
    const { getDocumentRow } = await import("@/lib/permissions")
    subjectTitle = (await getDocumentRow(row.documentId))?.title ?? "the filing"
  } else if (row.accountId) {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, row.accountId)).limit(1)
    subjectTitle = account?.name ?? "the workspace"
  }

  await sendInviteAcceptedEmail({
    to: inviter.email,
    inviterName: displayName(inviter),
    accepterName: displayName(usersById.get(accepterId)),
    target: row.documentId ? "document" : "account",
    subjectTitle,
  })
}

function statusMessage(status: InvitationRow["status"]): string {
  switch (status) {
    case "accepted":
      return "This invite has already been accepted"
    case "declined":
      return "This invite was declined"
    case "revoked":
      return "This invite was revoked by the sender"
    case "expired":
      return "This invite link has expired — ask the sender for a new one"
    default:
      return "This invite is no longer valid"
  }
}

async function trySendInvitationEmail(args: {
  to: string
  inviterUserId: string
  target: "document" | "account"
  subjectTitle: string
  role: string
  acceptUrl: string
  expiresAt: Date
}): Promise<boolean> {
  const inviter = (await getUsers([args.inviterUserId])).get(args.inviterUserId)
  try {
    await sendInvitationEmail({
      to: args.to,
      inviterName: displayName(inviter),
      target: args.target,
      subjectTitle: args.subjectTitle,
      role: args.role,
      acceptUrl: args.acceptUrl,
      expiresAt: args.expiresAt,
    })
    return true
  } catch (err) {
    console.error("[invitations] email send failed", err)
    return false
  }
}

/** Kept for callers that want to opportunistically mirror the acting user first. */
export { syncCurrentUser }
