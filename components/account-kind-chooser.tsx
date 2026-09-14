"use client"

import { Rocket, Scale } from "lucide-react"
import type { AccountKind } from "@/lib/use-account-kind"

/** The one-time, full-screen fork shown before either side of the app renders. Used by both
 *  account-kind-gate.tsx (/app) and firm-kind-gate.tsx (/firm) so landing on either page first
 *  asks the same question the same way. */
export function AccountKindChooser({ onChoose }: { onChoose: (kind: AccountKind) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-xl text-center">
        <h1 className="font-serif text-xl font-bold tracking-tight text-foreground">How will you use VispoFLOW?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This decides which version of the site you see — you can&apos;t switch later without contacting us.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => onChoose("founder")}
            className="group flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-colors hover:border-primary"
          >
            <Rocket className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold text-foreground">I&apos;m a founder</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              I&apos;m filing for my own startup — incorporation, compliance, and transaction documents. I can still
              invite a lawyer, advisor, or co-founder to review or complete a specific filing whenever I need to.
            </p>
          </button>

          <button
            onClick={() => onChoose("firm")}
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
