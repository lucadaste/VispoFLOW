"use client"

import { useState } from "react"
import { Check, Loader2, FileText, Landmark, Circle, HelpCircle, X } from "lucide-react"
import { DOCUMENTS, type DocStatus, type FlowAnswers, type LegalDoc } from "@/lib/flow"
import { renderDocumentContent } from "@/lib/document-templates"
import { DocumentViewer, type LibraryDoc } from "@/components/document-library"
import { cn } from "@/lib/utils"

export function DocumentTracker({
  statuses,
  answers,
}: {
  statuses: Record<string, DocStatus>
  answers: FlowAnswers
}) {
  const [viewing, setViewing] = useState<LibraryDoc | null>(null)
  const [infoDoc, setInfoDoc] = useState<LegalDoc | null>(null)

  const total = DOCUMENTS.length
  const completed = DOCUMENTS.filter(
    (d) => statuses[d.id] === "complete" || statuses[d.id] === "filing",
  ).length
  const pct = Math.round((completed / total) * 100)

  const groups = ["Incorporation", "Organizational Documents", "Equity Allocation", "Equity Plan"] as const

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
          Documents are drafted automatically as you answer. Every document you generate is saved to your
          personal document library under My Docs.
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
                const content =
                  status === "complete" || status === "filing"
                    ? renderDocumentContent(doc.id, answers)
                    : null
                const viewable = !!content

                const openRow = () =>
                  viewable
                    ? setViewing({
                        id: doc.id,
                        title: doc.label,
                        subtitle: doc.group,
                        content: content ?? undefined,
                        pending: status === "filing",
                      })
                    : setInfoDoc(doc)

                return (
                  <li
                    key={doc.id}
                    role="button"
                    tabIndex={0}
                    onClick={openRow}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        openRow()
                      }
                    }}
                    className={cn(
                      "flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-secondary",
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

      {viewing && <DocumentViewer doc={viewing} onClose={() => setViewing(null)} />}
      {infoDoc && <DocInfoModal doc={infoDoc} onClose={() => setInfoDoc(null)} />}
    </div>
  )
}

function DocInfoModal({ doc, onClose }: { doc: LegalDoc; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-balance text-foreground">{doc.label}</h3>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{doc.description}</p>
        <p className="mt-3 text-[11px] font-medium text-primary">
          This document hasn't been drafted yet — it'll appear here once the flow reaches it.
        </p>
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
        <Landmark className="h-2.5 w-2.5" />
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
