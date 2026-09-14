import { and, eq, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { documents, accountMemberships, documentCollaborators } from "@/lib/collab-schema"
import { logAudit } from "@/lib/audit"

/**
 * The single authorization surface for everything that touches a document. Every route or server
 * action that reads or writes a filing's content, its metadata, or its sharing goes through
 * `canAccessDocument` / `assertDocumentAccess` — no ad-hoc `row.ownerId === userId` checks
 * scattered around (the pattern the older `signature_requests` / `info_requests` routes use).
 *
 * Access can come from four places, checked in this order; the first match wins:
 *
 *   1. Account membership — individual account owner, or firm attorney/staff. Firm staff with
 *      `scope = 'assigned_only'` only reach documents assigned to them.
 *   2. Document collaborator — a single-document grant (`editor` / `viewer`), independent of any
 *      account membership.
 *   3. Client — the individual a firm-created document is *about* (`clientUserId`), before/after
 *      they have any membership. They get their own document and nothing else.
 *   4. Bare data-subject fallback — `ownerUserId` matches but no membership row exists yet (e.g.
 *      account backfill hasn't run). Treated as the owner.
 *
 * Permissions:
 *   - `view`            — see the document and its non-sensitive fields
 *   - `edit`            — change field values / answers
 *   - `manage`          — invite/remove collaborators, change status, assign, delete
 *   - `view_sensitive`  — see the SSN/ITIN in plaintext. Granted ONLY to the data subject
 *     (the person the number belongs to). A firm attorney or an invited collaborator never gets
 *     this, even with `manage` — matching the product decision that collaborators never receive
 *     the SSN and must request it through the existing `info_requests` flow.
 */

export type DocPermission = "view" | "edit" | "manage" | "view_sensitive"

export type AccessSource = "account_owner" | "firm_member" | "collaborator" | "client"

export type DocumentRow = typeof documents.$inferSelect

export type DocumentAccess = {
  documentId: string
  userId: string
  source: AccessSource
  /** the role from whichever grant applied: "owner" | "attorney" | "staff" | "viewer" | "editor" | "client" */
  role: string
  permissions: Set<DocPermission>
}

export class AccessError extends Error {
  constructor(
    public status: 403 | 404,
    message: string,
  ) {
    super(message)
    this.name = "AccessError"
  }
}

const FIRM_MANAGE_ROLES = ["owner", "attorney"]
const FIRM_EDIT_ROLES = ["owner", "attorney", "staff"]

export async function getDocumentRow(documentId: string): Promise<DocumentRow | null> {
  const [row] = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1)
  return row ?? null
}

/** Is `userId` the person this document's tax/equity info is about? Individual filings: the owner.
 *  Firm filings: the client. This is the only identity that unlocks `view_sensitive`. */
function isDataSubject(userId: string, doc: DocumentRow): boolean {
  return userId === doc.ownerUserId || userId === doc.clientUserId
}

export type MembershipInput = Pick<typeof accountMemberships.$inferSelect, "role" | "scope" | "status"> | null
export type CollaboratorInput = Pick<typeof documentCollaborators.$inferSelect, "role" | "status"> | null

/**
 * Pure access-derivation: given the document, the user, and the two grant rows that may exist for
 * them (an account membership on the document's account, and a document-collaborator row), work
 * out what they may do. No I/O — every branch is unit-tested in scripts/test-permissions.ts.
 * `resolveDocumentAccess` is the thin wrapper that loads the two rows and calls this.
 */
export function deriveDocumentAccess(
  userId: string,
  doc: DocumentRow,
  membership: MembershipInput,
  collaborator: CollaboratorInput,
): DocumentAccess | null {
  const dataSubject = isDataSubject(userId, doc)

  // 1. Account membership (individual owner or firm staff).
  if (membership && membership.status === "active") {
    const inScope = membership.scope === "all_clients" || doc.assignedToUserId === userId
    if (inScope) {
      const permissions = new Set<DocPermission>(["view"])
      if (FIRM_EDIT_ROLES.includes(membership.role)) permissions.add("edit")
      if (FIRM_MANAGE_ROLES.includes(membership.role)) permissions.add("manage")
      if (dataSubject) permissions.add("view_sensitive")
      return {
        documentId: doc.id,
        userId,
        source: doc.ownerUserId === userId && membership.role === "owner" ? "account_owner" : "firm_member",
        role: membership.role,
        permissions,
      }
    }
    // A member who is out of scope for this document falls through — a collaborator grant or
    // being the client can still let them in.
  }

  // 2. Document collaborator.
  if (collaborator && collaborator.status === "active") {
    const permissions = new Set<DocPermission>(["view"])
    if (collaborator.role === "editor") permissions.add("edit")
    if (dataSubject) permissions.add("view_sensitive")
    return { documentId: doc.id, userId, source: "collaborator", role: collaborator.role, permissions }
  }

  // 3. Client of a firm-created document, with no membership/collaborator row.
  if (userId === doc.clientUserId) {
    return {
      documentId: doc.id,
      userId,
      source: "client",
      role: "client",
      permissions: new Set<DocPermission>(["view", "edit", "view_sensitive"]),
    }
  }

  // 4. Bare data-subject fallback — owner of an individual filing whose account membership row
  //    isn't there yet.
  if (userId === doc.ownerUserId) {
    return {
      documentId: doc.id,
      userId,
      source: "account_owner",
      role: "owner",
      permissions: new Set<DocPermission>(["view", "edit", "manage", "view_sensitive"]),
    }
  }

  return null
}

/** Resolves what `userId` may do with an already-loaded document row, or null for no access. */
export async function resolveDocumentAccess(userId: string, doc: DocumentRow): Promise<DocumentAccess | null> {
  const [membership] = await db
    .select()
    .from(accountMemberships)
    .where(
      and(
        eq(accountMemberships.accountId, doc.accountId),
        eq(accountMemberships.userId, userId),
        eq(accountMemberships.status, "active"),
      ),
    )
    .limit(1)

  const [collaborator] = await db
    .select()
    .from(documentCollaborators)
    .where(
      and(
        eq(documentCollaborators.documentId, doc.id),
        eq(documentCollaborators.userId, userId),
        eq(documentCollaborators.status, "active"),
      ),
    )
    .limit(1)

  return deriveDocumentAccess(userId, doc, membership ?? null, collaborator ?? null)
}

/** Boolean check — use in conditionals (e.g. whether to show a button). */
export async function canAccessDocument(
  userId: string,
  documentId: string,
  permission: DocPermission,
): Promise<boolean> {
  const doc = await getDocumentRow(documentId)
  if (!doc) return false
  const access = await resolveDocumentAccess(userId, doc)
  return !!access && access.permissions.has(permission)
}

/**
 * Gate a route/action: returns the document row + resolved access, or throws `AccessError`.
 * A denial is always written to the audit log. Returns 404 (not 403) when the user has no access
 * at all, so document existence isn't leaked; 403 only when they have *some* access but not the
 * level required.
 */
export async function assertDocumentAccess(
  userId: string,
  documentId: string,
  permission: DocPermission,
): Promise<{ doc: DocumentRow; access: DocumentAccess }> {
  const doc = await getDocumentRow(documentId)
  if (!doc) throw new AccessError(404, "Document not found")

  const access = await resolveDocumentAccess(userId, doc)
  if (!access || !access.permissions.has(permission)) {
    await logAudit({
      action: "access_denied",
      actorUserId: userId,
      accountId: doc.accountId,
      documentId: doc.id,
      metadata: {
        requiredPermission: permission,
        grantedPermissions: access ? [...access.permissions] : [],
        source: access?.source ?? null,
      },
    })
    throw new AccessError(access ? 403 : 404, access ? "Insufficient permission" : "Document not found")
  }

  return { doc, access }
}

/**
 * Every document `userId` can currently see — backs the collaborator's "shared with me" list and
 * the firm dashboard roster. Honors firm `assigned_only` scope. Deduped by document id.
 */
export async function listAccessibleDocuments(userId: string): Promise<DocumentRow[]> {
  const memberships = await db
    .select()
    .from(accountMemberships)
    .where(and(eq(accountMemberships.userId, userId), eq(accountMemberships.status, "active")))

  const allClientAccountIds = memberships.filter((m) => m.scope === "all_clients").map((m) => m.accountId)
  const assignedOnlyAccountIds = memberships.filter((m) => m.scope === "assigned_only").map((m) => m.accountId)

  const collabRows = await db
    .select({ documentId: documentCollaborators.documentId })
    .from(documentCollaborators)
    .where(and(eq(documentCollaborators.userId, userId), eq(documentCollaborators.status, "active")))
  const collabDocIds = collabRows.map((r) => r.documentId)

  const byId = new Map<string, DocumentRow>()
  const add = (rows: DocumentRow[]) => rows.forEach((r) => byId.set(r.id, r))

  if (allClientAccountIds.length) {
    add(await db.select().from(documents).where(inArray(documents.accountId, allClientAccountIds)))
  }
  if (assignedOnlyAccountIds.length) {
    add(
      await db
        .select()
        .from(documents)
        .where(and(inArray(documents.accountId, assignedOnlyAccountIds), eq(documents.assignedToUserId, userId))),
    )
  }
  if (collabDocIds.length) {
    add(await db.select().from(documents).where(inArray(documents.id, collabDocIds)))
  }
  // Documents the user is the client or bare owner of, with no membership row.
  add(await db.select().from(documents).where(eq(documents.clientUserId, userId)))
  add(await db.select().from(documents).where(eq(documents.ownerUserId, userId)))

  return [...byId.values()]
}

/** Convenience: record that a user opened a document (one entry per open, not per API read). */
export async function recordDocumentView(userId: string, doc: DocumentRow, source: AccessSource): Promise<void> {
  await logAudit({
    action: "viewed",
    actorUserId: userId,
    accountId: doc.accountId,
    documentId: doc.id,
    metadata: { source },
  })
}
