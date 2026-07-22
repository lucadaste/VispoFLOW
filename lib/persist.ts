export function loadPersisted<T>(key: string): T | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function savePersisted<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function clearPersisted(key: string) {
  if (typeof window === "undefined") return
  try {
    sessionStorage.removeItem(key)
  } catch {}
}
