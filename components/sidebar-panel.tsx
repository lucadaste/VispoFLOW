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
  bordered = true,
  children,
}: {
  icon: LucideIcon
  label: string
  widthClass: string
  side?: "left" | "right"
  defaultCollapsed?: boolean
  bordered?: boolean
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
            "flex w-10 flex-col items-center gap-2 border-border py-4 text-muted-foreground transition-colors hover:text-foreground",
            bordered ? "bg-card/40 hover:bg-secondary/60" : "bg-transparent",
            bordered && (isLeft ? "border-r" : "border-l")
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
    <aside
      className={cn(
        "relative hidden shrink-0 flex-col sm:flex",
        widthClass,
        bordered ? "bg-card/40" : "bg-transparent",
        bordered && (isLeft ? "border-r border-border" : "border-l border-border")
      )}
    >
      <button
        onClick={() => setCollapsed(true)}
        className={cn(
          "group absolute z-10 flex items-stretch justify-center transition-colors",
          bordered
            ? "top-3 h-6 w-6 rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:border-primary hover:text-primary"
            : "top-6 h-10 w-4 gap-0.5",
          isLeft ? "-right-3" : "-left-3"
        )}
        aria-label={`Minimize ${label}`}
      >
        {bordered ? (
          isLeft ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <>
            <span className="w-0.5 rounded-full bg-border transition-colors group-hover:bg-primary/60" />
            <span className="w-0.5 rounded-full bg-border transition-colors group-hover:bg-primary/60" />
            <span className="w-0.5 rounded-full bg-border transition-colors group-hover:bg-primary/60" />
          </>
        )}
      </button>
      {children}
    </aside>
  )
}
