/**
 * Unit tests for the pure invite-expiry logic in lib/invitations.ts (`computeExpiry`). No
 * database. Run with `npm run test:invitations`.
 */
import { computeExpiry } from "../lib/invitations"

let failures = 0
const DAY_MS = 24 * 60 * 60 * 1000

function approx(name: string, gotMs: number, wantMs: number, toleranceMs = 5000) {
  const diff = Math.abs(gotMs - wantMs)
  if (diff <= toleranceMs) {
    console.log(`  ok   ${name}`)
  } else {
    failures++
    console.log(`  FAIL ${name}\n       got:  ${new Date(gotMs).toISOString()}\n       want: ${new Date(wantMs).toISOString()} (±${toleranceMs}ms)`)
  }
}

function assertFuture(name: string, ms: number) {
  if (ms > Date.now()) {
    console.log(`  ok   ${name} (in the future)`)
  } else {
    failures++
    console.log(`  FAIL ${name} — expiry is in the past: ${new Date(ms).toISOString()}`)
  }
}

const now = Date.now()
const iso = (deltaMs: number) => new Date(now + deltaMs).toISOString()

console.log("no deadline")
approx("plain invite → 7 days", computeExpiry(null).getTime(), now + 7 * DAY_MS)
approx("undefined deadline → 7 days", computeExpiry(undefined).getTime(), now + 7 * DAY_MS)
approx("garbage date string → 7 days", computeExpiry("not-a-date").getTime(), now + 7 * DAY_MS)

console.log("future deadline")
approx("deadline in 30 days → capped at 7 days", computeExpiry(iso(30 * DAY_MS)).getTime(), now + 7 * DAY_MS)
approx("deadline in 5 days → 2 days before it (3 days out)", computeExpiry(iso(5 * DAY_MS)).getTime(), now + 3 * DAY_MS)
approx("deadline in 1 day → floors at the deadline itself", computeExpiry(iso(1 * DAY_MS)).getTime(), now + 1 * DAY_MS)
approx("deadline in 12 hours → floors at the deadline itself", computeExpiry(iso(12 * 60 * 60 * 1000)).getTime(), now + 12 * 60 * 60 * 1000)

console.log("deadline already passed — must never mint an already-expired link")
assertFuture("deadline 3 days ago", computeExpiry(iso(-3 * DAY_MS)).getTime())
assertFuture("deadline 30 days ago", computeExpiry(iso(-30 * DAY_MS)).getTime())
approx("deadline 3 days ago → falls back to plain 7 days", computeExpiry(iso(-3 * DAY_MS)).getTime(), now + 7 * DAY_MS)

console.log("")
if (failures) {
  console.log(`${failures} failing case(s)`)
  process.exit(1)
}
console.log("all invitation-expiry cases pass")
