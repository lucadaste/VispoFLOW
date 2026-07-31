"use client"

import { useState } from "react"
import type { LucideIcon } from "lucide-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function SidebarPanel({
  icon: Icon,
  label,
  widthClass,
  side = "right",
  defaultCollapsed = false,
  children,
}: {
  icon: LucideIcon
  label: string
  widthClass: string
  side?: "left" | "right"
  defaultCollapsed?: boolean
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const isLeft = side === "left"

  if (collapsed) {
    return (
      <div className="hidden shrink-0 sm:flex">
        <button
          onClick={() => setCollapsed(false)}
          className={cn(
            "flex w-10 flex-col items-center gap-2 border-border bg-card/40 py-4 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground",
            isLeft ? "border-r" : "border-l"
          )}
          aria-label={`Expand ${label}`}
        >
          {isLeft ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          <Icon className="h-4 w-4" />
          <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-medium tracking-wide">{label}</span>
        </button>
      </div>
    )
  }

  return (
    <aside className={cn("relative hidden shrink-0 flex-col bg-card/40 sm:flex", widthClass, isLeft ? "border-r" : "border-l", "border-border")}>
      <button
        onClick={() => setCollapsed(true)}
        className={cn(
          "absolute top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:border-primary hover:text-primary",
          isLeft ? "-right-3" : "-left-3"
        )}
        aria-label={`Minimize ${label}`}
      >
        {isLeft ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>
      {children}
    </aside>
  )
}
