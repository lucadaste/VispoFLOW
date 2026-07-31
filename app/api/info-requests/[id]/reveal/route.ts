import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { infoRequests } from "@/lib/db-schema"
import { decryptSensitive } from "@/lib/crypto"

/** The only route that ever returns a submitted value's plaintext — gated to the verified owner
 *  of the request, and only once it's been fulfilled. Called by the owner's app to merge the
 *  value into the live in-memory doc it belongs to (see components/incorporation-app.tsx's
 *  info-request polling), which is already subject to the same never-persisted handling as any
 *  other `sensitive` field. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const [row] = await db.select().from(infoRequests).where(eq(infoRequests.id, id)).limit(1)
  if (!row || row.ownerId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (row.status !== "fulfilled" || !row.encryptedValue) {
    return NextResponse.json({ error: "Not fulfilled yet" }, { status: 409 })
  }

  return NextResponse.json({ value: decryptSensitive(row.encryptedValue) })
}
