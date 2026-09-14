import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { backfillDocumentsForUser } from "@/lib/documents"
import { syncCurrentUser } from "@/lib/users"
import { errorResponse } from "@/lib/api-errors"

/**
 * POST /api/documents/backfill — creates `documents` rows for all of the caller's filings that
 * already exist in their persisted blobs. Safe to call repeatedly (ensureDocument is idempotent);
 * the app can fire this once after sign-in so existing in-progress work becomes shareable.
 */
export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    await syncCurrentUser()

    const count = await backfillDocumentsForUser(userId)
    return NextResponse.json({ ok: true, processed: count })
  } catch (err) {
    return errorResponse(err)
  }
}
