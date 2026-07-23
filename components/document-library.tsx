"use client"

import { useState } from "react"
import { Building2, ShieldCheck, ArrowLeftRight, FileText, Check, X, Send, Download } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type LibraryDoc = {
  id: string
  title: string
  subtitle: string
  content?: string
  /** true while an external process (e.g. a state filing) is still resolving in the real world */
  pending?: boolean
}

function downloadDoc(doc: LibraryDoc) {
  if (!doc.content) return
  const blob = new Blob([doc.content], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${doc.title}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

type Phase = "chat" | "compliance" | "transactions"

export function DocumentLibrary({
  incorporationDocs,
  complianceDocs,
  transactionDocs,
  onNavigate,
}: {
  incorporationDocs: LibraryDoc[]
  complianceDocs: LibraryDoc[]
  transactionDocs: LibraryDoc[]
  onNavigate: (phase: Phase) => void
}) {
  const total = incorporationDocs.length + complianceDocs.length + transactionDocs.length
  const [viewing, setViewing] = useState<LibraryDoc | null>(null)

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Document Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every document generated across Incorporation, Compliance, and Transactions, all in one place.
            {total > 0 && ` ${total} document${total === 1 ? "" : "s"} so far.`}
          </p>
        </div>

        <div className="space-y-8">
          <DocSection
            icon={Building2}
            title="Incorporation Documents"
            docs={incorporationDocs}
            emptyText="Formation documents will appear here as you complete the Incorporation flow."
            ctaLabel="Go to Incorporation"
            onCta={() => onNavigate("chat")}
            onView={setViewing}
          />
          <DocSection
            icon={ShieldCheck}
            title="Compliance Documents"
            docs={complianceDocs}
            emptyText="Filed compliance items will appear here as you complete them in the Compliance Center."
            ctaLabel="Go to Compliance"
            onCta={() => onNavigate("compliance")}
            onView={setViewing}
          />
          <DocSection
            icon={ArrowLeftRight}
            title="Transaction Documents"
            docs={transactionDocs}
            emptyText="Grants, issuances, and transfers will appear here as you record them in Transactions."
            ctaLabel="Go to Transactions"
            onCta={() => onNavigate("transactions")}
            onView={setViewing}
          />
        </div>
      </div>

      {viewing && <DocumentViewer doc={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}

function DocSection({
  icon: Icon,
  title,
  docs,
  emptyText,
  ctaLabel,
  onCta,
  onView,
}: {
  icon: LucideIcon
  title: string
  docs: LibraryDoc[]
  emptyText: string
  ctaLabel: string
  onCta: () => void
  onView: (doc: LibraryDoc) => void
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
        <span className="text-xs font-medium text-muted-foreground">{docs.length}</span>
      </div>

      {docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/40 px-6 py-8 text-center">
          <FileText className="h-6 w-6 text-muted-foreground/40" />
          <p className="max-w-sm text-xs text-muted-foreground">{emptyText}</p>
          <button
            onClick={onCta}
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
          >
            {ctaLabel}
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => {
            const viewable = !!doc.content
            const downloadable = viewable && !doc.pending
            return (
              <div
                key={doc.id}
                role={viewable ? "button" : undefined}
                tabIndex={viewable ? 0 : undefined}
                onClick={viewable ? () => onView(doc) : undefined}
                onKeyDown={viewable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onView(doc) } } : undefined}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left shadow-sm ${
                  doc.pending ? "border-primary/30 bg-primary/5" : "border-border bg-card"
                } ${viewable ? "cursor-pointer transition-colors hover:border-primary/40" : ""}`}
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-[13px] font-medium text-foreground">{doc.title}</p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{doc.subtitle}</p>
                  {doc.pending ? (
                    <p className="mt-1 text-[10px] font-medium text-primary">Filing with the state — usually same-day to a few business days</p>
                  ) : viewable ? (
                    <p className="mt-1 text-[10px] font-medium text-primary">View document →</p>
                  ) : null}
                </div>
                {downloadable && (
                  <button
                    onClick={(e) => { e.stopPropagation(); downloadDoc(doc) }}
                    title="Download"
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                )}
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    doc.pending ? "bg-primary text-primary-foreground" : "bg-success text-success-foreground"
                  }`}
                >
                  {doc.pending ? <Send className="h-2.5 w-2.5" /> : <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function DocumentViewer({ doc, onClose }: { doc: LibraryDoc; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-card shadow-xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div className="pr-4">
            <h3 className="text-base font-semibold text-foreground text-balance">{doc.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{doc.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-foreground">{doc.content}</pre>
        </div>
      </div>
    </div>
  )
}
