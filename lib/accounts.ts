import { randomUUID } from "crypto"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { accounts, accountMemberships } from "@/lib/collab-schema"

export type Account = typeof accounts.$inferSelect
export type AccountMembership = typeof accountMemberships.$inferSelect

/**
 * Account lookup + lazy creation.
 *
 * Every signed-in user has exactly one `individual` account, created the first time it's needed
 * (`ensureIndividualAccount`). `firm` accounts are created by the Clerk webhook when an
 * organization is created (Phase 5) — never here.
 *
 * The account owner is also stored as an `accountMemberships` row (role `owner`), so account-level
 * queries never have to special-case "is this the owner" separately from "is this a member".
 */

/** The user's personal account, creating it (and the owner membership) on first call. */
export async function ensureIndividualAccount(userId: string, displayName?: string): Promise<Account> {
  const existing = await getIndividualAccount(userId)
  if (existing) return existing

  const id = randomUUID()
  try {
    const [created] = await db
      .insert(accounts)
      .values({
        id,
        type: "individual",
        name: displayName?.trim() || "Personal",
        personalUserId: userId,
      })
      .returning()

    await db
      .insert(accountMemberships)
      .values({ id: randomUUID(), accountId: id, userId, role: "owner", scope: "all_clients", status: "active" })
      .onConflictDoNothing()

    return created
  } catch {
    // Lost a race with a concurrent first-load request — the unique index on personal_user_id
    // rejected the second insert. Read whichever row won.
    const winner = await getIndividualAccount(userId)
    if (winner) return winner
    throw new Error(`could not create individual account for ${userId}`)
  }
}

export async function getIndividualAccount(userId: string): Promise<Account | null> {
  const [row] = await db.select().from(accounts).where(eq(accounts.personalUserId, userId)).limit(1)
  return row ?? null
}

/**
 * The firm account mirroring a Clerk Organization, creating it on first call. `actingUserId` (the
 * signed-in org member triggering this) is made an `owner` membership if there isn't one yet — a
 * fallback for when the org was created before the Clerk webhook was wired; the webhook is the
 * authoritative sync afterwards.
 */
export async function ensureFirmAccount(input: {
  clerkOrgId: string
  name: string
  actingUserId?: string
  actingUserRole?: "owner" | "attorney" | "staff"
}): Promise<Account> {
  const existing = await getFirmAccountByClerkOrg(input.clerkOrgId)
  let account = existing

  if (!account) {
    const id = randomUUID()
    try {
      ;[account] = await db
        .insert(accounts)
        .values({ id, type: "firm", name: input.name.trim() || "Firm", clerkOrgId: input.clerkOrgId })
        .returning()
    } catch {
      account = await getFirmAccountByClerkOrg(input.clerkOrgId)
      if (!account) throw new Error(`could not create firm account for ${input.clerkOrgId}`)
    }
  }

  if (input.actingUserId) {
    const membership = await getMembership(account.id, input.actingUserId)
    if (!membership) {
      await db
        .insert(accountMemberships)
        .values({
          id: randomUUID(),
          accountId: account.id,
          userId: input.actingUserId,
          role: input.actingUserRole ?? "owner",
          scope: "all_clients",
          status: "active",
        })
        .onConflictDoNothing()
    }
  }

  return account
}

export async function getAccount(accountId: string): Promise<Account | null> {
  const [row] = await db.select().from(accounts).where(eq(accounts.id, accountId)).limit(1)
  return row ?? null
}

export async function getFirmAccountByClerkOrg(clerkOrgId: string): Promise<Account | null> {
  const [row] = await db.select().from(accounts).where(eq(accounts.clerkOrgId, clerkOrgId)).limit(1)
  return row ?? null
}

/** One active membership row, or null. */
export async function getMembership(accountId: string, userId: string): Promise<AccountMembership | null> {
  const [row] = await db
    .select()
    .from(accountMemberships)
    .where(
      and(
        eq(accountMemberships.accountId, accountId),
        eq(accountMemberships.userId, userId),
        eq(accountMemberships.status, "active"),
      ),
    )
    .limit(1)
  return row ?? null
}

/** Every account the user is an active member of, paired with the membership. */
export async function listUserAccounts(userId: string): Promise<{ account: Account; membership: AccountMembership }[]> {
  const rows = await db
    .select({ account: accounts, membership: accountMemberships })
    .from(accountMemberships)
    .innerJoin(accounts, eq(accounts.id, accountMemberships.accountId))
    .where(and(eq(accountMemberships.userId, userId), eq(accountMemberships.status, "active")))
  return rows
}
