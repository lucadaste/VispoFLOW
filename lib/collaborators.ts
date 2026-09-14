import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { documentCollaborators, accountMemberships, invitations } from "@/lib/collab-schema"
import { assertDocumentAccess } from "@/lib/permissions"
import { getMembership } from "@/lib/accounts"
import { getUsers, displayName } from "@/lib/users"
import { logAudit } from "@/lib/audit"
import { InvitationError } from "@/lib/invitations"

/**
 * Managing *granted* access (as opposed to pending invites, which live in lib/invitations.ts).
 *
 * Revocation takes effect on the collaborator's very next request, not their next login: the
 * permissions layer re-reads `status` on every check, so flipping a row to `revoked` here is
 * immediately enforced. The row is kept (not deleted) so the audit trail stays intact.
 */

export type CollaboratorView = {
  userId: string
  name: string
  email: string
  role: string
  status: string
  since: Date
}

export type PendingInviteView = {
  invitationId: string
  email: string
  role: string
  expiresAt: Date
}

export type DocumentSharing = {
  collaborators: CollaboratorView[]
  pending: PendingInviteView[]
}

export async function getDocumentSharing(actorUserId: string, documentId: string): Promise<DocumentSharing> {
  await assertDocumentAccess(actorUserId, documentId, "manage")

  const collabRows = await db
    .select()
    .from(documentCollaborators)
    .where(eq(documentCollaborators.documentId, documentId))

  const pendingRows = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.documentId, documentId), eq(invitations.status, "pending")))

  const usersById = await getUsers(collabRows.map((r) => r.userId))

  return {
    collaborators: collabRows
      .filter((r) => r.status === "active")
      .map((r) => {
        const u = usersById.get(r.userId)
        return {
          userId: r.userId,
          name: displayName(u),
          email: u?.email ?? "",
          role: r.role,
          status: r.status,
          since: r.createdAt,
        }
      }),
    pending: pendingRows.map((r) => ({
      invitationId: r.id,
      email: r.email,
      role: r.role,
      expiresAt: r.expiresAt,
    })),
  }
}

export async function revokeDocumentCollaborator(
  actorUserId: string,
  documentId: string,
  targetUserId: string,
): Promise<void> {
  const { doc } = await assertDocumentAccess(actorUserId, documentId, "manage")

  const [row] = await db
    .update(documentCollaborators)
    .set({ status: "revoked", revokedAt: new Date() })
    .where(
      and(
        eq(documentCollaborators.documentId, documentId),
        eq(documentCollaborators.userId, targetUserId),
        eq(documentCollaborators.status, "active"),
      ),
    )
    .returning()

  if (!row) return // already gone — nothing to do

  await logAudit({
    action: "collaborator_removed",
    actorUserId,
    accountId: doc.accountId,
    documentId,
    metadata: { removedUserId: targetUserId, role: row.role },
  })
}

export async function revokeAccountMembership(
  actorUserId: string,
  accountId: string,
  targetUserId: string,
): Promise<void> {
  const actorMembership = await getMembership(accountId, actorUserId)
  if (!actorMembership || !["owner", "attorney"].includes(actorMembership.role)) {
    throw new InvitationError(403, "You can't remove people from this account")
  }
  if (targetUserId === actorUserId) {
    throw new InvitationError(400, "You can't remove yourself")
  }

  const [target] = await db
    .select()
    .from(accountMemberships)
    .where(and(eq(accountMemberships.accountId, accountId), eq(accountMemberships.userId, targetUserId)))
    .limit(1)
  if (!target || target.status !== "active") return
  if (target.role === "owner") throw new InvitationError(403, "The account owner can't be removed")

  await db
    .update(accountMemberships)
    .set({ status: "revoked", revokedAt: new Date() })
    .where(eq(accountMemberships.id, target.id))

  await logAudit({
    action: "member_removed",
    actorUserId,
    accountId,
    metadata: { removedUserId: targetUserId, role: target.role },
  })
}
