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
            "flex flex-col items-center text-muted-foreground transition-colors hover:text-foreground",
            bordered
              ? "w-10 gap-2 border-border bg-card/40 py-4 hover:bg-secondary/60"
              : "w-8 gap-1.5 py-3",
            bordered && (isLeft ? "border-r" : "border-l")
          )}
          aria-label={`Expand ${label}`}
        >
          {bordered && (isLeft ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />)}
          <Icon className={bordered ? "h-4 w-4" : "h-5 w-5"} />
          {bordered && (
            <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-medium tracking-wide">{label}</span>
          )}
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
          "group absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center transition-colors",
          bordered
            ? "h-9 w-3 rounded-full border border-border/60 bg-card/80 text-muted-foreground/60 hover:border-primary hover:bg-primary/10 hover:text-primary"
            : "top-6 h-10 w-4 translate-y-0 gap-0.5",
          isLeft ? (bordered ? "-right-1.5" : "-right-3") : bordered ? "-left-1.5" : "-left-3"
        )}
        aria-label={`Minimize ${label}`}
      >
        {bordered ? (
          isLeft ? (
            <ChevronLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
          ) : (
            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          )
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
