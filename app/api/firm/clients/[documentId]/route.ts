import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { requireFirmContext } from "@/lib/firm"
import { getDocumentRow } from "@/lib/permissions"
import { removeClientDocument } from "@/lib/documents"
import { errorResponse } from "@/lib/api-errors"

/** DELETE /api/firm/clients/:documentId — remove a client from the roster (see
 *  lib/documents.ts's removeClientDocument for what this does and doesn't touch). */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ documentId: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const ctx = await requireFirmContext()
    if (!ctx.canManage) return NextResponse.json({ error: "Only attorneys can remove clients" }, { status: 403 })

    const { documentId } = await params
    const doc = await getDocumentRow(documentId)
    if (!doc || doc.accountId !== ctx.account.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await removeClientDocument(userId, doc)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return errorResponse(err)
  }
}
