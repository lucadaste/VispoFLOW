import { NextResponse } from "next/server"
import { requireFirmContext } from "@/lib/firm"
import { errorResponse } from "@/lib/api-errors"

/** GET /api/firm — the caller's firm context (or 403 if they have no active org). */
export async function GET() {
  try {
    const ctx = await requireFirmContext()
    return NextResponse.json({
      firm: {
        accountId: ctx.account.id,
        name: ctx.account.name,
        clerkOrgId: ctx.account.clerkOrgId,
      },
      role: ctx.membership.role,
      scope: ctx.membership.scope,
      canManage: ctx.canManage,
    })
  } catch (err) {
    return errorResponse(err)
  }
}
