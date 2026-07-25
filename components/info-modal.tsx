"use client"

import { X } from "lucide-react"

/** Shared "what is this?" pop-up used by Compliance, Transactions, and Incorporation. */
export function InfoModal({
  title, description, footnote, onClose,
}: {
  title: string
  description: string
  footnote?: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-balance text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
        {footnote && <p className="mt-3 text-[11px] font-medium text-primary">{footnote}</p>}
      </div>
    </div>
  )
}

/** Shared styling for the small (i) affordance that opens an InfoModal. */
export const infoButtonClass = "shrink-0 rounded-full p-0.5 text-primary/70 transition-colors hover:bg-primary/10 hover:text-primary"
