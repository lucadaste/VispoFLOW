import { NextRequest, NextResponse } from "next/server"
import { sendDeadlineReminders } from "@/lib/notifications"

/**
 * Runs daily (see vercel.json's `crons`) to email anyone approaching a real filing deadline —
 * the 83(b) 30-day window, at 7 days and 2 days out. See lib/notifications.ts for how duplicates
 * are avoided across runs.
 *
 * Vercel signs its own cron requests with `Authorization: Bearer $CRON_SECRET` when that env var
 * is set — set CRON_SECRET in Vercel's project settings once this is deployed. Without it set,
 * the check is skipped (so local/dev testing via curl still works).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get("authorization")
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    const result = await sendDeadlineReminders(req.nextUrl.origin)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error("[cron/deadline-reminders] failed", err)
    return NextResponse.json({ ok: false, error: "Failed" }, { status: 500 })
  }
}
