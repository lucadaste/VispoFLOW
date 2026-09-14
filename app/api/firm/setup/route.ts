import { NextResponse } from "next/server"
import { provisionFirmContext } from "@/lib/firm"
import { errorResponse } from "@/lib/api-errors"

/**
 * POST /api/firm/setup — the one deliberate action that turns the caller's active Clerk
 * organization into a firm workspace. Only ever called from the "set up your firm" screen's
 * explicit confirm button — never automatically. See lib/firm.ts's provisionFirmContext.
 */
export async function POST() {
  try {
    const ctx = await provisionFirmContext()
    return NextResponse.json({
      firm: { accountId: ctx.account.id, name: ctx.account.name, clerkOrgId: ctx.account.clerkOrgId },
      role: ctx.membership.role,
      scope: ctx.membership.scope,
      canManage: ctx.canManage,
    })
  } catch (err) {
    return errorResponse(err)
  }
}
