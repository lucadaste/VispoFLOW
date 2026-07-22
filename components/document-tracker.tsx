"use client"

import { Check, Loader2, FileText, Send, Circle, HelpCircle } from "lucide-react"
import { DOCUMENTS, type DocStatus } from "@/lib/flow"
import { cn } from "@/lib/utils"

export function DocumentTracker({
  statuses,
}: {
  statuses: Record<string, DocStatus>
}) {
  const total = DOCUMENTS.length
  const completed = DOCUMENTS.filter(
    (d) => statuses[d.id] === "complete" || statuses[d.id] === "filing",
  ).length
  const pct = Math.round((completed / total) * 100)

  const groups = ["Formation", "Equity"] as const

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Incorporation Documents</h2>
          <span className="text-xs font-medium text-muted-foreground">
            {completed}/{total}
          </span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-success transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Documents are drafted automatically as you answer.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {groups.map((group) => (
          <div key={group} className="mb-4 last:mb-0">
            <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group}
            </p>
            <ul className="space-y-0.5">
              {DOCUMENTS.filter((d) => d.group === group).map((doc) => {
                const status = statuses[doc.id] ?? "pending"
                return (
                  <li
                    key={doc.id}
                    className={cn(
                      "flex items-start gap-2.5 rounded-lg px-2 py-2 transition-colors",
                      status === "drafting" && "bg-accent/10",
                      status === "filing" && "bg-primary/5",
                    )}
                  >
                    <StatusIcon status={status} />
                    <div className="min-w-0 flex-1 leading-tight">
                      <p
                        className={cn(
                          "truncate text-[13px] font-medium",
                          status === "pending" ? "text-muted-foreground" : "text-foreground",
                        )}
                      >
                        {doc.label}
                      </p>
                      <p className="truncate font-mono text-[10px] text-muted-foreground">
                        {doc.short}
                      </p>
                    </div>
                    <StatusBadge status={status} />
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusIcon({ status }: { status: DocStatus }) {
  const base = "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
  if (status === "complete")
    return (
      <span className={cn(base, "bg-success text-success-foreground")}>
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    )
  if (status === "filing")
    return (
      <span className={cn(base, "bg-primary text-primary-foreground")}>
        <Send className="h-2.5 w-2.5" />
      </span>
    )
  if (status === "drafting")
    return (
      <span className={cn(base, "text-accent")}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </span>
    )
  return (
    <span className={cn(base, "text-muted-foreground/40")}>
      <Circle className="h-3.5 w-3.5" />
    </span>
  )
}

function StatusBadge({ status }: { status: DocStatus }) {
  if (status === "drafting")
    return <span className="shrink-0 text-[10px] font-medium text-accent-foreground/70">Drafting</span>
  if (status === "filing")
    return (
      <span className="group/tip relative flex shrink-0 items-center gap-0.5 text-[10px] font-medium text-primary">
        Filing
        <HelpCircle className="h-2.5 w-2.5 cursor-help text-primary/60" />
        <span className="pointer-events-none absolute right-0 top-full z-10 mt-1.5 w-44 rounded-md border border-border bg-popover px-2 py-1.5 text-[10px] font-normal leading-snug text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover/tip:opacity-100">
          Delaware is processing the filing. This can take anywhere from same-day to a few business days.
        </span>
      </span>
    )
  return null
}

export function DocumentTrackerEmpty() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <FileText className="h-8 w-8 text-muted-foreground/40" />
      <p className="mt-3 text-sm font-medium text-foreground">No documents yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Start the conversation and your formation documents will appear here.
      </p>
    </div>
  )
}
