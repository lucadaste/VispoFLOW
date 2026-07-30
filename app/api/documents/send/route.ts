import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { sendDocumentEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { recipientEmail, recipientName, senderCompanyName, message, documents } = body as {
    recipientEmail?: string
    recipientName?: string
    senderCompanyName?: string
    message?: string
    documents?: { docTitle: string; filename: string; content: string; contentType: string }[]
  }

  if (!recipientEmail || !Array.isArray(documents) || documents.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  if (documents.some((d) => !d.docTitle || !d.filename || !d.content || !d.contentType)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    return NextResponse.json({ error: "Invalid recipient email" }, { status: 400 })
  }

  await sendDocumentEmail({
    to: recipientEmail,
    recipientName,
    docTitles: documents.map((d) => d.docTitle),
    senderCompanyName,
    message,
    attachments: documents.map((d) => ({ filename: d.filename, content: d.content, contentType: d.contentType })),
  })

  return NextResponse.json({ ok: true })
}
