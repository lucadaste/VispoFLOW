import { auth, clerkClient } from "@clerk/nextjs/server"
import { and, eq, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { documents, accountMemberships } from "@/lib/collab-schema"
import { ensureFirmAccount, getMembership, type Account, type AccountMembership } from "@/lib/accounts"
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
 * (`auth().orgId`). Creates the mirroring `accounts` row + the caller's membership on first hit,
 * so the dashboard works even before the Clerk webhook is configured. Throws `AccessError` if the
 * caller has no active org or isn't a member of the firm.
 */
export async function requireFirmContext(): Promise<FirmContext> {
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
