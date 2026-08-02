/** Client side of app/api/sensitive-fields/route.ts — the encrypted, account-scoped backup of a
 *  `sensitive` compliance field's real value. Meaningful only for a signed-in account (the server
 *  has no account to scope storage to otherwise); calling these while signed out just fails the
 *  server's auth check harmlessly, so callers don't need to gate on sign-in state themselves. See
 *  lib/sensitive-session-store.ts for the same-tab, no-account-needed fallback this supplements —
 *  that one survives a page refresh, this one survives closing the tab and coming back later. */

export function saveSensitiveValueToServer(docId: string, fieldName: string, value: string) {
  if (!value) return
  fetch("/api/sensitive-fields", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ docId, fieldName, value }),
  }).catch(() => {})
}

export async function loadSensitiveValuesFromServer(docId: string): Promise<Record<string, string>> {
  try {
    const res = await fetch(`/api/sensitive-fields?docId=${encodeURIComponent(docId)}`)
    if (!res.ok) return {}
    const data = await res.json()
    return data.values ?? {}
  } catch {
    return {}
  }
}

/** Call once a document's real value is no longer needed — it's been signed or downloaded, or the
 *  filing it belongs to was deleted/redone from scratch. */
export function purgeSensitiveValuesFromServer(docId: string) {
  fetch(`/api/sensitive-fields?docId=${encodeURIComponent(docId)}`, { method: "DELETE" }).catch(() => {})
}
