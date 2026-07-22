"use client"

import { useState } from "react"
import type { LucideIcon } from "lucide-react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function SidebarPanel({
  icon: Icon,
  label,
  widthClass,
  children,
}: {
  icon: LucideIcon
  label: string
  widthClass: string
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)

  if (collapsed) {
    return (
      <div className="hidden shrink-0 sm:flex">
        <button
          onClick={() => setCollapsed(false)}
          className="flex w-10 flex-col items-center gap-2 border-l border-border bg-card/40 py-4 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          aria-label={`Expand ${label}`}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <Icon className="h-4 w-4" />
          <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-medium tracking-wide">{label}</span>
        </button>
      </div>
    )
  }

  return (
    <aside className={`relative hidden ${widthClass} shrink-0 flex-col border-l border-border bg-card/40 sm:flex`}>
      <button
        onClick={() => setCollapsed(true)}
        className="absolute -left-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
        aria-label={`Minimize ${label}`}
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
      {children}
    </aside>
  )
}
