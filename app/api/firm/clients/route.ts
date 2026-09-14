import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { findComplianceItem } from "@/lib/flow"
import { requireFirmContext, listFirmDocuments, daysUntil, deadlineUrgency } from "@/lib/firm"
import { createClientDocument } from "@/lib/documents"
import { createInvitation } from "@/lib/invitations"
import { getUsers, displayName } from "@/lib/users"
import { getMembership } from "@/lib/accounts"
import { AccessError } from "@/lib/permissions"
import { errorResponse } from "@/lib/api-errors"

/** GET /api/firm/clients — the roster: one row per client filing, with the computed deadline. */
export async function GET() {
  try {
    const ctx = await requireFirmContext()
    const docs = await listFirmDocuments(ctx)

    const userIds = new Set<string>()
    docs.forEach((d) => {
      if (d.clientUserId) userIds.add(d.clientUserId)
      if (d.assignedToUserId) userIds.add(d.assignedToUserId)
    })
    const usersById = await getUsers([...userIds])

    const rows = docs
      .map((d) => {
        const days = daysUntil(d.deadlineDate)
        return {
          documentId: d.id,
          catalogId: d.catalogId,
          title: d.title,
          clientName: d.clientUserId ? displayName(usersById.get(d.clientUserId)) : null,
          clientEmail: d.clientEmail,
          clientRegistered: !!d.clientUserId,
          grantDate: d.grantDate,
          deadlineDate: d.deadlineDate,
          daysToDeadline: days,
          urgency: deadlineUrgency(days),
          status: d.status,
          assignedToUserId: d.assignedToUserId,
          assignedToName: d.assignedToUserId ? displayName(usersById.get(d.assignedToUserId)) : null,
          updatedAt: d.updatedAt,
        }
      })
      .sort((a, b) => {
        // Soonest real deadline first; rows without a deadline sink to the bottom.
        if (a.daysToDeadline === null) return b.daysToDeadline === null ? 0 : 1
        if (b.daysToDeadline === null) return -1
        return a.daysToDeadline - b.daysToDeadline
      })

    return NextResponse.json({ clients: rows })
  } catch (err) {
    return errorResponse(err)
  }
}

/**
 * POST /api/firm/clients — add a client + their filing, and email/link them an invite.
 * body: { name, email, catalogId?, grantDate?, assignedToUserId? }
 */
export async function POST(req: NextRequest) {
  try {
    const ctx = await requireFirmContext()
    if (!ctx.canManage) throw new AccessError(403, "Only attorneys can add clients")

    const { userId } = await auth()
    const body = await req.json()
    const name = typeof body?.name === "string" ? body.name.trim() : ""
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
    const catalogId = typeof body?.catalogId === "string" && body.catalogId ? body.catalogId : "83b"
    const grantDate = typeof body?.grantDate === "string" && body.grantDate ? body.grantDate : null
    const assignedToUserId =
      typeof body?.assignedToUserId === "string" && body.assignedToUserId ? body.assignedToUserId : userId!

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter the client's name and a valid email" }, { status: 400 })
    }
    // An assignee must actually be on the firm.
    if (assignedToUserId !== userId) {
      const m = await getMembership(ctx.account.id, assignedToUserId)
      if (!m) return NextResponse.json({ error: "Assignee isn't a member of this firm" }, { status: 400 })
    }

    const item = findComplianceItem(catalogId)
    const title = item?.title ?? catalogId

    const doc = await createClientDocument({
      firmAccountId: ctx.account.id,
      createdByUserId: userId!,
      clientEmail: email,
      catalogId,
      surface: "compliance",
      title,
      grantDate,
      assignedToUserId,
    })

    const invite = await createInvitation({
      inviterUserId: userId!,
      email,
      origin: req.nextUrl.origin,
      target: "document",
      documentId: doc.id,
      role: "client",
    })

    return NextResponse.json({
      documentId: doc.id,
      invite: { acceptUrl: invite.acceptUrl, emailed: invite.emailed },
    })
  } catch (err) {
    return errorResponse(err)
  }
}
