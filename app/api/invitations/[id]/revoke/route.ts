import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { revokeInvitation } from "@/lib/invitations"
import { errorResponse } from "@/lib/api-errors"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    await revokeInvitation(userId, id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return errorResponse(err)
  }
}
