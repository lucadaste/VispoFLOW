import { randomBytes, randomUUID } from "crypto"
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { infoRequests } from "@/lib/db-schema"
import { sendInfoRequestEmail } from "@/lib/email"

/** Never select `encryptedValue` for the owner's own listing/reconciliation views — the owner
 *  only needs to know status, not the ciphertext, and there's no reason for it to leave the DB
 *  except through the ownership-checked reveal endpoint. */
const listColumns = {
  id: infoRequests.id,
  docId: infoRequests.docId,
  docTitle: infoRequests.docTitle,
  fieldName: infoRequests.fieldName,
  fieldLabel: infoRequests.fieldLabel,
  recipientName: infoRequests.recipientName,
  recipientEmail: infoRequests.recipientEmail,
  status: infoRequests.status,
  fulfilledAt: infoRequests.fulfilledAt,
  createdAt: infoRequests.createdAt,
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rows = await db.select(listColumns).from(infoRequests).where(eq(infoRequests.ownerId, userId))
  return NextResponse.json({ requests: rows })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { docId, docTitle, fieldName, fieldLabel, recipientEmail, recipientName, senderCompanyName } = body

  if (!docId || !docTitle || !fieldName || !fieldLabel || !recipientEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    return NextResponse.json({ error: "Invalid recipient email" }, { status: 400 })
  }

  const id = randomUUID()
  const token = randomBytes(24).toString("base64url")

  const [row] = await db
    .insert(infoRequests)
    .values({ id, token, ownerId: userId, docId, docTitle, fieldName, fieldLabel, recipientEmail, recipientName })
    .returning(listColumns)

  const origin = req.nextUrl.origin
  await sendInfoRequestEmail({
    to: recipientEmail,
    recipientName,
    fieldLabel,
    docTitle,
    senderCompanyName,
    infoUrl: `${origin}/provide-info/${token}`,
  })

  return NextResponse.json({ request: row })
}
