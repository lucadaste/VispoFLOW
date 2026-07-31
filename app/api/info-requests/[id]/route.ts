import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { infoRequests } from "@/lib/db-schema"

/** Cancels an outstanding (or resends by canceling then re-creating) info request — used when
 *  the owner mistyped the recipient's email or wants to redirect it to someone else. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await db.delete(infoRequests).where(and(eq(infoRequests.id, id), eq(infoRequests.ownerId, userId)))

  return NextResponse.json({ ok: true })
}
