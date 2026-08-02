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
  /** for "named"/"officer" slots, the name already printed in the document for this party — sent
   *  to the public page to pre-fill the name field (the recipient can still edit it) */
  lockedName: text("locked_name"),
  /** extra single-line fields (e.g. ["Address", "Email"]) this slot's execution block leaves
   *  blank beyond Name/Title/Date — computed at send time (see findBlankFieldLabels) so the public
   *  sign page knows to prompt the recipient for them. */
  requiredFields: jsonb("required_fields"),
  status: text("status").notNull().default("sent"), // "sent" | "viewed" | "signed"
  signerName: text("signer_name"),
  signerRoles: jsonb("signer_roles"),
  /** the recipient's values for `requiredFields`, e.g. { "Address": "123 Main St", "Email": "..." } —
   *  folded into the signer's DocSignature.extraFields once the request comes back signed. */
  fields: jsonb("fields"),
  signatureDataUrl: text("signature_data_url"),
  signerIp: text("signer_ip"),
  signedAt: timestamp("signed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("signature_requests_owner_idx").on(table.ownerId),
])

/** A single sensitive value (e.g. an SSN/ITIN) collected directly from a third party — not the
 *  document owner — via a public, token-based link, so the value never passes through the
 *  owner's browser or chat transcript. See lib/crypto.ts and app/provide-info/[token]. */
export const infoRequests = pgTable("info_requests", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  ownerId: text("owner_id").notNull(),
  /** the static catalog id (e.g. "ein", "83b") this value belongs to */
  docId: text("doc_id").notNull(),
  docTitle: text("doc_title").notNull(),
  /** the ComplianceField.name this fulfills, e.g. "ssn" or "taxpayerTin" */
  fieldName: text("field_name").notNull(),
  fieldLabel: text("field_label").notNull(),
  recipientName: text("recipient_name"),
  recipientEmail: text("recipient_email").notNull(),
  status: text("status").notNull().default("sent"), // "sent" | "viewed" | "fulfilled"
  /** AES-256-GCM ciphertext from lib/crypto.ts's encryptSensitive — null until fulfilled. Only
   *  ever decrypted for the verified owner, in app/api/info-requests/[id]/reveal/route.ts. */
  encryptedValue: text("encrypted_value"),
  fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("info_requests_owner_idx").on(table.ownerId),
])

/** Encrypted, account-scoped backup of a `sensitive` compliance field's real value (e.g. an
 *  SSN/ITIN) — extends the sessionStorage-only handling in lib/sensitive-session-store.ts (same
 *  browser tab only) to survive across days/devices for a signed-in account, without keeping the
 *  value indefinitely: a row here is deleted the moment its document is signed or downloaded (see
 *  app/api/sensitive-fields/route.ts and lib/sensitive-server-store.ts's callers), so at most it
 *  outlives the gap between filling in a filing and finishing it. */
export const sensitiveFieldValues = pgTable("sensitive_field_values", {
  userId: text("user_id").notNull(),
  /** the static catalog id (e.g. "ein", "83b") this value belongs to */
  docId: text("doc_id").notNull(),
  /** the ComplianceField.name this fulfills, e.g. "ssn" or "taxpayerTin" */
  fieldName: text("field_name").notNull(),
  /** AES-256-GCM ciphertext from lib/crypto.ts's encryptSensitive */
  encryptedValue: text("encrypted_value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.docId, table.fieldName] }),
])
