import { verifyWebhook } from "@clerk/nextjs/webhooks"
import type { NextRequest } from "next/server"
import { randomUUID } from "crypto"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users, accounts, accountMemberships } from "@/lib/collab-schema"
import { ensureFirmAccount, getFirmAccountByClerkOrg } from "@/lib/accounts"
import { upsertUser } from "@/lib/users"
import { logAudit } from "@/lib/audit"

/**
 * Clerk → our tables sync. Configure an endpoint in the Clerk dashboard pointing here, subscribed
 * to user.*, organization.* and organizationMembership.* events, and set
 * CLERK_WEBHOOK_SIGNING_SECRET. Individual accounts are still created lazily (ensureIndividualAccount);
 * this keeps the `users` mirror and firm (`type = 'firm'`) accounts + memberships current.
 */

function clerkRoleToOurs(role: string | undefined): "attorney" | "staff" {
  // Clerk ships "org:admin" / "org:member" (older instances: "admin" / "member"). The firm owner
  // is set separately from organization.created's `created_by`, so admins land as "attorney".
  return role === "org:admin" || role === "admin" ? "attorney" : "staff"
}

export async function POST(req: NextRequest) {
  let evt
  try {
    evt = await verifyWebhook(req)
  } catch (err) {
    console.error("[clerk webhook] verification failed", err)
    return new Response("Invalid signature", { status: 400 })
  }

  try {
    switch (evt.type) {
      case "user.created":
      case "user.updated": {
        const d = evt.data
        const email =
          d.email_addresses?.find((e) => e.id === d.primary_email_address_id)?.email_address ??
          d.email_addresses?.[0]?.email_address ??
          ""
        await upsertUser({
          id: d.id,
          email,
          firstName: d.first_name,
          lastName: d.last_name,
          imageUrl: d.image_url,
        })
        break
      }

      case "user.deleted": {
        if (evt.data.id) {
          await db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, evt.data.id))
        }
        break
      }

      case "organization.created": {
        const d = evt.data
        await ensureFirmAccount({
          clerkOrgId: d.id,
          name: d.name,
          actingUserId: d.created_by ?? undefined,
          actingUserRole: "owner",
        })
        break
      }

      case "organization.updated": {
        const d = evt.data
        await db
          .update(accounts)
          .set({ name: d.name })
          .where(eq(accounts.clerkOrgId, d.id))
        break
      }

      case "organization.deleted": {
        if (evt.data.id) {
          const account = await getFirmAccountByClerkOrg(evt.data.id)
          if (account) {
            await db
              .update(accountMemberships)
              .set({ status: "revoked", revokedAt: new Date() })
              .where(eq(accountMemberships.accountId, account.id))
            await logAudit({ action: "member_removed", accountId: account.id, metadata: { reason: "organization_deleted" } })
          }
        }
        break
      }

      case "organizationMembership.created":
      case "organizationMembership.updated": {
        const d = evt.data
        // Only sync membership into a firm that's *already* been deliberately set up here (via
        // organization.created below, or the explicit /api/firm/setup confirmation) — never
        // auto-create a firm account just because someone joined some Clerk organization. That
        // would let any unrelated org membership silently open a firm dashboard for its members.
        const acct = await getFirmAccountByClerkOrg(d.organization.id)
        if (!acct) break

        const userId = d.public_user_data?.user_id
        if (!userId) break

        const [existing] = await db
          .select()
          .from(accountMemberships)
          .where(and(eq(accountMemberships.accountId, acct.id), eq(accountMemberships.userId, userId)))
          .limit(1)

        // Never downgrade an owner via a Clerk role change.
        const role = existing?.role === "owner" ? "owner" : clerkRoleToOurs(d.role)

        if (existing) {
          await db
            .update(accountMemberships)
            .set({ role, status: "active", revokedAt: null })
            .where(eq(accountMemberships.id, existing.id))
        } else {
          await db.insert(accountMemberships).values({
            id: randomUUID(),
            accountId: acct.id,
            userId,
            role,
            scope: "all_clients",
            status: "active",
          })
          await logAudit({ action: "member_added", accountId: acct.id, metadata: { userId, role } })
        }
        break
      }

      case "organizationMembership.deleted": {
        const d = evt.data
        const acct = await getFirmAccountByClerkOrg(d.organization.id)
        const userId = d.public_user_data?.user_id
        if (acct && userId) {
          await db
            .update(accountMemberships)
            .set({ status: "revoked", revokedAt: new Date() })
            .where(and(eq(accountMemberships.accountId, acct.id), eq(accountMemberships.userId, userId)))
          await logAudit({ action: "member_removed", accountId: acct.id, metadata: { userId } })
        }
        break
      }
    }
  } catch (err) {
    console.error(`[clerk webhook] handler error for ${evt.type}`, err)
    // 500 so Clerk retries.
    return new Response("Handler error", { status: 500 })
  }

  return new Response("ok", { status: 200 })
}
