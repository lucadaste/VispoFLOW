/**
 * Unit tests for the pure logic in lib/documents.ts: the status pipeline (`canTransition`) and
 * the 83(b) deadline computation (`computeDeadlineDate`). No database. Run with
 * `npm run test:documents`.
 */
import { canTransition, computeDeadlineDate, type DocumentStatus } from "../lib/documents"

let failures = 0
function check(name: string, got: unknown, want: unknown) {
  if (got === want) {
    console.log(`  ok   ${name}`)
  } else {
    failures++
    console.log(`  FAIL ${name}\n       got:  ${JSON.stringify(got)}\n       want: ${JSON.stringify(want)}`)
  }
}

console.log("status pipeline — forward moves")
check("draft -> awaiting_client_info", canTransition("draft", "awaiting_client_info"), true)
check("awaiting_client_info -> awaiting_review", canTransition("awaiting_client_info", "awaiting_review"), true)
check("awaiting_review -> ready_to_sign", canTransition("awaiting_review", "ready_to_sign"), true)
check("ready_to_sign -> signed", canTransition("ready_to_sign", "signed"), true)
check("signed -> filed", canTransition("signed", "filed"), true)
check("same state is always a no-op allow", canTransition("draft", "draft"), true)

console.log("status pipeline — explicit back-steps")
check("awaiting_review -> awaiting_client_info (send back)", canTransition("awaiting_review", "awaiting_client_info"), true)
check("ready_to_sign -> awaiting_review (re-review)", canTransition("ready_to_sign", "awaiting_review"), true)

console.log("status pipeline — disallowed jumps")
check("draft -> signed (skips the pipeline)", canTransition("draft", "signed"), false)
check("filed -> anything (terminal)", canTransition("filed", "draft"), false)
check("signed -> draft (too far back)", canTransition("signed", "draft"), false)
check("draft -> filed", canTransition("draft" as DocumentStatus, "filed"), false)

console.log("83(b) deadline computation")
check("83b + grantDate → +30 days", computeDeadlineDate("83b", { grantDate: "2026-01-01" }), "2026-01-31")
check("83b, no grantDate → null", computeDeadlineDate("83b", {}), null)
check("83b, garbage grantDate → null", computeDeadlineDate("83b", { grantDate: "not-a-date" }), null)
check("non-83b filing → null even with a grantDate", computeDeadlineDate("ein", { grantDate: "2026-01-01" }), null)
check("no values at all → null", computeDeadlineDate("83b", null), null)

console.log("")
if (failures) {
  console.log(`${failures} failing case(s)`)
  process.exit(1)
}
console.log("all document-pipeline cases pass")
