import { randomBytes, randomUUID } from "crypto"
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { signatureRequests } from "@/lib/db-schema"
import { sendSignatureRequestEmail } from "@/lib/email"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rows = await db.select().from(signatureRequests).where(eq(signatureRequests.ownerId, userId))
  return NextResponse.json({ requests: rows })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { docId, docTitle, docContent, recipientEmail, recipientName, senderCompanyName, slotId, slotLabel, lockedName } = body

  if (!docId || !docTitle || !docContent || !recipientEmail || !slotId || !slotLabel) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    return NextResponse.json({ error: "Invalid recipient email" }, { status: 400 })
  }

  const id = randomUUID()
  const token = randomBytes(24).toString("base64url")

  const [row] = await db
    .insert(signatureRequests)
    .values({ id, token, ownerId: userId, docId, docTitle, docContent, recipientEmail, recipientName, slotId, slotLabel, lockedName })
    .returning()

  const origin = req.nextUrl.origin
  await sendSignatureRequestEmail({
    to: recipientEmail,
    recipientName,
    docTitle,
    slotLabel,
    senderCompanyName,
    signUrl: `${origin}/sign/${token}`,
  })

  return NextResponse.json({ request: row })
}
