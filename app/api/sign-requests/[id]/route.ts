import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { signatureRequests } from "@/lib/db-schema"

/** Removes a signature request the owner sent — used when "un-signing" a document to redo a
 *  signature collected via an emailed link, so it doesn't reappear on the next reconciliation. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await db.delete(signatureRequests).where(and(eq(signatureRequests.id, id), eq(signatureRequests.ownerId, userId)))

  return NextResponse.json({ ok: true })
}
