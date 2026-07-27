import { pgTable, text, jsonb, timestamp, primaryKey, index } from "drizzle-orm/pg-core"

export const userState = pgTable("user_state", {
  userId: text("user_id").notNull(),
  key: text("key").notNull(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.key] }),
])

/** A document sent by its owner to an outside party's email for e-signature via a public,
 *  token-based link (no VispoFLOW account required for the recipient). */
export const signatureRequests = pgTable("signature_requests", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  ownerId: text("owner_id").notNull(),
  /** the static catalog id (e.g. "coi") — used to merge a completed request back into the
   *  owner's signedDocs dictionary the same way a self-signed doc is recorded */
  docId: text("doc_id").notNull(),
  docTitle: text("doc_title").notNull(),
  /** snapshot of the rendered document text at send time, so it can't drift if the owner
   *  later edits company data */
  docContent: text("doc_content").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  recipientName: text("recipient_name"),
  /** which signer slot this request targets (see lib/document-signers.ts) — null on requests
   *  created before multi-signer support, which are treated as the default "officer" slot */
  slotId: text("slot_id"),
  slotLabel: text("slot_label"),
  /** for "named"/"officer" slots, the exact name the recipient must sign as — sent to the public
   *  page so the name field can be pre-filled and locked, guaranteeing correct line placement */
  lockedName: text("locked_name"),
  status: text("status").notNull().default("sent"), // "sent" | "viewed" | "signed"
  signerName: text("signer_name"),
  signerRoles: jsonb("signer_roles"),
  signatureDataUrl: text("signature_data_url"),
  signerIp: text("signer_ip"),
  signedAt: timestamp("signed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("signature_requests_owner_idx").on(table.ownerId),
])
