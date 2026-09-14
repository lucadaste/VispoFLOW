import { pgTable, text, jsonb, timestamp, date, index, uniqueIndex, check } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

/**
 * Collaborators + Firm/Lawyer dashboard.
 *
 * These tables sit *alongside* the existing key-value `user_state` store (lib/db-schema.ts) rather
 * than replacing it. Today a "filing" is a sub-object inside a per-user JSONB blob (e.g. the "83b"
 * entry inside `vispo-compliance-state`), addressed only by a static catalog id from lib/flow.ts.
 * That content keeps living where it lives; a `documents` row here is a *relational handle* to one
 * such filing — it gives the filing its own id, an owning `account`, a status, a real deadline
 * date, and something that collaborator/audit rows can point a foreign key at.
 *
 * Resolving a document's content = look up its `ownerUserId` + `storageKey` + `catalogId`, then
 * read/write that user's `user_state` blob (permission-checked). See lib/permissions.ts.
 *
 * Enum-ish columns follow the house pattern from db-schema.ts: a plain `text` column with the
 * allowed values listed in a comment, not a Postgres enum (cheaper to evolve).
 */

/* ------------------------------------------------------------------ *
 *  Identity mirror
 * ------------------------------------------------------------------ */

/** Local mirror of Clerk users, kept current by the Clerk webhook (user.created / user.updated /
 *  user.deleted). Lets us resolve an invited email to an existing account, render "Viewing Jane
 *  Doe's 83(b) election" without an API round-trip per row, and — importantly — keep a readable
 *  actor name on historical audit entries after someone is removed from a firm (Phase 7). A
 *  deleted Clerk user is soft-marked here (`deletedAt`), never row-deleted, so audit trails and
 *  `invited_by` references stay intact. */
export const users = pgTable("users", {
  /** Clerk user id (e.g. "user_2ab…") — the same string used as `userId` everywhere else. */
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  imageUrl: text("image_url"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("users_email_idx").on(t.email),
])

/* ------------------------------------------------------------------ *
 *  Accounts + membership
 * ------------------------------------------------------------------ */

/** An individual founder's personal workspace, or a law firm's shared workspace.
 *
 *  - `individual`: created lazily the first time a signed-in user loads the app after this ships.
 *    `personalUserId` is set, `clerkOrgId` is null. Exactly one per user.
 *  - `firm`: mirrors a Clerk Organization one-to-one (`clerkOrgId` set, `personalUserId` null),
 *    created/updated by the Clerk webhook on organization.created / organization.updated. */
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  /** "individual" | "firm" */
  type: text("type").notNull(),
  name: text("name").notNull(),
  /** set iff type = "firm" — the Clerk Organization this account mirrors */
  clerkOrgId: text("clerk_org_id"),
  /** set iff type = "individual" — the Clerk user who owns this personal account */
  personalUserId: text("personal_user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("accounts_clerk_org_idx").on(t.clerkOrgId),
  uniqueIndex("accounts_personal_user_idx").on(t.personalUserId),
  check(
    "accounts_type_shape",
    sql`(${t.type} = 'individual' and ${t.personalUserId} is not null and ${t.clerkOrgId} is null)
     or (${t.type} = 'firm' and ${t.clerkOrgId} is not null and ${t.personalUserId} is null)`,
  ),
])

/** Who belongs to an account and what they can do there.
 *
 *  Account-level roles are distinct from document-level roles (see `documentCollaborators`):
 *   - individual account: the owner is `owner`; an invited advisor who is given whole-account
 *     access (rare — usually they get a single-document invite instead) is `viewer`.
 *   - firm account: `owner` (the founding attorney), `attorney` (full client/document management),
 *     `staff` (same, but pair with `scope = 'assigned_only'` for paralegals who should see only
 *     their own matters). Two tiers to start; add more only if the product owner asks.
 *
 *  `scope` gates the firm dashboard: `all_clients` sees every client under the firm,
 *  `assigned_only` sees only documents where `assignedToUserId` is this user.
 *
 *  For firm accounts, active rows are kept in sync with Clerk org memberships by the webhook;
 *  the `role`/`scope`/`status` columns here are ours and survive that sync. */
export const accountMemberships = pgTable("account_memberships", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  userId: text("user_id").notNull(),
  /** "owner" | "attorney" | "staff" | "viewer" */
  role: text("role").notNull(),
  /** "all_clients" | "assigned_only" */
  scope: text("scope").notNull().default("all_clients"),
  /** "active" | "pending" | "revoked" */
  status: text("status").notNull().default("active"),
  invitedByUserId: text("invited_by_user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
}, (t) => [
  uniqueIndex("account_memberships_account_user_idx").on(t.accountId, t.userId),
  index("account_memberships_user_idx").on(t.userId),
])

/* ------------------------------------------------------------------ *
 *  Documents
 * ------------------------------------------------------------------ */

/** A relational handle to one filing. The filing's field values still live in a `user_state`
 *  blob; this row is the id everything else points at, plus the metadata the firm dashboard
 *  needs (status, deadline, assignment).
 *
 *  Ownership / content location:
 *   - individual filing: `accountId` = the founder's personal account, `ownerUserId` = that
 *     founder, `clientUserId` / `clientEmail` null. One row per (account, catalogId).
 *   - firm filing on behalf of a client: `accountId` = the firm, `ownerUserId` = null until the
 *     client onboards (then the client), `clientEmail` set from creation, `clientUserId` set once
 *     the invite is accepted, `assignedToUserId` = the responsible attorney/staffer. A firm can
 *     have many rows with the same `catalogId` — one per client. */
export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  /** static catalog id from lib/flow.ts (e.g. "83b", "coi", "ein") */
  catalogId: text("catalog_id").notNull(),
  /** snapshot of the catalog title at creation — denormalized so dashboards/audit don't depend
   *  on the catalog staying stable */
  title: text("title").notNull(),
  /** which surface the filing belongs to: "incorporation" | "compliance" | "transactions" */
  surface: text("surface").notNull(),
  /** the `user_state` key whose blob holds this filing's content, e.g. "vispo-compliance-state" */
  storageKey: text("storage_key").notNull(),
  /** whose `user_state` blob holds the live content — null for a firm-created doc whose client
   *  has not onboarded yet */
  ownerUserId: text("owner_user_id"),
  /** firm only: the attorney/staff member responsible for this matter */
  assignedToUserId: text("assigned_to_user_id"),
  /** firm only: the individual the document is about, once they have a Clerk account */
  clientUserId: text("client_user_id"),
  /** firm only: the client's email, known before they register */
  clientEmail: text("client_email"),
  /** "draft" | "awaiting_client_info" | "awaiting_review" | "ready_to_sign" | "signed" | "filed" */
  status: text("status").notNull().default("draft"),
  /** the grant/trigger date a deadline is computed from (83(b): stock grant date) */
  grantDate: date("grant_date"),
  /** stored, not computed on read: filled where a real date exists (83(b) = grantDate + 30d;
   *  a few filings with fixed calendar dates). Null for filings whose deadline is prose only
   *  ("annually", "before opening a bank account"). */
  deadlineDate: date("deadline_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("documents_account_idx").on(t.accountId),
  index("documents_owner_idx").on(t.ownerUserId),
  index("documents_assigned_idx").on(t.assignedToUserId),
  index("documents_client_idx").on(t.clientUserId),
  index("documents_deadline_idx").on(t.deadlineDate),
  /** one filing per catalog id for an individual account; firm rows (which carry a client) are
   *  exempt so a firm can hold many "83b" documents */
  uniqueIndex("documents_individual_catalog_idx")
    .on(t.accountId, t.catalogId)
    .where(sql`${t.clientUserId} is null and ${t.clientEmail} is null`),
])

/* ------------------------------------------------------------------ *
 *  Invitations (single mechanism, two targets)
 * ------------------------------------------------------------------ */

/** Every pending invite — "share my document with my lawyer", "firm adds an attorney to the
 *  team", "firm invites a client to complete intake" — is one row here. Exactly one of
 *  `accountId` / `documentId` is set; that is what the invite grants access to. On acceptance we
 *  create the matching `accountMemberships` or `documentCollaborators` row and set `status`.
 *
 *  This deliberately merges what the plan drew as two entities (Invitation + DocumentCollaborator
 *  each carrying a token). One token lifecycle, one "resend / revoke / expire" code path;
 *  `documentCollaborators` / `accountMemberships` hold only *granted* access, no token. */
export const invitations = pgTable("invitations", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  invitedByUserId: text("invited_by_user_id").notNull(),
  /** account-level invite (firm team member, or firm→client workspace) */
  accountId: text("account_id"),
  /** document-level invite (a single-filing collaborator) */
  documentId: text("document_id"),
  /** role to grant on acceptance — account roles ("attorney"/"staff"/"viewer") or document roles
   *  ("editor"/"viewer") depending on the target */
  role: text("role").notNull(),
  /** for account invites only: "all_clients" | "assigned_only" */
  scope: text("scope"),
  token: text("token").notNull().unique(),
  /** "pending" | "accepted" | "declined" | "expired" | "revoked" */
  status: text("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  acceptedByUserId: text("accepted_by_user_id"),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("invitations_email_idx").on(t.email),
  index("invitations_account_idx").on(t.accountId),
  index("invitations_document_idx").on(t.documentId),
  check(
    "invitations_one_target",
    sql`(${t.accountId} is not null) <> (${t.documentId} is not null)`,
  ),
  /** at most one live invite per (email, target) — a repeat invite updates/resends this row
   *  instead of stacking a duplicate (Phase 7 edge case) */
  uniqueIndex("invitations_pending_account_idx")
    .on(t.email, t.accountId)
    .where(sql`${t.status} = 'pending' and ${t.accountId} is not null`),
  uniqueIndex("invitations_pending_document_idx")
    .on(t.email, t.documentId)
    .where(sql`${t.status} = 'pending' and ${t.documentId} is not null`),
])

/** A *granted* single-document access grant (the accepted end state of a document-scoped
 *  invitation). Independent of account membership: a collaborator reaches exactly the documents
 *  they hold a row for, nothing else. Revoking flips `status` to "revoked" and the permissions
 *  layer denies on the next request — the row is kept for the audit trail. */
export const documentCollaborators = pgTable("document_collaborators", {
  id: text("id").primaryKey(),
  documentId: text("document_id").notNull(),
  userId: text("user_id").notNull(),
  /** "editor" | "viewer" */
  role: text("role").notNull(),
  /** "active" | "revoked" */
  status: text("status").notNull().default("active"),
  invitedByUserId: text("invited_by_user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
}, (t) => [
  uniqueIndex("document_collaborators_doc_user_idx").on(t.documentId, t.userId),
  index("document_collaborators_user_idx").on(t.userId),
])

/* ------------------------------------------------------------------ *
 *  Audit log
 * ------------------------------------------------------------------ */

/** Append-only record of every state-changing action on a document or membership, plus
 *  document *access* where we choose to log it. Written from the start, not bolted on later.
 *
 *  `metadata` is JSON context (old/new status, invited email, field name that changed, …). It
 *  MUST NOT contain SSN/ITIN or any value from a `sensitive` field — writers pass field *names*,
 *  never field values. Rows are never deleted when a user is removed from an account.
 *
 *  `action` (not exhaustive): "document_created", "viewed", "edited_field", "status_changed",
 *  "invited_user", "invite_accepted", "invite_revoked", "removed_user", "downloaded", "signed",
 *  "sensitive_value_requested", "sensitive_value_revealed", "access_denied". */
export const auditLog = pgTable("audit_log", {
  id: text("id").primaryKey(),
  accountId: text("account_id"),
  documentId: text("document_id"),
  /** null for system-initiated actions (e.g. lazy expiry of an invitation) */
  actorUserId: text("actor_user_id"),
  action: text("action").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("audit_log_account_idx").on(t.accountId),
  index("audit_log_document_idx").on(t.documentId),
  index("audit_log_actor_idx").on(t.actorUserId),
  index("audit_log_created_idx").on(t.createdAt),
])
