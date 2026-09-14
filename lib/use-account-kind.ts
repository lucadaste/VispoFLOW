"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { loadFromServer, saveToServer } from "@/lib/persist"
import { STORAGE_KEYS } from "@/lib/storage-keys"

export type AccountKind = "founder" | "firm"

/**
 * The one account-level fork: filing for your own startup, or managing filings on behalf of
 * clients. Decided once and then enforced — see components/account-kind-gate.tsx (guards /app)
 * and components/firm-kind-gate.tsx (guards /firm). A founder can still invite a specific person
 * to one filing (the collaborators feature); that's document-level sharing, unrelated to this.
 *
 * An existing user with prior incorporation activity is silently backfilled as "founder" so this
 * never interrupts someone who was already using the app before this existed.
 */
export function useAccountKind(): {
  kind: AccountKind | null
  loading: boolean
  choose: (kind: AccountKind) => void
} {
  const { isLoaded, isSignedIn } = useAuth()
  const [kind, setKind] = useState<AccountKind | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      setLoading(false)
      return
    }

    let cancelled = false
    ;(async () => {
      const existing = await loadFromServer<{ kind: AccountKind }>(STORAGE_KEYS.accountKind)
      if (cancelled) return
      if (existing?.kind) {
        setKind(existing.kind)
        setLoading(false)
        return
      }
      // Already mid-flow (or done) as a founder before this gate existed — don't ask a question
      // whose answer is already obvious from what they've done.
      const hasFounderActivity = await loadFromServer<{ messages?: unknown[] }>(STORAGE_KEYS.incorporation)
      if (cancelled) return
      if (hasFounderActivity) {
        saveToServer(STORAGE_KEYS.accountKind, { kind: "founder" satisfies AccountKind })
        setKind("founder")
        setLoading(false)
        return
      }
      setLoading(false) // kind stays null — caller shows the chooser
    })()
    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn])

  const choose = useCallback((next: AccountKind) => {
    saveToServer(STORAGE_KEYS.accountKind, { kind: next })
    setKind(next)
  }, [])

  return { kind: isSignedIn ? kind : null, loading, choose }
}
