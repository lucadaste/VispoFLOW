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

// Per-key queue of in-flight writes (PUT/DELETE). Reads and writes to a given key are fire-and-forget
// at the call site, so without this a load that starts after a save/clear was *triggered* could still
// win the race and return stale data, undoing the save/clear it should have seen. Every write to a key
// is chained after the previous one, and reads wait for the latest queued write before fetching.
const pendingWrites = new Map<string, Promise<void>>()

// Registers `key`'s pending-write slot synchronously (before any `await`), so any loadFromServer
// call issued right after — even in the same tick, e.g. a fire-and-forget update followed
// immediately by a tab switch that remounts a view — is guaranteed to see this op queued and wait for it.
function enqueueWrite(key: string, run: () => Promise<void>): Promise<void> {
  const prior = pendingWrites.get(key) ?? Promise.resolve()
  const write = prior.then(run)
  pendingWrites.set(key, write)
  write.then(() => {
    if (pendingWrites.get(key) === write) pendingWrites.delete(key)
  })
  return write
}

async function fetchServerValue<T>(key: string): Promise<T | null> {
  try {
    const res = await fetch(`/api/state/${key}`)
    if (!res.ok) return null
    const data = await res.json()
    return (data.value as T) ?? null
  } catch {
    return null
  }
}

export async function loadFromServer<T>(key: string): Promise<T | null> {
  await pendingWrites.get(key)
  return fetchServerValue<T>(key)
}

export function saveToServer<T>(key: string, value: T) {
  enqueueWrite(key, () =>
    fetch(`/api/state/${key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    }).then(() => {}).catch(() => {})
  )
}

export function clearFromServer(key: string): Promise<void> {
  return enqueueWrite(key, () =>
    fetch(`/api/state/${key}`, { method: "DELETE" }).then(() => {}).catch(() => {})
  )
}

/** Atomic read-modify-write against the server copy of `key`. Queues as one op (see enqueueWrite)
 *  so a concurrent loadFromServer for the same key can't read between the GET and the PUT and pick
 *  up a half-updated value — e.g. deleting one doc from the Library while the owning flow's view
 *  is unmounted, then immediately switching back to it. `mutate` returns the value to save, or
 *  `null` to skip the write (current state already reflects the desired outcome). */
export function updateServerValue<T>(key: string, mutate: (current: T | null) => T | null): Promise<void> {
  return enqueueWrite(key, async () => {
    const current = await fetchServerValue<T>(key)
    const next = mutate(current)
    if (next === null) return
    await fetch(`/api/state/${key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: next }),
    }).catch(() => {})
  })
}
