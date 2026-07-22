"use client"

import type { LucideIcon } from "lucide-react"
import { X } from "lucide-react"

export function MobileSidebarTab({
  icon: Icon,
  label,
  count,
  open,
  onOpenChange,
  children,
}: {
  icon: LucideIcon
  label: string
  count?: { done: number; total: number }
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  if (!open) {
    return (
      <button
        onClick={() => onOpenChange(true)}
        className="sm:hidden fixed right-0 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-2 rounded-l-xl border border-r-0 border-border bg-card px-2 py-3 text-foreground shadow-md transition-colors hover:border-primary hover:text-primary"
      >
        <Icon className="h-4 w-4" />
        <span className="[writing-mode:vertical-rl] rotate-180 text-xs font-medium tracking-wide">{label}</span>
        {count && count.total > 0 && (
          <span className="text-[10px] text-muted-foreground">{count.done}/{count.total}</span>
        )}
      </button>
    )
  }

  return (
    <div className="sm:hidden fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative flex h-full w-[85%] max-w-sm flex-col overflow-hidden bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-semibold text-foreground">{label}</h2>
          <button onClick={() => onOpenChange(false)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
