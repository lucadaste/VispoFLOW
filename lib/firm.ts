import { auth, clerkClient } from "@clerk/nextjs/server"
import { and, eq, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { documents, accountMemberships } from "@/lib/collab-schema"
import { userState } from "@/lib/db-schema"
import { STORAGE_KEYS } from "@/lib/storage-keys"
import { ensureFirmAccount, getFirmAccountByClerkOrg, getMembership, type Account, type AccountMembership } from "@/lib/accounts"
import { syncCurrentUser } from "@/lib/users"
import { AccessError } from "@/lib/permissions"

export type FirmContext = {
  account: Account
  membership: AccountMembership
  /** true for owner/attorney — can add clients, invite team, change status */
  canManage: boolean
}

/**
 * Resolves the firm the caller is currently acting in, from Clerk's active organization
 * (`auth().orgId`). Read-only — never creates an `accounts` row. Belonging to a Clerk
 * organization is not by itself "being a firm": that would let *any* org someone happens to be
 * in (a stray test org, an unrelated Clerk org they were added to for something else) silently
 * unlock the firm dashboard. Becoming a firm is a deliberate action — see `provisionFirmContext`,
 * called only from the explicit "set up your firm" confirmation, or the Clerk webhook syncing an
 * organization actually created through that flow.
 *
 * Throws `AccessError` if the caller has no active org, or has an active org that was never set
 * up as a firm workspace here, or isn't a member of the firm it resolves to.
 */
export async function requireFirmContext(): Promise<FirmContext> {
  const { userId, orgId } = await auth()
  if (!userId) throw new AccessError(403, "Sign in")
  if (!orgId) throw new AccessError(403, "Switch to your firm to view this")

  const account = await getFirmAccountByClerkOrg(orgId)
  if (!account) throw new AccessError(403, "This organization hasn't been set up as a firm workspace yet")

  const membership = await getMembership(account.id, userId)
  if (!membership) throw new AccessError(403, "You're not a member of this firm")

  return {
    account,
    membership,
    canManage: membership.role === "owner" || membership.role === "attorney",
  }
}

/**
 * The deliberate "yes, use this organization as my firm workspace" action. Creates the mirroring
 * `accounts` row (if this org has never been set up before) and makes the caller its owner. Call
 * this ONLY in direct response to the user explicitly confirming on the /firm setup screen — never
 * from a passive page load, so a stray or unrelated Clerk org membership can't silently turn into
 * a firm account.
 */
export async function provisionFirmContext(): Promise<FirmContext> {
  const { userId, orgId } = await auth()
  if (!userId) throw new AccessError(403, "Sign in")
  if (!orgId) throw new AccessError(403, "Switch to your firm to view this")

  await syncCurrentUser()

  let name = "Firm"
  try {
    const client = await clerkClient()
    const org = await client.organizations.getOrganization({ organizationId: orgId })
    name = org.name
  } catch {
    /* fall back to the default name; organization.updated webhook will correct it */
  }

  const account = await ensureFirmAccount({ clerkOrgId: orgId, name, actingUserId: userId, actingUserRole: "owner" })
  const membership = await getMembership(account.id, userId)
  if (!membership) throw new AccessError(403, "You're not a member of this firm")

  return {
    account,
    membership,
    canManage: membership.role === "owner" || membership.role === "attorney",
  }
}

/** The firm's documents the caller may see — every one for `all_clients` scope, only their
 *  assigned matters for `assigned_only`. */
export async function listFirmDocuments(ctx: FirmContext): Promise<(typeof documents.$inferSelect)[]> {
  const base = eq(documents.accountId, ctx.account.id)
  if (ctx.membership.scope === "assigned_only") {
    const { userId } = await auth()
    return db.select().from(documents).where(and(base, eq(documents.assignedToUserId, userId!)))
  }
  return db.select().from(documents).where(base)
}

/** Active team members of the firm. */
export async function listFirmMembers(ctx: FirmContext): Promise<AccountMembership[]> {
  return db
    .select()
    .from(accountMemberships)
    .where(and(eq(accountMemberships.accountId, ctx.account.id), eq(accountMemberships.status, "active")))
}

/** Best-effort company name for each given (registered) client, read from their own incorporation
 *  answers — not every client has gone through Vispo's incorporation flow (some are added just for
 *  a standalone filing on a company formed elsewhere), so a missing entry just means "unknown",
 *  not an error. Batched into one query rather than per-client. */
export async function getClientCompanyNames(userIds: string[]): Promise<Map<string, string>> {
  const ids = [...new Set(userIds)]
  const map = new Map<string, string>()
  if (ids.length === 0) return map

  const rows = await db
    .select()
    .from(userState)
    .where(and(inArray(userState.userId, ids), eq(userState.key, STORAGE_KEYS.incorporation)))

  for (const row of rows) {
    const name = (row.value as { answers?: { companyName?: string } } | null)?.answers?.companyName
    if (name) map.set(row.userId, name)
  }
  return map
}

export function deadlineUrgency(daysToDeadline: number | null): "none" | "overdue" | "urgent" | "soon" | "ok" {
  if (daysToDeadline === null) return "none"
  if (daysToDeadline < 0) return "overdue"
  if (daysToDeadline <= 7) return "urgent"
  if (daysToDeadline <= 14) return "soon"
  return "ok"
}

export function daysUntil(date: string | null): number | null {
  if (!date) return null
  return Math.ceil((new Date(date).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
}

export { inArray }
