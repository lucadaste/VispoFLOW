import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { infoRequests } from "@/lib/db-schema"
import { encryptSensitive } from "@/lib/crypto"

/** Public, token-authenticated — the recipient has no VispoFLOW account. Never returns
 *  `encryptedValue`; there's nothing for this route to reveal, only to collect. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const [row] = await db.select().from(infoRequests).where(eq(infoRequests.token, token)).limit(1)
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (row.status === "sent") {
    await db.update(infoRequests).set({ status: "viewed" }).where(eq(infoRequests.token, token))
  }

  return NextResponse.json({
    docTitle: row.docTitle,
    fieldLabel: row.fieldLabel,
    recipientName: row.recipientName,
    status: row.status,
  })
}

const MAX_VALUE_LENGTH = 32

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const body = await req.json()
  const value = typeof body?.value === "string" ? body.value.trim() : ""

  if (!value) return NextResponse.json({ error: "A value is required" }, { status: 400 })
  if (value.length > MAX_VALUE_LENGTH) return NextResponse.json({ error: "That value is too long" }, { status: 400 })

  const [row] = await db.select().from(infoRequests).where(eq(infoRequests.token, token)).limit(1)
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (row.status === "fulfilled") return NextResponse.json({ error: "Already submitted" }, { status: 409 })

  await db
    .update(infoRequests)
    .set({ status: "fulfilled", encryptedValue: encryptSensitive(value), fulfilledAt: new Date() })
    .where(eq(infoRequests.token, token))

  return NextResponse.json({ ok: true })
}
