import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { sensitiveFieldValues } from "@/lib/db-schema"
import { encryptSensitive, decryptSensitive } from "@/lib/crypto"

/** Encrypted, account-scoped backup of a `sensitive` compliance field's real value (an SSN/ITIN) —
 *  see lib/db-schema.ts's `sensitiveFieldValues` and lib/sensitive-server-store.ts, the client side
 *  of this. Every value here is deleted the moment its document is signed or downloaded (see that
 *  module's `purgeSensitiveValuesFromServer` and its callers), not kept indefinitely. */

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const docId = req.nextUrl.searchParams.get("docId")
  if (!docId) return NextResponse.json({ error: "Missing docId" }, { status: 400 })

  const rows = await db
    .select()
    .from(sensitiveFieldValues)
    .where(and(eq(sensitiveFieldValues.userId, userId), eq(sensitiveFieldValues.docId, docId)))

  const values: Record<string, string> = {}
  for (const row of rows) values[row.fieldName] = decryptSensitive(row.encryptedValue)
  return NextResponse.json({ values })
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { docId, fieldName, value } = body
  if (!docId || !fieldName || typeof value !== "string" || !value) {
    return NextResponse.json({ error: "Missing docId, fieldName, or value" }, { status: 400 })
  }

  const encryptedValue = encryptSensitive(value)
  await db
    .insert(sensitiveFieldValues)
    .values({ userId, docId, fieldName, encryptedValue, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [sensitiveFieldValues.userId, sensitiveFieldValues.docId, sensitiveFieldValues.fieldName],
      set: { encryptedValue, updatedAt: new Date() },
    })

  return NextResponse.json({ ok: true })
}

/** Purges every stashed value for one document (all its sensitive fields at once) — called once the
 *  document is signed or downloaded, and when a filing is deleted or redone from scratch. */
export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const docId = req.nextUrl.searchParams.get("docId")
  if (!docId) return NextResponse.json({ error: "Missing docId" }, { status: 400 })

  await db.delete(sensitiveFieldValues).where(and(eq(sensitiveFieldValues.userId, userId), eq(sensitiveFieldValues.docId, docId)))

  return NextResponse.json({ ok: true })
}
