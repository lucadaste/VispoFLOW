import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { resendInvitation } from "@/lib/invitations"
import { errorResponse } from "@/lib/api-errors"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const result = await resendInvitation(userId, id, req.nextUrl.origin)
    return NextResponse.json({
      invitation: result.invitation,
      acceptUrl: result.acceptUrl,
      emailed: result.emailed,
    })
  } catch (err) {
    return errorResponse(err)
  }
}
