import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { listAccessibleDocuments, resolveDocumentAccess } from "@/lib/permissions"
import { getUsers, displayName } from "@/lib/users"
import { errorResponse } from "@/lib/api-errors"

/**
 * GET /api/documents — every document the caller can currently see, with their role on each and
 * the deadline urgency. Backs the collaborator's "shared with me" list and the firm roster.
 */
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const docs = await listAccessibleDocuments(userId)

    const relatedUserIds = new Set<string>()
    for (const d of docs) {
      if (d.ownerUserId) relatedUserIds.add(d.ownerUserId)
      if (d.clientUserId) relatedUserIds.add(d.clientUserId)
      if (d.assignedToUserId) relatedUserIds.add(d.assignedToUserId)
    }
    const usersById = await getUsers([...relatedUserIds])

    const now = Date.now()
    const items = await Promise.all(
      docs.map(async (d) => {
        const access = await resolveDocumentAccess(userId, d)
        const subject = d.clientUserId
          ? usersById.get(d.clientUserId)
          : d.ownerUserId
            ? usersById.get(d.ownerUserId)
            : null
        const daysToDeadline = d.deadlineDate
          ? Math.ceil((new Date(d.deadlineDate).getTime() - now) / (24 * 60 * 60 * 1000))
          : null
        return {
          id: d.id,
          catalogId: d.catalogId,
          title: d.title,
          surface: d.surface,
          status: d.status,
          deadlineDate: d.deadlineDate,
          daysToDeadline,
          urgency: deadlineUrgency(daysToDeadline),
          subjectName: subject ? displayName(subject) : null,
          isOwnFiling: d.ownerUserId === userId && !d.clientUserId,
          assignedToName: d.assignedToUserId ? displayName(usersById.get(d.assignedToUserId)) : null,
          myRole: access?.role ?? null,
          mySource: access?.source ?? null,
          canManage: access?.permissions.has("manage") ?? false,
          canEdit: access?.permissions.has("edit") ?? false,
        }
      }),
    )

    return NextResponse.json({ documents: items })
  } catch (err) {
    return errorResponse(err)
  }
}

function deadlineUrgency(days: number | null): "none" | "overdue" | "urgent" | "soon" | "ok" {
  if (days === null) return "none"
  if (days < 0) return "overdue"
  if (days <= 7) return "urgent"
  if (days <= 14) return "soon"
  return "ok"
}
