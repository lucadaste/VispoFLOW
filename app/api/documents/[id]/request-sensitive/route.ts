import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { assertDocumentAccess } from "@/lib/permissions"
import { getUsers, displayName } from "@/lib/users"
import { sendSensitiveRequestNudgeEmail } from "@/lib/email"
import { logAudit } from "@/lib/audit"
import { errorResponse } from "@/lib/api-errors"

/**
 * POST /api/documents/:id/request-sensitive  body: { fieldLabels: string[] }
 * A collaborator/reviewer who can't see a masked field asks the owner to share it. Nudges by
 * email only — nothing is transmitted automatically. Always audit-logged.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const { doc, access } = await assertDocumentAccess(userId, id, "view")
    if (access.permissions.has("view_sensitive")) {
      return NextResponse.json({ error: "You already have access to this field" }, { status: 400 })
    }
    if (!doc.ownerUserId) {
      return NextResponse.json({ error: "This filing hasn't been started yet" }, { status: 404 })
    }

    const body = await req.json()
    const fieldLabels = Array.isArray(body?.fieldLabels) ? body.fieldLabels.filter((f: unknown) => typeof f === "string") : []
    if (!fieldLabels.length) return NextResponse.json({ error: "Missing fieldLabels" }, { status: 400 })

    await logAudit({
      action: "sensitive_value_requested",
      actorUserId: userId,
      accountId: doc.accountId,
      documentId: doc.id,
      metadata: { fieldLabels },
    })

    const [requester, owner] = await Promise.all([
      getUsers([userId]).then((m) => m.get(userId)),
      getUsers([doc.ownerUserId]).then((m) => m.get(doc.ownerUserId!)),
    ])

    if (owner?.email) {
      await sendSensitiveRequestNudgeEmail({
        to: owner.email,
        ownerName: displayName(owner),
        requesterName: displayName(requester),
        docTitle: doc.title,
        fieldLabels,
        appUrl: `${req.nextUrl.origin}/app`,
      }).catch(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return errorResponse(err)
  }
}
