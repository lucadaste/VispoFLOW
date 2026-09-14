# Collaborators + Firm/Lawyer Dashboard

Status tracker for the multi-phase build. Schema and rules live in code; this file is the map.

## What this adds

1. **Collaborators** — a filing's owner invites another person (lawyer, accountant, co-founder)
   to view or edit that one filing.
2. **Firm accounts** — a law firm gets an org-level account, manages many clients, tracks each
   client's 83(b) deadline, and invites clients into a firm-controlled workspace to complete
   their part of a filing.

Both use one invitation mechanism pointed at different targets (a document vs. an account).

## Architecture decision: side-by-side, not a rewrite

Today a "filing" is a sub-object inside a per-user JSONB blob in `user_state` (e.g. the `"83b"`
entry inside the `vispo-compliance-state` blob), addressed only by a static catalog id from
`lib/flow.ts`. That does not change.

`lib/collab-schema.ts` adds relational tables *alongside* `user_state`. A `documents` row is a
**handle** to one filing: it gives the filing an id, an owning `account`, a status, a real
deadline date, and a foreign-key target for collaborator/audit rows. To read a document's
content: look up `ownerUserId` + `storageKey` + `catalogId`, then read/write that user's
`user_state` blob — permission-checked (Phase 2).

## Confirmed product decisions

| # | Decision |
|---|----------|
| 1 | Firm accounts mirror **Clerk Organizations** (webhook-synced identity + membership); our own `role` / `scope` / `status` columns layer on top. |
| 2 | Every signed-in user gets an `individual` account **created lazily** on first app load after ship. |
| 3 | A `documents` row is created when a filing is **started or resumed**; a one-time backfill covers filings already in progress. |
| 4 | `deadlineDate` is stored **only where a real date exists** (83(b) = grantDate + 30d; a few fixed-calendar filings). Prose deadlines stay null. |
| 5 | Non-owner collaborators **never receive the SSN**. Reuse the existing `info_requests` single-value secure-link flow; the request is audit-logged. |
| 6 | Build for **dozens of firms, hundreds of clients each**: indexes now, sortable roster + deadline filter, no pagination yet. |

## Email

All mail goes through Resend from a single hard-coded sender in `lib/email.ts`
(`onboarding@resend.dev`), which only delivers to the Resend account owner. **Blocked on a
verified sending domain** (coming from the user). Until then: invites show a copy-link button and
work without email. Fix = verify a GoDaddy domain in Resend, move the sender to
`RESEND_FROM_ADDRESS`, done — unblocks the existing signature/info emails too.

## Deviation from the original plan

- Plan drew `Invitation` **and** `DocumentCollaborator` as separate entities each carrying a
  token. Collapsed: `invitations` owns the whole token lifecycle (create / resend / revoke /
  expire) for both targets; `documentCollaborators` and `accountMemberships` hold only *granted*
  access (no token). One code path.
- Added a `users` table (Clerk mirror) the plan implied but didn't list — needed to resolve
  invited emails, render names without per-row API calls, and keep audit actor names after a
  user is removed.

## Post-Phase-7 polish (from the "what would make it better" list)

- [x] **Status buttons in the dashboard** — `lib/documents.ts`'s `nextStatusOptions` (server-side
      source of truth for allowed transitions) is now returned per row from `GET
      /api/firm/clients`; `components/firm-dashboard.tsx`'s `StatusCell` renders a select offering
      exactly those options for owners/attorneys, plain text for everyone else.
- [x] **Remove a client from the roster** — `lib/documents.ts`'s `removeClientDocument` +
      `DELETE /api/firm/clients/[documentId]`. Deletes the `documents` pointer/invite, never the
      client's actual filing data (that lives in their own `user_state` blob regardless). Confirmed
      via `ConfirmModal` in the UI.
- [x] **Client-side framing** — `components/client-context-banner.tsx`, mounted above
      `IncorporationApp` in `app/app/page.tsx`: a firm's client sees "You're completing X for your
      law firm — N days left" right at the top. Lighter than the plan's full "scoped view, only
      the fields they need" — this is clear framing without restricting navigation; full scoping
      would mean hiding Incorporation/Transactions and the rest of the compliance catalog for a
      client, a larger change not done here.
- [ ] **Sharing beyond compliance filings** — collaborators/firm-clients only work for compliance
      items (83b, EIN, etc.) today; incorporation and transaction documents aren't shareable.
      `/api/documents/ensure` is already surface-agnostic, but there's no `findTransactionItem`-
      style lookup or confirmed blob-shape match for those surfaces to wire the UI trigger up
      safely — still open.
- [ ] **Real email delivery** — blocked on the user's GoDaddy domain being verified in Resend.
- [ ] **Clerk webhook** — not yet configured in the Clerk dashboard (`CLERK_WEBHOOK_SIGNING_SECRET`
      unset); the lazy-provisioning-on-deliberate-action fallback covers this in the meantime.

## Phases

- [x] **Phase 0** — discovery (see findings in chat history / this file).
- [x] **Phase 1** — schema: `lib/collab-schema.ts`, migration `drizzle/0000_high_epoch.sql`
      (baseline; existing tables guarded with `IF NOT EXISTS`). Applied to the Neon dev DB.
- [x] **Phase 2** — permissions + audit + accounts:
      - `lib/permissions.ts` — `deriveDocumentAccess` (pure, unit-tested) + `resolveDocumentAccess`
        (loads grants) + `canAccessDocument` / `assertDocumentAccess` (route gate, logs denials) +
        `listAccessibleDocuments` (roster / "shared with me").
      - `lib/audit.ts` — `logAudit` (never throws; scrubs SSN-shaped strings & sensitive keys).
      - `lib/accounts.ts` — `ensureIndividualAccount` (lazy, race-safe) + membership lookups.
      - `scripts/test-permissions.ts` (`npm run test:permissions`) — 18 cases, all green.
      - Permissions: `view` / `edit` / `manage` / `view_sensitive`. `view_sensitive` (the SSN) goes
        ONLY to the data subject — never a firm attorney or a collaborator.
      - Audit volume: denials + mutations always; successful reads only on explicit document *open*.
      - Not retrofitted onto the legacy `sign-requests` / `info-requests` / `sensitive-fields` /
        `state` routes (they predate the `documents` table and still work). New Phase 4/5 routes
        use this layer; unifying the old ones is a later cleanup.
- [x] **Phase 3** — invitation lifecycle:
      - `lib/invitations.ts` — `createInvitation` (doc or account target; refreshes an existing
        pending invite instead of duplicating), `getInvitationDetails`, `acceptInvitation`,
        `declineInvitation`, `resendInvitation`, `revokeInvitation`, list helpers. Lazy expiry on
        every read. `computeExpiry`: 7 days, or `clamp(deadline − 2d, [1d, 7d])` capped at the
        deadline for client invites on a deadline-bearing filing.
      - `lib/collaborators.ts` — `getDocumentSharing`, `revokeDocumentCollaborator`,
        `revokeAccountMembership`. Revoke = flip `status`; effective on the next request because
        the permissions layer re-reads status every check.
      - `lib/users.ts` — Clerk-user mirror (`syncCurrentUser`, `upsertUser`, `getUsers`).
      - `lib/email.ts` — `sendInvitationEmail`; `FROM_ADDRESS` now reads `RESEND_FROM_ADDRESS`.
      - `lib/api-errors.ts` — `errorResponse` maps `AccessError` / `InvitationError` to HTTP.
      - Routes: `POST/GET /api/invitations`, `POST /api/invitations/[id]/resend|revoke`,
        `GET/POST /api/invitations/accept/[token]`, `POST /api/invitations/decline/[token]`,
        `GET /api/documents/[id]/collaborators`, `DELETE …/collaborators/[userId]`.
      - Accept page: `app/invite/[token]` (server + client). Signed-out → Clerk modal, returns to
        the same URL; signed-in → Accept/Decline, with an email-mismatch notice.
      - `next build` clean; permission tests still green.
      - Deferred: accepting a *firm* account invite writes our `accountMemberships` row but does
        not yet add the user to the Clerk org (Phase 5, where the firm flow is Clerk-org-driven).
        Document invites can't be exercised end-to-end until Phase 4 creates `documents` rows.
- [~] **Phase 4** — individual collaborators UI. Backend + panel done; big-component wiring pending.
      - `lib/documents.ts` — `ensureDocument` (lazy account + row, idempotent), `syncDocumentFromFiling`,
        `computeDeadlineDate` (83b = grantDate + 30d), `backfillDocumentsForUser` (parses persisted
        blobs, safe to re-run).
      - Routes: `POST /api/documents/ensure`, `GET /api/documents` (accessible list + urgency, for
        roster / "shared with me"), `GET /api/documents/[id]` (one + resolved access + subject
        name, `?view=1` logs a view), `POST /api/documents/backfill`.
      - `components/collaborators-panel.tsx` — self-contained. List + invite (email + Editor/Viewer)
        + resend/revoke/remove (with confirm). Shows the invite link inline when email isn't
        configured. Drops in with just `documentId`.
      - Edit 1 (done): `lib/sync-documents.ts` + effects in `compliance-view.tsx` — `ensureDocumentRow`
        for each filing + `backfillDocumentRows` once after sign-in. Only `grantDate` is sent, never
        sensitive values.
      - Edit 2 (done): `ViewerCollaborators` strip in `DocumentViewer` (`document-library.tsx`) —
        persistent "Shared with N people" / "Not shared" banner + collapsible `<CollaboratorsPanel bare>`.
        Compliance filings only (they're the ones with a `documents` row wired).
      - Edit 3 (deferred to Phase 5): the invited collaborator has no way to *open* a shared filing
        yet — the Library only lists the user's own filings. This needs a "Shared with me" surface +
        a permissioned `GET /api/documents/[id]/content` that reads the owner's blob and masks
        sensitive fields server-side + the role header. This is the same problem as Phase 5's client
        scoped view (viewing a filing that isn't in your own browser state), so build them together.
- [~] **Phase 5** — firm dashboard. Core (roster + deadlines + client invite + team) done; the
      shared read-only viewer + client scoped experience remain.
      - `app/api/webhooks/clerk/route.ts` — `verifyWebhook` (`CLERK_WEBHOOK_SIGNING_SECRET`); syncs
        `users`, firm `accounts`, `account_memberships` from user.* / organization.* /
        organizationMembership.* events. Owner is set from `organization.created.created_by`.
      - `lib/accounts.ts` `ensureFirmAccount` — lazy firm-account creation (mirrors Clerk org),
        so the dashboard works before the webhook is wired.
      - `lib/firm.ts` — `requireFirmContext` (from `auth().orgId`), `listFirmDocuments` (honors
        `assigned_only`), `listFirmMembers`, deadline helpers.
      - `lib/documents.ts` — `createClientDocument` (firm creates a filing for a not-yet-registered
        client), `attachClientToDocument` (on invite accept: sets clientUserId + ownerUserId),
        `transitionDocumentStatus` + `canTransition` (explicit pipeline, audited).
      - `lib/invitations.ts` — document role `"client"`: on accept, sets `documents.clientUserId`
        instead of a collaborator row → client reaches exactly their own filing.
      - Routes: `GET /api/firm`, `GET/POST /api/firm/clients` (roster / add+invite),
        `GET /api/firm/team`, `GET /api/documents/[id]/content` (shared render, **SSN masked
        server-side** for non-`view_sensitive` viewers + lists hidden field labels),
        `POST /api/documents/[id]/status`.
      - `app/firm` + `components/firm-dashboard.tsx` — org gate (`OrganizationSwitcher` /
        `CreateOrganization`), roster table (client · filing · grant date · deadline pill
        red/amber/green · status · assignee, sorted by soonest deadline), "due within 7 days"
        banner, add-client form, team list + invite (role + scope).
      - "Shared with me" ✓: `app/shared` (list) + `app/shared/[id]` (read-only viewer) —
        `components/shared-documents.tsx` / `shared-document-viewer.tsx`. Role header, status +
        deadline, hidden-field chips with a "Request" nudge (`POST …/request-sensitive`, email-only,
        audited, never auto-reveals). This is also deferred Edit 3 for individual collaborators —
        same screen serves both. Invite acceptance now routes here (`/shared/[documentId]`) or to
        `/firm` for account invites; firm roster rows link to it too.
      - Nav ✓: `components/top-bar.tsx` — a "Shared with me" icon-link (badge = count, fetched once
        on sign-in) and a "Firm Dashboard" icon-link sit next to the theme toggle.
      - **Corrected after initial ship:** being a member of *any* Clerk organization was being
        treated as "is a firm" — a stray/unrelated org membership silently unlocked the full firm
        dashboard for a plain founder. Fixed: `lib/firm.ts`'s `requireFirmContext` is now
        read-only (never creates an `accounts` row); becoming a firm requires the deliberate
        `POST /api/firm/setup` action, reached only via an explicit confirm screen on `/firm`
        ("Use '{org}' as your firm?"). The nav link and the Clerk webhook's membership sync both
        follow the same rule — an org only becomes a firm workspace on purpose, never ambiently.
      - **Hard-enforced founder/firm split** (not just a one-time nudge): `lib/use-account-kind.ts`
        is the shared hook; `components/account-kind-gate.tsx` guards `/app` and
        `components/firm-kind-gate.tsx` guards `/firm`. A "firm"-kind account is redirected out of
        `/app` on every visit, not just asked once; a "founder"-kind account is redirected out of
        `/firm` the same way — neither can reach the other side through the product at all. A
        brand-new user sees the same one-time chooser (`components/account-kind-chooser.tsx`)
        whichever of the two pages they land on first. An *existing* user with prior incorporation
        activity is silently backfilled as "founder." Accepting an invite (`app/invite/[token]`)
        backfills the answer from context (an attorney/staff account invite → firm, anything else
        → founder) without overriding a choice already made. Persisted via the existing
        `user_state` key/value store (`STORAGE_KEYS.accountKind`), no schema change. A founder can
        still invite a specific person to one filing (the collaborators feature) — that's
        document-level sharing, unrelated to this account-level split.
      - Note: an account that was provisioned as a firm *before* this split existed (e.g. from the
        earlier ambient-org-membership bug) keeps that firm membership even if its `accountKind`
        later resolves to "founder" — the Firm Dashboard nav link explicitly hides for a
        founder-kind account to avoid a confusing bounce-back, but the underlying membership row
        isn't cleaned up automatically. Leaving/deleting the stray organization in Clerk removes it.
      - **Remaining:** (1) client's scoped filing experience (an accepted client fills in their
        83(b) through the normal `/app` compliance flow — works, just not visually distinct from a
        founder's own flow); (2) status-change buttons in the dashboard (API done, no UI).
- [x] **Phase 6** — notifications.
      - `lib/notifications.ts` `sendDeadlineReminders()` — the priority per the plan. Scans every
        document with a real `deadlineDate` not yet `signed`/`filed`; two windows (≤7 days, ≤2
        days, ranges not exact-day so a missed run still catches up); dedup tracked via an
        `audit_log` row (`deadline_reminder_sent`, `metadata.window`) rather than a new column.
        Emails the data subject + (for a firm doc) the assigned attorney or firm owner.
      - `app/api/cron/deadline-reminders` + `vercel.json`'s `crons` (daily, 13:00 UTC). Checks
        `Authorization: Bearer $CRON_SECRET` when that env var is set (add it in Vercel once
        deployed — Vercel signs its own cron calls with it automatically).
      - "Invite accepted" email back to the inviter (`lib/invitations.ts`) and "client completed
        their portion" email to the assigned attorney/owner on the `awaiting_review` transition
        (`lib/documents.ts`) — both best-effort, never block the action they're attached to.
      - Skipped per-edit notifications (a collaborator editing a field) — the plan flagged this as
        optional and likely too noisy; not built.
- [x] **Phase 7** — dedicated testing/edge-case pass.
      - **Found & fixed:** `computeExpiry` could mint an *already-expired* invite link when a
        firm onboarded a client after the 83(b) deadline had already passed (grant date + 30d in
        the past) — now falls back to the plain 7-day window instead of locking them out on
        arrival. Covered by `scripts/test-invitations.ts`.
      - **Found & fixed:** `/api/documents/[id]/content` could show the literal placeholder
        string (`"(not saved — reopen this filing to re-enter)"`) as if it were a real value to
        someone *correctly* granted `view_sensitive` (the data subject viewing their own filing
        through the shared route) — it now decrypts from the existing encrypted per-user store
        for that case, same as the rest of the app; everyone else still only ever gets the mask.
      - **Found & fixed:** a race between two concurrent invites for the same (email, target)
        could throw on the partial-unique index instead of resolving to one row — now retries as
        an update, matching the pattern already used for account/document creation.
      - Verified by code review: sensitive values never enter audit metadata or error logs (grepped
        every `logAudit`/`console.error` call site); revoked access/membership rows are never
        deleted (only status-flipped) so audit history survives removal; SSN placeholder text
        never reaches a non-owner.
      - New test suites: `scripts/test-invitations.ts` (expiry, incl. the past-deadline case),
        `scripts/test-documents.ts` (status-pipeline transitions + deadline computation). Run all
        three with `npm run test:collab`.
      - Not independently re-verified (would need a live DB / multi-session run, not available
        here): the actual duplicate-invite-email UI flow, firm-webhook end-to-end sync, and the
        cron job's real Vercel invocation — these are exercised at the unit/logic level only.

## Applying the migration

```
pnpm db:migrate      # applies drizzle/*.sql via the tracked journal
# or, for a quick dev sync against the schema files:
pnpm db:push
```

The baseline is safe to run against the existing shared Neon DB — every pre-existing table and
index is `CREATE ... IF NOT EXISTS`.
