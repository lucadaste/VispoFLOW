import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { ensureDocument, syncDocumentFromFiling, type DocumentSurface, type DocumentStatus } from "@/lib/documents"
import { syncCurrentUser } from "@/lib/users"
import { errorResponse } from "@/lib/api-errors"

const SURFACES: DocumentSurface[] = ["incorporation", "compliance", "transactions"]

/**
 * POST /api/documents/ensure
 * body: { catalogId, surface, title, values?, status? }
 * Idempotent — returns the (created or existing) document row for one of the caller's own filings,
 * and folds in any new values/status. Called when a signed-in user opens or advances a filing.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    await syncCurrentUser()

    const body = await req.json()
    const { catalogId, surface, title, grantDate, status } = body ?? {}
    if (typeof catalogId !== "string" || !SURFACES.includes(surface) || typeof title !== "string") {
      return NextResponse.json({ error: "Missing catalogId, surface, or title" }, { status: 400 })
    }

    // Only the deadline-driving date is accepted here — sensitive field values never leave the
    // client for this call.
    const values = typeof grantDate === "string" && grantDate ? { grantDate } : null

    const doc = await ensureDocument({ userId, catalogId, surface, title, values })
    if (values || status) {
      await syncDocumentFromFiling({
        documentId: doc.id,
        actorUserId: userId,
        values,
        status: status as DocumentStatus | undefined,
      })
    }

    return NextResponse.json({ document: { ...doc, ...(status ? { status } : {}) } })
  } catch (err) {
    return errorResponse(err)
  }
}
