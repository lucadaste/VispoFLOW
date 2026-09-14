import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { assertDocumentAccess } from "@/lib/permissions"
import { transitionDocumentStatus, type DocumentStatus } from "@/lib/documents"
import { errorResponse } from "@/lib/api-errors"

/** POST /api/documents/:id/status  body: { status } — an explicit pipeline transition. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    await assertDocumentAccess(userId, id, "manage")

    const body = await req.json()
    const status = body?.status as DocumentStatus
    if (typeof status !== "string") {
      return NextResponse.json({ error: "Missing status" }, { status: 400 })
    }

    try {
      const result = await transitionDocumentStatus(userId, id, status)
      return NextResponse.json(result)
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "Invalid transition" }, { status: 409 })
    }
  } catch (err) {
    return errorResponse(err)
  }
}
