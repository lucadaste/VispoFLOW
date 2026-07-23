export function loadPersisted<T>(key: string): T | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function savePersisted<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function clearPersisted(key: string) {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(key)
  } catch {}
}

/** Server-backed persistence for signed-in users, so state follows the account across devices. */

export async function loadFromServer<T>(key: string): Promise<T | null> {
  try {
    const res = await fetch(`/api/state/${key}`)
    if (!res.ok) return null
    const data = await res.json()
    return (data.value as T) ?? null
  } catch {
    return null
  }
}

export function saveToServer<T>(key: string, value: T) {
  fetch(`/api/state/${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  }).catch(() => {})
}

export function clearFromServer(key: string) {
  fetch(`/api/state/${key}`, { method: "DELETE" }).catch(() => {})
}
