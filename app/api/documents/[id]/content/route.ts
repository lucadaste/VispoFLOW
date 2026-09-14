import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { userState, sensitiveFieldValues } from "@/lib/db-schema"
import { decryptSensitive } from "@/lib/crypto"
import { assertDocumentAccess, recordDocumentView } from "@/lib/permissions"
import { getUsers, displayName } from "@/lib/users"
import { findComplianceItem } from "@/lib/flow"
import { SENSITIVE_FIELD_PLACEHOLDER } from "@/lib/sensitive-field"
import { errorResponse } from "@/lib/api-errors"

const HIDDEN = "•••••••••"

type FilingRecord = { content?: string; values?: Record<string, string> } | undefined

/** Pulls one filing's rendered content out of whichever blob shape its surface actually uses —
 *  see lib/documents.ts's SURFACE_STORAGE_KEY comment for why these differ. */
function extractFiling(surface: string, blobValue: unknown, catalogId: string): FilingRecord {
  if (surface === "transactions") {
    const docs = (blobValue as { transactionDocs?: (FilingRecord & { id: string })[] } | null)?.transactionDocs ?? []
    return docs.find((d) => d.id === catalogId)
  }
  const docs = (blobValue as { docs?: Record<string, FilingRecord> } | null)?.docs
  return docs?.[catalogId]
}

/**
 * GET /api/documents/:id/content — the rendered filing, for anyone with `view` access who isn't
 * the owner (a collaborator, or a firm reviewing a client's filing).
 *
 * The owner's *persisted* blob never contains real sensitive values (they're stripped to a
 * placeholder before it's ever saved — see redactSensitiveDocValues), so a non-owner reading it
 * here can't see an SSN. For non-`view_sensitive` viewers we also relabel those fields to a mask
 * and list them, so the UI can render "Hidden" with a Request affordance.
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
    const header = {
      documentId: doc.id,
      title: doc.title,
      catalogId: doc.catalogId,
      status: doc.status,
      deadlineDate: doc.deadlineDate,
      subjectName: subject ? displayName(subject) : null,
      role: access.role,
      canEdit: access.permissions.has("edit"),
      canViewSensitive: access.permissions.has("view_sensitive"),
    }

    if (!doc.ownerUserId) {
      return NextResponse.json({ ...header, started: false, content: null, values: {}, hiddenFieldLabels: [] })
    }

    const [row] = await db
      .select()
      .from(userState)
      .where(and(eq(userState.userId, doc.ownerUserId), eq(userState.key, doc.storageKey)))
      .limit(1)

    const filing = extractFiling(doc.surface, row?.value, doc.catalogId)

    if (!filing) {
      return NextResponse.json({ ...header, started: false, content: null, values: {}, hiddenFieldLabels: [] })
    }

    // Only a compliance filing can have a `sensitive` field (an SSN/ITIN) — transaction documents
    // never collect one, so this naturally comes back empty for that surface.
    const item = findComplianceItem(doc.catalogId)
    const sensitiveNames = new Set((item?.fields ?? []).filter((f) => f.sensitive).map((f) => f.name))
    const values: Record<string, string> = {}
    const hiddenFieldLabels: string[] = []

    // The persisted blob never holds a real sensitive value (see redactSensitiveDocValues) — it's
    // stored encrypted, separately, keyed by the owner. Decrypt from there for whoever is actually
    // allowed to see it; everyone else gets the mask, never the literal placeholder string.
    const encryptedByField = header.canViewSensitive
      ? new Map(
          (
            await db
              .select()
              .from(sensitiveFieldValues)
              .where(and(eq(sensitiveFieldValues.userId, doc.ownerUserId), eq(sensitiveFieldValues.docId, doc.catalogId)))
          ).map((r) => [r.fieldName, r.encryptedValue]),
        )
      : null

    for (const [name, value] of Object.entries(filing.values ?? {})) {
      if (sensitiveNames.has(name)) {
        const provided = !!value && value !== SENSITIVE_FIELD_PLACEHOLDER
        if (header.canViewSensitive) {
          const encrypted = encryptedByField?.get(name)
          values[name] = encrypted ? decryptSensitive(encrypted) : ""
        } else {
          values[name] = provided ? HIDDEN : ""
          const label = item?.fields.find((f) => f.name === name)?.label ?? name
          hiddenFieldLabels.push(label)
        }
      } else {
        values[name] = value
      }
    }

    return NextResponse.json({
      ...header,
      started: true,
      content: filing.content ?? null,
      values,
      hiddenFieldLabels,
    })
  } catch (err) {
    return errorResponse(err)
  }
}
