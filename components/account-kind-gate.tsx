"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Rocket, Scale } from "lucide-react"
import { loadFromServer, saveToServer } from "@/lib/persist"
import { STORAGE_KEYS } from "@/lib/storage-keys"

type AccountKind = "founder" | "firm"

/**
 * The one explicit fork in the product: are you filing for your own startup, or are you a lawyer
 * managing filings for clients? Asked once, the first time a genuinely new signed-in user lands
 * here — never re-asked, and never shown to someone who's already been using the app (their
 * existing incorporation progress is treated as an implicit "founder" answer, backfilled silently
 * so this doesn't interrupt anyone already mid-flow).
 *
 * Choosing "founder" just dismisses the gate — the founder app already supports inviting
 * collaborators (lawyers, advisors, co-founders) to individual filings without being part of a
 * firm. Choosing "firm" sends them to /firm, where the existing create/switch-organization and
 * explicit setup-confirmation screens take over (see lib/firm.ts).
 */
export function AccountKindGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const [status, setStatus] = useState<"checking" | "choose" | "resolved">("checking")

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      setStatus("resolved")
      return
    }

    let cancelled = false
    ;(async () => {
      const existing = await loadFromServer<{ kind: AccountKind }>(STORAGE_KEYS.accountKind)
      if (cancelled) return
      if (existing?.kind) {
        setStatus("resolved")
        return
      }
      // Already mid-flow (or done) as a founder before this gate existed — don't interrupt them
      // with a question whose answer is already obvious from what they've done.
      const hasFounderActivity = await loadFromServer<{ messages?: unknown[] }>(STORAGE_KEYS.incorporation)
      if (cancelled) return
      if (hasFounderActivity) {
        saveToServer(STORAGE_KEYS.accountKind, { kind: "founder" satisfies AccountKind })
        setStatus("resolved")
        return
      }
      setStatus("choose")
    })()
    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn])

  const choose = (kind: AccountKind) => {
    saveToServer(STORAGE_KEYS.accountKind, { kind })
    setStatus("resolved")
    if (kind === "firm") router.push("/firm")
  }

  if (status !== "choose") return <>{children}</>

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-xl text-center">
        <h1 className="font-serif text-xl font-bold tracking-tight text-foreground">How will you use VispoFLOW?</h1>
        <p className="mt-2 text-sm text-muted-foreground">You can change this later — this just decides what you see first.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => choose("founder")}
            className="group flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-colors hover:border-primary"
          >
            <Rocket className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold text-foreground">I&apos;m a founder</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              I&apos;m filing for my own startup — incorporation, compliance, and transaction documents. I&apos;m not
              currently going through a law firm or lawyer for this (or I want to handle it myself alongside them). I
              can still invite a lawyer, advisor, or co-founder to a specific filing whenever I need to.
            </p>
          </button>

          <button
            onClick={() => choose("firm")}
            className="group flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-colors hover:border-primary"
          >
            <Scale className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold text-foreground">I&apos;m a lawyer or firm</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              I manage filings and deadlines on behalf of clients — founders whose startups I represent. I want a
              roster of my clients with their deadlines, and a way to invite them to complete their own filings.
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}
