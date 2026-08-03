/** A `sensitive` compliance field (e.g. an SSN/ITIN — see lib/flow.ts's `ComplianceField.sensitive`)
 *  is redacted out of the copy of a doc that gets written to localStorage or synced to the server
 *  (see components/document-library.tsx's `redactSensitiveDocValues`) — that value must never reach
 *  a place this account, or another device signed into it, could read it back later. But an ordinary
 *  page refresh in the same browser tab isn't "later" from the account holder's point of view — they
 *  didn't restart the filing or leave the page, so losing what they just typed reads as data loss,
 *  not privacy. sessionStorage is the right home for the real value in between: scoped to this one
 *  tab, cleared the moment the tab actually closes, and never sent anywhere — a refresh can restore
 *  it, but closing the tab (or signing in on another device) still can't recover it. */

import { SENSITIVE_FIELD_PLACEHOLDER } from "@/lib/sensitive-field"

const STORAGE_KEY = "vispo-sensitive-fields"

function readAll(): Record<string, string> {
  if (typeof window === "undefined") return {}
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeAll(map: Record<string, string>) {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {}
}

const sessionKey = (docId: string, fieldName: string) => `${docId}:${fieldName}`

/** Stashes whichever of `sensitiveNames` currently have a real (non-empty) value in `values` — call
 *  this right before redacting a doc/filing for persistence. */
export function stashSensitiveValues(docId: string, values: Record<string, string>, sensitiveNames: string[]) {
  const all = readAll()
  let changed = false
  for (const name of sensitiveNames) {
    // A value still holding the redacted placeholder (e.g. the real one hasn't been merged back
    // in yet from the server) is not a real value to stash — doing so would overwrite whatever
    // real value is already stashed here with the placeholder text itself.
    if (!values[name] || values[name] === SENSITIVE_FIELD_PLACEHOLDER) continue
    const k = sessionKey(docId, name)
    if (all[k] !== values[name]) {
      all[k] = values[name]
      changed = true
    }
  }
  if (changed) writeAll(all)
}

/** Overlays whichever of `sensitiveNames` still have a real value stashed in this tab's
 *  sessionStorage back over `values` (which otherwise holds the redacted placeholder for them) —
 *  call this right after loading a persisted doc/filing. Returns `values` unchanged (same
 *  reference) if nothing was restored, so callers can skip re-deriving anything that depends on it. */
export function restoreSensitiveValues(docId: string, values: Record<string, string>, sensitiveNames: string[]): Record<string, string> {
  const all = readAll()
  let changed = false
  const result = { ...values }
  for (const name of sensitiveNames) {
    const stashed = all[sessionKey(docId, name)]
    if (stashed && result[name] !== stashed) {
      result[name] = stashed
      changed = true
    }
  }
  return changed ? result : values
}

/** Drops a doc's stashed sensitive values — call when a filing is deleted or redone from scratch,
 *  so a later filing of the same id can't accidentally inherit a stale value. */
export function clearStashedSensitiveValues(docId: string, sensitiveNames: string[]) {
  const all = readAll()
  let changed = false
  for (const name of sensitiveNames) {
    const k = sessionKey(docId, name)
    if (k in all) {
      delete all[k]
      changed = true
    }
  }
  if (changed) writeAll(all)
}
