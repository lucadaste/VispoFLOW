import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { revokeDocumentCollaborator } from "@/lib/collaborators"
import { errorResponse } from "@/lib/api-errors"

/** DELETE /api/documents/:id/collaborators/:userId — revoke a collaborator. Effective on their
 *  next request (the permissions layer re-checks status every time). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  try {
    const { userId: actorUserId } = await auth()
    if (!actorUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id, userId: targetUserId } = await params
    await revokeDocumentCollaborator(actorUserId, id, targetUserId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return errorResponse(err)
  }
}
