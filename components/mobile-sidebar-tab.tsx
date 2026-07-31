"use client"

import type { LucideIcon } from "lucide-react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileSidebarTab({
  icon: Icon,
  label,
  title,
  open,
  onOpenChange,
  side = "right",
  children,
}: {
  icon: LucideIcon
  label: string
  /** Heading shown in the open drawer's own title bar — the page name (e.g. "Compliance
   *  Center"), distinct from `label`. `children` already renders its own section heading
   *  (e.g. "Compliance Documents"/"History"), so reusing `label` here would show it twice. */
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  side?: "left" | "right"
  children: React.ReactNode
}) {
  const isLeft = side === "left"

  if (!open) {
    return (
      <button
        onClick={() => onOpenChange(true)}
        aria-label={`Open ${label}`}
        className={cn(
          "sm:hidden fixed top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-2 border border-border bg-card px-2 py-3 text-foreground shadow-md transition-colors hover:border-primary hover:text-primary",
          isLeft ? "left-0 rounded-r-xl border-l-0" : "right-0 rounded-l-xl border-r-0"
        )}
      >
        <Icon className="h-4 w-4" />
        <span className="[writing-mode:vertical-rl] rotate-180 text-xs font-medium tracking-wide">{label}</span>
      </button>
    )
  }

  return (
    <div className={cn("sm:hidden fixed inset-0 z-50 flex", isLeft ? "justify-start" : "justify-end")}>
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      {/* Below `sm` the chat column has no room left to shrink — the sidebar always fully
       *  occupies the screen when open, so the drawer takes the whole width rather than a
       *  partial one that would just show backdrop blur beside it. */}
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
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
