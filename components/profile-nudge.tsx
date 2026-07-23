"use client"

import { UserRoundPen, X } from "lucide-react"

export function ProfileNudge({ onOpen, onDismiss }: { onOpen: () => void; onDismiss: () => void }) {
  return (
    <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <UserRoundPen className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">Save your company info and signature</p>
        <p className="text-xs text-muted-foreground">Set it up once and it'll autofill into your documents going forward.</p>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="shrink-0 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
      >
        Set up
      </button>
      <button
        type="button"
        onClick={onDismiss}
        title="Dismiss"
        className="shrink-0 rounded-md p-1.5 text-muted-foreground/60 transition-colors hover:bg-secondary hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
