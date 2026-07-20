"use client"

import { Scale, RotateCcw } from "lucide-react"

export function TopBar({
  phase,
  onReset,
}: {
  phase: "chat" | "compliance"
  onReset: () => void
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur shadow-sm">
      <div className="flex h-14 w-full items-center justify-between px-4 sm:px-8 lg:px-12">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Scale className="h-4.5 w-4.5" strokeWidth={2} />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">Vispo</p>
            <p className="text-[11px] text-muted-foreground">Incorporation Studio</p>
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <PhasePill active={phase === "chat"} label="Formation" />
          <div className="h-px w-6 bg-border" />
          <PhasePill active={phase === "compliance"} label="Compliance" />
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          New session
        </button>
      </div>
    </header>
  )
}

function PhasePill({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={
        "rounded-full px-2.5 py-1 text-xs font-medium transition-colors " +
        (active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-muted-foreground")
      }
    >
      {label}
    </span>
  )
}
