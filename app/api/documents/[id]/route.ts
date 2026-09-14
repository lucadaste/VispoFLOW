import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { assertDocumentAccess, recordDocumentView } from "@/lib/permissions"
import { getUsers, displayName } from "@/lib/users"
import { errorResponse } from "@/lib/api-errors"

/**
 * GET /api/documents/:id — one document with the caller's resolved access and who it's about.
 * Backs the collaborator view header ("Viewing Jane Doe's 83(b) election — Editor access").
 * Pass ?view=1 to also record a `viewed` audit entry (use when the user actually opens it).
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const { doc, access } = await assertDocumentAccess(userId, id, "view")

    if (req.nextUrl.searchParams.get("view") === "1") {
      await recordDocumentView(userId, doc, access.source)
    }

    const subjectId = doc.clientUserId ?? doc.ownerUserId
    const subject = subjectId ? (await getUsers([subjectId])).get(subjectId) : null

    return NextResponse.json({
      document: {
        id: doc.id,
        catalogId: doc.catalogId,
        title: doc.title,
        surface: doc.surface,
        storageKey: doc.storageKey,
        status: doc.status,
        deadlineDate: doc.deadlineDate,
        grantDate: doc.grantDate,
      },
      subjectName: subject ? displayName(subject) : null,
      isOwnFiling: doc.ownerUserId === userId && !doc.clientUserId,
      access: {
        role: access.role,
        source: access.source,
        permissions: [...access.permissions],
      },
    })
  } catch (err) {
    return errorResponse(err)
  }
}
