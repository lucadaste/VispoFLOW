import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { getDocumentSharing } from "@/lib/collaborators"
import { errorResponse } from "@/lib/api-errors"

/** GET /api/documents/:id/collaborators — active collaborators + pending invites for a filing. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const sharing = await getDocumentSharing(userId, id)
    return NextResponse.json(sharing)
  } catch (err) {
    return errorResponse(err)
  }
}
