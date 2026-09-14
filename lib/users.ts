import { currentUser } from "@clerk/nextjs/server"
import { inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/lib/collab-schema"

export type UserRow = typeof users.$inferSelect

/**
 * Local mirror of Clerk users (`lib/collab-schema.ts`'s `users`). Kept fresh two ways:
 *   - opportunistically, whenever a signed-in user does something that matters (creates an
 *     invite, accepts one) — `syncCurrentUser`;
 *   - authoritatively, by the Clerk webhook (Phase 5).
 * Enough to render names/avatars and resolve an invited email without hitting Clerk per row.
 */

export async function upsertUser(row: {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  imageUrl?: string | null
}): Promise<void> {
  await db
    .insert(users)
    .values({
      id: row.id,
      email: row.email.toLowerCase(),
      firstName: row.firstName ?? null,
      lastName: row.lastName ?? null,
      imageUrl: row.imageUrl ?? null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: row.email.toLowerCase(),
        firstName: row.firstName ?? null,
        lastName: row.lastName ?? null,
        imageUrl: row.imageUrl ?? null,
        deletedAt: null,
        updatedAt: new Date(),
      },
    })
}

/** Mirrors the currently signed-in Clerk user into `users` and returns their id (or null). */
export async function syncCurrentUser(): Promise<{ id: string; email: string } | null> {
  const u = await currentUser()
  if (!u) return null
  const email =
    u.primaryEmailAddress?.emailAddress ??
    u.emailAddresses[0]?.emailAddress ??
    ""
  await upsertUser({ id: u.id, email, firstName: u.firstName, lastName: u.lastName, imageUrl: u.imageUrl })
  return { id: u.id, email: email.toLowerCase() }
}

export async function getUsers(ids: string[]): Promise<Map<string, UserRow>> {
  const unique = [...new Set(ids.filter(Boolean))]
  if (!unique.length) return new Map()
  const rows = await db.select().from(users).where(inArray(users.id, unique))
  return new Map(rows.map((r) => [r.id, r]))
}

export function displayName(user: Pick<UserRow, "firstName" | "lastName" | "email"> | undefined | null): string {
  if (!user) return "Someone"
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
  return name || user.email || "Someone"
}
