import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { signatureRequests } from "@/lib/db-schema"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const [row] = await db.select().from(signatureRequests).where(eq(signatureRequests.token, token)).limit(1)
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (row.status === "sent") {
    await db.update(signatureRequests).set({ status: "viewed" }).where(eq(signatureRequests.token, token))
  }

  return NextResponse.json({
    docTitle: row.docTitle,
    docContent: row.docContent,
    status: row.status,
    recipientName: row.recipientName,
    slotLabel: row.slotLabel,
    lockedName: row.lockedName,
  })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const body = await req.json()
  const { signerName, signatureDataUrl } = body

  if (!signerName || !signatureDataUrl) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const [row] = await db.select().from(signatureRequests).where(eq(signatureRequests.token, token)).limit(1)
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (row.status === "signed") return NextResponse.json({ error: "Already signed" }, { status: 409 })

  // A locked name means the slot requires this exact printed name to land on the right
  // line — don't let a tampered client request override it.
  if (row.lockedName && signerName.trim() !== row.lockedName.trim()) {
    return NextResponse.json({ error: "Signer name doesn't match the assigned signer" }, { status: 400 })
  }

  const signerIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null

  await db
    .update(signatureRequests)
    .set({
      status: "signed",
      signerName,
      signatureDataUrl,
      signerIp,
      signedAt: new Date(),
    })
    .where(eq(signatureRequests.token, token))

  return NextResponse.json({ ok: true })
}
