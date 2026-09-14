import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import {
  createInvitation,
  listInvitationsForAccount,
  listInvitationsForDocument,
} from "@/lib/invitations"
import { syncCurrentUser } from "@/lib/users"
import { errorResponse } from "@/lib/api-errors"

/** GET /api/invitations?documentId=… | ?accountId=…  — pending invites the caller can manage. */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const documentId = req.nextUrl.searchParams.get("documentId")
    const accountId = req.nextUrl.searchParams.get("accountId")
    if (!documentId && !accountId) {
      return NextResponse.json({ error: "Pass documentId or accountId" }, { status: 400 })
    }

    const invites = documentId
      ? await listInvitationsForDocument(userId, documentId)
      : await listInvitationsForAccount(userId, accountId!)

    return NextResponse.json({ invitations: invites })
  } catch (err) {
    return errorResponse(err)
  }
}

/**
 * POST /api/invitations
 * body: { documentId, role: "editor"|"viewer" }
 *     | { accountId, role: "attorney"|"staff"|"viewer", scope?: "all_clients"|"assigned_only" }
 *   + email
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    await syncCurrentUser()

    const body = await req.json()
    const { email, documentId, accountId, role, scope } = body ?? {}
    if (typeof email !== "string" || typeof role !== "string") {
      return NextResponse.json({ error: "Missing email or role" }, { status: 400 })
    }

    const result = documentId
      ? await createInvitation({
          inviterUserId: userId,
          email,
          origin: req.nextUrl.origin,
          target: "document",
          documentId,
          role,
        })
      : accountId
        ? await createInvitation({
            inviterUserId: userId,
            email,
            origin: req.nextUrl.origin,
            target: "account",
            accountId,
            role,
            scope,
          })
        : null

    if (!result) return NextResponse.json({ error: "Pass documentId or accountId" }, { status: 400 })

    return NextResponse.json({
      invitation: result.invitation,
      acceptUrl: result.acceptUrl,
      emailed: result.emailed,
    })
  } catch (err) {
    return errorResponse(err)
  }
}
