import { randomUUID } from "crypto"
import { db } from "@/lib/db"
import { auditLog } from "@/lib/collab-schema"

/**
 * Append-only audit trail for the collaborators + firm features. Every state-changing action on a
 * document or a membership goes through `logAudit`. See `lib/collab-schema.ts`'s `auditLog`.
 *
 * Logging volume (the plan asked for a recommendation):
 *   - `access_denied` — always logged, by `assertDocumentAccess` in lib/permissions.ts. Low volume,
 *     high signal.
 *   - mutations (`edited_field`, `status_changed`, `invited_user`, …) — always logged, by the route
 *     that performs them.
 *   - successful reads — NOT logged automatically (an API poll every few seconds would drown the
 *     table). Callers log a single `viewed` entry when a user *opens* a document in the UI.
 */

export type AuditAction =
  | "document_created"
  | "document_deleted"
  | "viewed"
  | "edited_field"
  | "status_changed"
  | "downloaded"
  | "signed"
  | "invited_user"
  | "invite_resent"
  | "invite_revoked"
  | "invite_accepted"
  | "invite_declined"
  | "invite_expired"
  | "collaborator_removed"
  | "member_added"
  | "member_removed"
  | "member_scope_changed"
  | "sensitive_value_requested"
  | "sensitive_value_revealed"
  | "access_denied"

export type AuditEntry = {
  action: AuditAction
  actorUserId?: string | null
  accountId?: string | null
  documentId?: string | null
  /** Free-form context. Runs through `scrubSensitive` before it's written — pass field *names*,
   *  status values, invited emails; never an SSN/ITIN or a `sensitive` field's value. */
  metadata?: Record<string, unknown> | null
}

/** Writes one audit row. Never throws — a failure here must not break the action being recorded. */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await db.insert(auditLog).values({
      id: randomUUID(),
      action: entry.action,
      actorUserId: entry.actorUserId ?? null,
      accountId: entry.accountId ?? null,
      documentId: entry.documentId ?? null,
      metadata: entry.metadata ? scrubSensitive(entry.metadata) : null,
    })
  } catch (err) {
    console.error(`[audit] failed to write ${entry.action}`, err)
  }
}

/** Anything that looks like an SSN/ITIN, or lives under an obviously-sensitive key, is replaced
 *  before it can land in the audit table (or, from there, a log aggregator). Defence in depth —
 *  callers are expected not to pass these in the first place (Phase 7). */
const SSN_LIKE = /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g
const BLOCKED_KEYS = new Set([
  "ssn", "tin", "itin", "taxpayertin", "value", "encryptedvalue", "signaturedataurl", "token",
])

function scrubSensitive(meta: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(meta)) {
    if (BLOCKED_KEYS.has(key.toLowerCase())) {
      out[key] = "[redacted]"
    } else if (typeof value === "string") {
      out[key] = value.replace(SSN_LIKE, "[redacted]")
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = scrubSensitive(value as Record<string, unknown>)
    } else {
      out[key] = value
    }
  }
  return out
}
