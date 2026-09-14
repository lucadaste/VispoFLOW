import { sql, and, eq, isNotNull, notInArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { documents, accounts, accountMemberships, auditLog } from "@/lib/collab-schema"
import { getUsers, displayName, type UserRow } from "@/lib/users"
import { sendDeadlineReminderEmail } from "@/lib/email"
import { logAudit } from "@/lib/audit"
import { daysUntil } from "@/lib/firm"

/**
 * The 83(b) 30-day deadline can't be extended, so this is the single highest-value notification
 * in the whole feature — see app/api/cron/deadline-reminders. Two windows: 7 days out and 2 days
 * out (per the plan). Each is sent at most once per document, tracked via the audit log rather
 * than a new column — a "deadline_reminder_sent" row with `metadata.window` is the record.
 * Windows are `<=` ranges (not an exact day match) so a missed cron run still catches up on the
 * next one instead of silently skipping a document.
 */

type Window = 7 | 2

export async function sendDeadlineReminders(appOrigin: string): Promise<{ checked: number; sent: number }> {
  const candidates = await db
    .select()
    .from(documents)
    .where(and(isNotNull(documents.deadlineDate), notInArray(documents.status, ["signed", "filed"])))

  let sent = 0
  for (const doc of candidates) {
    const days = daysUntil(doc.deadlineDate)
    if (days === null) continue

    const window: Window | null = days <= 2 ? 2 : days <= 7 ? 7 : null
    if (window === null) continue
    if (await reminderAlreadySent(doc.id, window)) continue

    const recipients = await resolveDeadlineRecipients(doc)
    if (!recipients.length) continue

    for (const r of recipients) {
      await sendDeadlineReminderEmail({
        to: r.email,
        recipientName: r.name,
        docTitle: doc.title,
        deadlineDate: doc.deadlineDate!,
        daysLeft: days,
        appUrl: `${appOrigin}${r.isSubject ? "/app" : `/shared/${doc.id}`}`,
      }).catch((err) => console.error("[notifications] deadline reminder send failed", doc.id, err))
    }

    await logAudit({
      action: "deadline_reminder_sent",
      accountId: doc.accountId,
      documentId: doc.id,
      metadata: { window, daysLeft: days, recipientCount: recipients.length },
    })
    sent++
  }

  return { checked: candidates.length, sent }
}

async function reminderAlreadySent(documentId: string, window: Window): Promise<boolean> {
  const [row] = await db
    .select({ id: auditLog.id })
    .from(auditLog)
    .where(
      and(
        eq(auditLog.documentId, documentId),
        eq(auditLog.action, "deadline_reminder_sent"),
        sql`(${auditLog.metadata}->>'window')::int = ${window}`,
      ),
    )
    .limit(1)
  return !!row
}

async function resolveDeadlineRecipients(
  doc: typeof documents.$inferSelect,
): Promise<{ email: string; name: string; isSubject: boolean }[]> {
  const subjectId = doc.ownerUserId ?? doc.clientUserId
  const ids = new Set<string>()
  if (subjectId) ids.add(subjectId)

  const [account] = await db.select().from(accounts).where(eq(accounts.id, doc.accountId)).limit(1)
  let assigneeId: string | null = null
  if (account?.type === "firm") {
    assigneeId = doc.assignedToUserId
    if (!assigneeId) {
      const [owner] = await db
        .select()
        .from(accountMemberships)
        .where(and(eq(accountMemberships.accountId, doc.accountId), eq(accountMemberships.role, "owner")))
        .limit(1)
      assigneeId = owner?.userId ?? null
    }
    if (assigneeId) ids.add(assigneeId)
  }

  if (!ids.size) return []
  const usersById = await getUsers([...ids])

  const toRecipient = (id: string, isSubject: boolean): { email: string; name: string; isSubject: boolean } | null => {
    const u: UserRow | undefined = usersById.get(id)
    return u?.email ? { email: u.email, name: displayName(u), isSubject } : null
  }

  const out: { email: string; name: string; isSubject: boolean }[] = []
  if (subjectId) {
    const r = toRecipient(subjectId, true)
    if (r) out.push(r)
  }
  if (assigneeId && assigneeId !== subjectId) {
    const r = toRecipient(assigneeId, false)
    if (r) out.push(r)
  }
  return out
}
