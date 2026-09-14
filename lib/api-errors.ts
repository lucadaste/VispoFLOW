import { NextResponse } from "next/server"
import { AccessError } from "@/lib/permissions"
import { InvitationError } from "@/lib/invitations"

/** Maps the typed domain errors to HTTP responses; anything else is a 500 with a generic message
 *  (the real error is logged, never returned). */
export function errorResponse(err: unknown): NextResponse {
  if (err instanceof AccessError || err instanceof InvitationError) {
    return NextResponse.json({ error: err.message }, { status: err.status })
  }
  console.error("[api] unhandled error", err)
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
}
