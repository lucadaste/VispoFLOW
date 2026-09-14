import { NextResponse } from "next/server"
import { requireFirmContext, listFirmMembers } from "@/lib/firm"
import { listInvitationsForAccount } from "@/lib/invitations"
import { auth } from "@clerk/nextjs/server"
import { getUsers, displayName } from "@/lib/users"
import { errorResponse } from "@/lib/api-errors"

/** GET /api/firm/team — active members + pending team invites. */
export async function GET() {
  try {
    const ctx = await requireFirmContext()
    const { userId } = await auth()

    const members = await listFirmMembers(ctx)
    const usersById = await getUsers(members.map((m) => m.userId))
    const pending = ctx.canManage ? await listInvitationsForAccount(userId!, ctx.account.id) : []

    return NextResponse.json({
      members: members.map((m) => {
        const u = usersById.get(m.userId)
        return {
          userId: m.userId,
          name: displayName(u),
          email: u?.email ?? "",
          role: m.role,
          scope: m.scope,
          isSelf: m.userId === userId,
        }
      }),
      pending: pending.map((p) => ({ invitationId: p.id, email: p.email, role: p.role, scope: p.scope, expiresAt: p.expiresAt })),
      canManage: ctx.canManage,
    })
  } catch (err) {
    return errorResponse(err)
  }
}
