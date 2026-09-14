/**
 * Unit tests for the pure access-derivation in lib/permissions.ts (`deriveDocumentAccess`).
 * No database — every case is a hand-built document row + grant rows. Covers the permission
 * matrix the plan asks for, plus the Phase 7 edge cases that are decidable here (out-of-scope
 * firm staff, revoked grants, individual-owner-who-is-also-a-firm-client).
 *
 * Run with `npm run test:permissions`.
 */
import { deriveDocumentAccess, type DocumentRow, type MembershipInput, type CollaboratorInput, type DocPermission } from "../lib/permissions"

let failures = 0
function check(name: string, got: DocPermission[] | null, want: DocPermission[] | null) {
  const norm = (p: DocPermission[] | null) => (p === null ? "null" : [...p].sort().join(","))
  const g = norm(got)
  const w = norm(want)
  if (g === w) {
    console.log(`  ok   ${name}`)
  } else {
    failures++
    console.log(`  FAIL ${name}\n       got:  ${g}\n       want: ${w}`)
  }
}

function doc(overrides: Partial<DocumentRow>): DocumentRow {
  return {
    id: "doc_1",
    accountId: "acct_1",
    catalogId: "83b",
    title: "83(b) Elections",
    surface: "compliance",
    storageKey: "vispo-compliance-state",
    ownerUserId: null,
    assignedToUserId: null,
    clientUserId: null,
    clientEmail: null,
    status: "draft",
    grantDate: null,
    deadlineDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

const member = (role: string, scope = "all_clients", status = "active"): MembershipInput => ({ role, scope, status })
const collab = (role: string, status = "active"): CollaboratorInput => ({ role, status })

function perms(
  userId: string,
  d: DocumentRow,
  m: MembershipInput,
  c: CollaboratorInput,
): DocPermission[] | null {
  const access = deriveDocumentAccess(userId, d, m, c)
  return access ? [...access.permissions] : null
}

console.log("individual account")
// Owner of their own filing — full access including the SSN.
check(
  "owner sees everything incl. sensitive",
  perms("u_owner", doc({ ownerUserId: "u_owner" }), member("owner"), null),
  ["view", "edit", "manage", "view_sensitive"],
)
// Owner via the bare fallback (no membership row yet).
check(
  "bare owner fallback",
  perms("u_owner", doc({ ownerUserId: "u_owner" }), null, null),
  ["view", "edit", "manage", "view_sensitive"],
)
// A stranger — nothing.
check("stranger has no access", perms("u_rando", doc({ ownerUserId: "u_owner" }), null, null), null)

console.log("document collaborators")
const owned = doc({ ownerUserId: "u_owner" })
check("editor can edit, not manage, not sensitive", perms("u_law", owned, null, collab("editor")), ["view", "edit"])
check("viewer can only view", perms("u_cpa", owned, null, collab("viewer")), ["view"])
check("revoked collaborator has no access", perms("u_law", owned, null, collab("editor", "revoked")), null)
// Collaborator who happens to be the data subject (e.g. a co-founder whose SSN is on the filing).
check(
  "collaborator who is the data subject sees sensitive",
  perms("u_cofounder", doc({ ownerUserId: "u_owner", clientUserId: "u_cofounder" }), null, collab("viewer")),
  ["view", "view_sensitive"],
)

console.log("firm accounts")
const firmDoc = doc({ accountId: "acct_firm", clientEmail: "client@co.com", clientUserId: "u_client", assignedToUserId: "u_att" })
check("firm owner manages, no sensitive", perms("u_boss", firmDoc, member("owner"), null), ["view", "edit", "manage"])
check("firm attorney manages, no sensitive", perms("u_att", firmDoc, member("attorney"), null), ["view", "edit", "manage"])
check("firm staff edits, not manages", perms("u_para", firmDoc, member("staff"), null), ["view", "edit"])
check("firm viewer only views", perms("u_intern", firmDoc, member("viewer"), null), ["view"])
check(
  "assigned_only staff on their assigned doc",
  perms("u_att", firmDoc, member("staff", "assigned_only"), null),
  ["view", "edit"],
)
check(
  "assigned_only staff on someone else's doc — no access",
  perms("u_other", firmDoc, member("staff", "assigned_only"), null),
  null,
)
check(
  "revoked firm member — no access",
  perms("u_att", firmDoc, member("attorney", "all_clients", "revoked"), null),
  null,
)

console.log("client of a firm workspace")
check(
  "client sees only their own doc, incl. sensitive",
  perms("u_client", firmDoc, null, null),
  ["view", "edit", "view_sensitive"],
)
check(
  "client cannot manage",
  deriveDocumentAccess("u_client", firmDoc, null, null)?.permissions.has("manage") ? ["manage"] : [],
  [],
)

console.log("dual role: individual owner who is also a firm's client")
// Their personal filing — full owner rights.
const personal = doc({ accountId: "acct_personal", ownerUserId: "u_dual" })
check("dual user on personal filing", perms("u_dual", personal, member("owner"), null), [
  "view",
  "edit",
  "manage",
  "view_sensitive",
])
// The firm's copy about them — client rights only, no manage.
const firmCopy = doc({ accountId: "acct_firm", clientUserId: "u_dual", clientEmail: "dual@x.com" })
check("dual user on the firm's copy", perms("u_dual", firmCopy, null, null), ["view", "edit", "view_sensitive"])

console.log("")
if (failures) {
  console.log(`${failures} failing case(s)`)
  process.exit(1)
}
console.log("all permission cases pass")
