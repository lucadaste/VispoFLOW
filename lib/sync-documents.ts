/** Client helpers that mirror a filing into its relational `documents` row (see lib/documents.ts).
 *  Fire-and-forget: the server side is idempotent, and a filing must still work if these fail. */

type EnsureArgs = {
  catalogId: string
  surface: "incorporation" | "compliance" | "transactions"
  title: string
  /** Only the deadline-driving date is sent — never SSN or other sensitive field values. */
  grantDate?: string
  status?: "draft" | "awaiting_review" | "ready_to_sign" | "signed" | "filed"
}

// Dedupe within a session: skip a repeat call whose payload hasn't meaningfully changed.
const lastSent = new Map<string, string>()

export function ensureDocumentRow(args: EnsureArgs): void {
  const sig = `${args.status ?? ""}|${args.grantDate ?? ""}|${args.title}`
  if (lastSent.get(args.catalogId) === sig) return
  lastSent.set(args.catalogId, sig)

  fetch("/api/documents/ensure", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  }).catch(() => lastSent.delete(args.catalogId))
}

let backfilled = false

/** Call once after sign-in — creates rows for filings already in the user's blobs. */
export function backfillDocumentRows(): void {
  if (backfilled) return
  backfilled = true
  fetch("/api/documents/backfill", { method: "POST" }).catch(() => {
    backfilled = false
  })
}
