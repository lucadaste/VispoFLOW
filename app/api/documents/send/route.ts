import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { sendDocumentEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { recipientEmail, recipientName, docTitle, senderCompanyName, message, filename, content, contentType } = body

  if (!recipientEmail || !docTitle || !filename || !content || !contentType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    return NextResponse.json({ error: "Invalid recipient email" }, { status: 400 })
  }

  await sendDocumentEmail({
    to: recipientEmail,
    recipientName,
    docTitle,
    senderCompanyName,
    message,
    attachment: { filename, content, contentType },
  })

  return NextResponse.json({ ok: true })
}
