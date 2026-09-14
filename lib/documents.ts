import { randomUUID } from "crypto"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { userState } from "@/lib/db-schema"
import { documents, accounts, accountMemberships } from "@/lib/collab-schema"
import { ensureIndividualAccount } from "@/lib/accounts"
import { logAudit } from "@/lib/audit"
import { STORAGE_KEYS } from "@/lib/storage-keys"

export type DocumentRow = typeof documents.$inferSelect

/** Which persisted blob a surface's filings live in. */
const SURFACE_STORAGE_KEY: Record<DocumentSurface, string> = {
  incorporation: STORAGE_KEYS.incorporation,
  compliance: STORAGE_KEYS.compliance,
  transactions: STORAGE_KEYS.transactions,
}

export type DocumentSurface = "incorporation" | "compliance" | "transactions"

export type DocumentStatus =
  | "draft"
  | "awaiting_client_info"
  | "awaiting_review"
  | "ready_to_sign"
  | "signed"
  | "filed"

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * The 83(b) election must be filed within 30 days of the stock grant — the one hard, computable
 * deadline in the catalog. Everything else has a prose deadline ("annually", "before opening a
 * bank account") and gets a null `deadlineDate` until/unless a real date is derivable.
 */
export function computeDeadlineDate(catalogId: string, values: Record<string, string> | null | undefined): string | null {
  if (catalogId === "83b" && values?.grantDate) {
    const grant = new Date(values.grantDate)
    if (!Number.isNaN(grant.getTime())) {
      return new Date(grant.getTime() + 30 * DAY_MS).toISOString().slice(0, 10)
    }
  }
  return null
}

function grantDateFor(catalogId: string, values: Record<string, string> | null | undefined): string | null {
  if (catalogId === "83b" && values?.grantDate) {
    const d = new Date(values.grantDate)
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  }
  return null
}

/**
 * Ensures a `documents` row exists for one of a signed-in user's own filings, creating their
 * individual account and the row on first call. Idempotent — the partial unique index on
 * (account_id, catalog_id) for client-less rows guarantees at most one per filing.
 *
 * `values` (when known) lets the row's `grantDate` / `deadlineDate` be filled at creation; call
 * `syncDocumentFromFiling` afterwards whenever the filing's values or status change.
 */
export async function ensureDocument(input: {
  userId: string
  catalogId: string
  surface: DocumentSurface
  title: string
  values?: Record<string, string> | null
  ownerName?: string
}): Promise<DocumentRow> {
  const account = await ensureIndividualAccount(input.userId, input.ownerName)

  const existing = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.accountId, account.id),
        eq(documents.catalogId, input.catalogId),
        eq(documents.ownerUserId, input.userId),
      ),
    )
    .limit(1)
  if (existing[0]) return existing[0]

  const grantDate = grantDateFor(input.catalogId, input.values)
  const deadlineDate = computeDeadlineDate(input.catalogId, input.values)

  try {
    const [created] = await db
      .insert(documents)
      .values({
        id: randomUUID(),
        accountId: account.id,
        catalogId: input.catalogId,
        title: input.title,
        surface: input.surface,
        storageKey: SURFACE_STORAGE_KEY[input.surface],
        ownerUserId: input.userId,
        status: "draft",
        grantDate,
        deadlineDate,
      })
      .returning()

    await logAudit({
      action: "document_created",
      actorUserId: input.userId,
      accountId: account.id,
      documentId: created.id,
      metadata: { catalogId: input.catalogId, surface: input.surface },
    })
    return created
  } catch {
    // Lost a race — the unique index rejected the second insert.
    const [row] = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.accountId, account.id),
          eq(documents.catalogId, input.catalogId),
          eq(documents.ownerUserId, input.userId),
        ),
      )
      .limit(1)
    if (row) return row
    throw new Error(`could not create document row for ${input.catalogId}`)
  }
}

/** Keeps a document row aligned with its filing's current values/status. No-op if nothing changed. */
export async function syncDocumentFromFiling(input: {
  documentId: string
  actorUserId: string
  values?: Record<string, string> | null
  status?: DocumentStatus
}): Promise<void> {
  const [doc] = await db.select().from(documents).where(eq(documents.id, input.documentId)).limit(1)
  if (!doc) return

  const nextGrant = input.values ? grantDateFor(doc.catalogId, input.values) : doc.grantDate
  const nextDeadline = input.values ? computeDeadlineDate(doc.catalogId, input.values) : doc.deadlineDate
  const nextStatus = input.status ?? (doc.status as DocumentStatus)

  const changed =
    nextGrant !== doc.grantDate || nextDeadline !== doc.deadlineDate || nextStatus !== doc.status
  if (!changed) return

  await db
    .update(documents)
    .set({ grantDate: nextGrant, deadlineDate: nextDeadline, status: nextStatus, updatedAt: new Date() })
    .where(eq(documents.id, doc.id))

  if (nextStatus !== doc.status) {
    await logAudit({
      action: "status_changed",
      actorUserId: input.actorUserId,
      accountId: doc.accountId,
      documentId: doc.id,
      metadata: { from: doc.status, to: nextStatus },
    })
  }
}

/* ------------------------------------------------------------------ *
 *  Firm: a document created on behalf of a not-yet-registered client
 * ------------------------------------------------------------------ */

export async function createClientDocument(input: {
  firmAccountId: string
  createdByUserId: string
  clientEmail: string
  catalogId: string
  surface: DocumentSurface
  title: string
  grantDate?: string | null
  assignedToUserId?: string | null
}): Promise<DocumentRow> {
  const values = input.grantDate ? { grantDate: input.grantDate } : null
  const [created] = await db
    .insert(documents)
    .values({
      id: randomUUID(),
      accountId: input.firmAccountId,
      catalogId: input.catalogId,
      title: input.title,
      surface: input.surface,
      storageKey: SURFACE_STORAGE_KEY[input.surface],
      ownerUserId: null,
      assignedToUserId: input.assignedToUserId ?? null,
      clientEmail: input.clientEmail.trim().toLowerCase(),
      status: "awaiting_client_info",
      grantDate: grantDateFor(input.catalogId, values),
      deadlineDate: computeDeadlineDate(input.catalogId, values),
    })
    .returning()

  await logAudit({
    action: "document_created",
    actorUserId: input.createdByUserId,
    accountId: input.firmAccountId,
    documentId: created.id,
    metadata: { catalogId: input.catalogId, clientEmail: input.clientEmail.trim().toLowerCase(), forClient: true },
  })
  return created
}

/** Links a client to their firm-created document on invite acceptance: from here on their own
 *  `user_state` blob holds the filing's content, so the firm reads it through the content API. */
export async function attachClientToDocument(documentId: string, clientUserId: string): Promise<void> {
  await db
    .update(documents)
    .set({ clientUserId, ownerUserId: clientUserId, updatedAt: new Date() })
    .where(eq(documents.id, documentId))
}

/* ------------------------------------------------------------------ *
 *  Status transitions
 * ------------------------------------------------------------------ */

const STATUS_ORDER: DocumentStatus[] = [
  "draft",
  "awaiting_client_info",
  "awaiting_review",
  "ready_to_sign",
  "signed",
  "filed",
]

/** Allowed next states. Forward moves along the pipeline, plus a few explicit back-steps a firm
 *  realistically needs (send back for more info / re-review). */
const ALLOWED_TRANSITIONS: Record<DocumentStatus, DocumentStatus[]> = {
  draft: ["awaiting_client_info", "awaiting_review"],
  awaiting_client_info: ["awaiting_review", "draft"],
  awaiting_review: ["ready_to_sign", "awaiting_client_info"],
  ready_to_sign: ["signed", "awaiting_review"],
  signed: ["filed", "ready_to_sign"],
  filed: [],
}

export function canTransition(from: DocumentStatus, to: DocumentStatus): boolean {
  return from === to || ALLOWED_TRANSITIONS[from]?.includes(to) === true
}

export async function transitionDocumentStatus(
  actorUserId: string,
  documentId: string,
  to: DocumentStatus,
  origin?: string,
): Promise<{ from: DocumentStatus; to: DocumentStatus }> {
  const [doc] = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1)
  if (!doc) throw new Error("Document not found")
  const from = doc.status as DocumentStatus

  if (!STATUS_ORDER.includes(to)) throw new Error(`Unknown status "${to}"`)
  if (!canTransition(from, to)) throw new Error(`Can't move a filing from "${from}" to "${to}"`)

  if (from !== to) {
    await db.update(documents).set({ status: to, updatedAt: new Date() }).where(eq(documents.id, documentId))
    await logAudit({
      action: "status_changed",
      actorUserId,
      accountId: doc.accountId,
      documentId,
      metadata: { from, to },
    })
    if (to === "awaiting_review" && doc.clientUserId) {
      notifyClientCompleted(doc, origin).catch((err) => console.error("[documents] client-completed email failed", err))
    }
  }
  return { from, to }
}

/** A firm's client just moved their filing to "awaiting_review" — tell whoever's responsible
 *  for it (the assigned attorney, or the firm owner if unassigned). Individual filings have no
 *  one to notify here (the account holder is the one making the transition). Best-effort. */
async function notifyClientCompleted(doc: DocumentRow, origin?: string): Promise<void> {
  const [account] = await db.select().from(accounts).where(eq(accounts.id, doc.accountId)).limit(1)
  if (!account || account.type !== "firm") return

  let recipientId = doc.assignedToUserId
  if (!recipientId) {
    const [owner] = await db
      .select()
      .from(accountMemberships)
      .where(and(eq(accountMemberships.accountId, doc.accountId), eq(accountMemberships.role, "owner")))
      .limit(1)
    recipientId = owner?.userId ?? null
  }
  if (!recipientId || recipientId === doc.clientUserId) return

  const { getUsers, displayName } = await import("@/lib/users")
  const { sendClientCompletedEmail } = await import("@/lib/email")
  const usersById = await getUsers([recipientId, doc.clientUserId!])
  const recipient = usersById.get(recipientId)
  if (!recipient?.email) return

  await sendClientCompletedEmail({
    to: recipient.email,
    recipientName: displayName(recipient),
    clientName: displayName(usersById.get(doc.clientUserId!)),
    docTitle: doc.title,
    appUrl: `${origin ?? ""}/firm`,
  })
}

/* ------------------------------------------------------------------ *
 *  One-time backfill
 * ------------------------------------------------------------------ */

type PersistedBlob = {
  docs?: Record<string, { title?: string; values?: Record<string, string>; signed?: boolean; filed?: boolean; pending?: boolean }>
  completed?: Record<string, boolean>
}

const BLOB_SURFACE: Record<string, DocumentSurface> = {
  [STORAGE_KEYS.incorporation]: "incorporation",
  [STORAGE_KEYS.compliance]: "compliance",
  [STORAGE_KEYS.transactions]: "transactions",
  [STORAGE_KEYS.library]: "compliance",
}

function statusFromDoc(d: { signed?: boolean; filed?: boolean }, completed: boolean): DocumentStatus {
  if (d.filed) return "filed"
  if (d.signed) return "signed"
  if (completed) return "ready_to_sign"
  return "draft"
}

/**
 * Creates `documents` rows for every filing already sitting in a user's persisted blobs, so
 * in-progress work can be shared without the user having to reopen each filing. Safe to re-run.
 */
export async function backfillDocumentsForUser(userId: string): Promise<number> {
  const rows = await db.select().from(userState).where(eq(userState.userId, userId))
  let created = 0

  for (const row of rows) {
    const surface = BLOB_SURFACE[row.key]
    if (!surface) continue
    const blob = row.value as PersistedBlob
    if (!blob?.docs) continue

    for (const [catalogId, d] of Object.entries(blob.docs)) {
      const doc = await ensureDocument({
        userId,
        catalogId,
        surface,
        title: d.title || catalogId,
        values: d.values ?? null,
      })
      const status = statusFromDoc(d, !!blob.completed?.[catalogId])
      await syncDocumentFromFiling({ documentId: doc.id, actorUserId: userId, values: d.values ?? null, status })
      created++
    }
  }
  return created
}
