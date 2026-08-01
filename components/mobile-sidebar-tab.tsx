"use client"

import type { LucideIcon } from "lucide-react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileSidebarTab({
  icon: Icon,
  label,
  title,
  /** Suppress the floating top-right trigger button — used when the page renders its own
   *  trigger elsewhere (e.g. stacked in the header) instead of floating one over the chat. */
  hideTrigger = false,
  open,
  onOpenChange,
  children,
}: {
  icon: LucideIcon
  label: string
  /** Heading shown in the open drawer's own title bar — the page name (e.g. "Compliance
   *  Center"), distinct from `label`. `children` already renders its own section heading
   *  (e.g. "Compliance Documents"/"History"), so reusing `label` here would show it twice. */
  title: string
  hideTrigger?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  if (!open) {
    if (hideTrigger) return null
    return (
      <button
        onClick={() => onOpenChange(true)}
        aria-label={`Open ${label}`}
        title={label}
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:hidden"
      >
        <Icon className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end sm:hidden">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      {/* Below `sm` the chat column has no room left to shrink — the sidebar always fully
       *  occupies the screen when open, so the drawer takes the whole width rather than a
       *  partial one that would just show backdrop blur beside it. */}
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          <button
            onClick={() => onOpenChange(false)}
            aria-label={`Close ${label}`}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
