"use client"

import { useState } from "react"
import type { LucideIcon } from "lucide-react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function SidebarPanel({
  icon: Icon,
  label,
  widthClass,
  side = "right",
  defaultCollapsed = false,
  bordered = true,
  /** Render the expanded panel as a floating overlay — absolutely positioned over the content,
   *  with a click-away backdrop and an X to close — instead of a flex sibling that pushes the
   *  rest of the layout over when it opens. The collapsed icon tab is unaffected either way.
   *  Used by History, which must never resize the chat column (see compliance-view.tsx /
   *  transactions-onboarding.tsx). Requires a `relative` ancestor to position against. */
  overlay = false,
  children,
}: {
  icon: LucideIcon
  label: string
  widthClass: string
  side?: "left" | "right"
  defaultCollapsed?: boolean
  bordered?: boolean
  overlay?: boolean
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const isLeft = side === "left"

  if (collapsed) {
    // In overlay mode the icon tab floats over the content (absolute) instead of taking real
    // space in the flex row — so its mere presence never shifts the chat column, matching
    // Incorporation's layout exactly even before it's ever opened.
    if (overlay) {
      return (
        <button
          onClick={() => setCollapsed(false)}
          aria-label={`Expand ${label}`}
          className={cn(
            "absolute top-2 z-10 hidden h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex",
            isLeft ? "left-2" : "right-2"
          )}
        >
          <Icon className="h-5 w-5" />
        </button>
      )
    }
    return (
      <div className="hidden shrink-0 sm:flex">
        <button
          onClick={() => setCollapsed(false)}
          className={cn(
            "flex flex-col items-center text-muted-foreground transition-colors hover:text-foreground",
            bordered
              ? "w-10 gap-2 border-border bg-card/40 py-4 hover:bg-secondary/60"
              : "w-9 gap-1.5 pl-1 pt-5 pb-3",
            bordered && (isLeft ? "border-r" : "border-l")
          )}
          aria-label={`Expand ${label}`}
        >
          {bordered && (isLeft ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />)}
          <Icon className={bordered ? "h-4 w-4" : "h-6 w-6"} />
          {bordered && (
            <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-medium tracking-wide">{label}</span>
          )}
        </button>
      </div>
    )
  }

  if (overlay) {
    return (
      <>
        <div
          className="absolute inset-0 z-10 hidden sm:block"
          onClick={() => setCollapsed(true)}
        />
        <aside
          className={cn(
            "animate-panel-drop-in absolute top-0 z-20 hidden max-h-full shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl sm:flex",
            widthClass,
            isLeft ? "left-0" : "right-0"
          )}
        >
          <button
            onClick={() => setCollapsed(true)}
            aria-label={`Close ${label}`}
            className="absolute right-2 top-2 z-10 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          {children}
        </aside>
      </>
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
          "group absolute top-1/2 z-10 flex -translate-y-1/2 justify-center transition-colors",
          bordered ? "items-center" : "items-stretch",
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
