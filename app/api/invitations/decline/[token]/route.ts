import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { declineInvitation } from "@/lib/invitations"
import { errorResponse } from "@/lib/api-errors"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { userId } = await auth()
    const { token } = await params
    await declineInvitation(token, userId ?? null)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return errorResponse(err)
  }
}
