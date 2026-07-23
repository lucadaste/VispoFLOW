"use client"

import { useState } from "react"
import { Building2, ShieldCheck, ArrowLeftRight, FileText, Check, X, Send, Download, Trash2, RotateCcw, ChevronDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type LibraryDoc = {
  id: string
  title: string
  subtitle: string
  content?: string
  /** true while an external process (e.g. a state filing) is still resolving in the real world */
  pending?: boolean
  /** true if the user deleted this from My Docs — kept around (not the underlying doc) so it can be restored */
  hidden?: boolean
}

const DOWNLOAD_FORMATS = ["pdf", "txt", "jpeg"] as const
type DownloadFormat = (typeof DOWNLOAD_FORMATS)[number]

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function downloadAsTxt(doc: LibraryDoc) {
  triggerDownload(new Blob([doc.content ?? ""], { type: "text/plain" }), `${doc.title}.txt`)
}

async function downloadAsPdf(doc: LibraryDoc) {
  const { jsPDF } = await import("jspdf")
  const pdf = new jsPDF({ unit: "pt", format: "letter" })
  const margin = 56
  const lineHeight = 16
  const maxWidth = pdf.internal.pageSize.getWidth() - margin * 2
  const pageHeight = pdf.internal.pageSize.getHeight()

  pdf.setFont("times", "normal")
  pdf.setFontSize(11)

  const lines: string[] = pdf.splitTextToSize(doc.content ?? "", maxWidth)
  let y = margin
  for (const line of lines) {
    if (y > pageHeight - margin) {
      pdf.addPage()
      y = margin
    }
    pdf.text(line, margin, y)
    y += lineHeight
  }

  pdf.save(`${doc.title}.pdf`)
}

function downloadAsJpeg(doc: LibraryDoc) {
  const width = 850
  const margin = 48
  const lineHeight = 22
  const fontSize = 15
  const font = `${fontSize}px Georgia, serif`

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.font = font
  const maxWidth = width - margin * 2
  const lines: string[] = []
  for (const raw of (doc.content ?? "").split("\n")) {
    if (raw === "") {
      lines.push("")
      continue
    }
    let current = ""
    for (const word of raw.split(" ")) {
      const test = current ? `${current} ${word}` : word
      if (current && ctx.measureText(test).width > maxWidth) {
        lines.push(current)
        current = word
      } else {
        current = test
      }
    }
    lines.push(current)
  }

  canvas.width = width
  canvas.height = margin * 2 + lines.length * lineHeight
  // canvas dimension changes reset the 2D context, so font/fill must be reapplied
  ctx.font = font
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#1a1a1a"
  ctx.textBaseline = "top"
  lines.forEach((line, i) => ctx.fillText(line, margin, margin + i * lineHeight))

  canvas.toBlob((blob) => {
    if (blob) triggerDownload(blob, `${doc.title}.jpg`)
  }, "image/jpeg", 0.92)
}

function downloadDoc(doc: LibraryDoc, format: DownloadFormat) {
  if (!doc.content) return
  if (format === "txt") downloadAsTxt(doc)
  else if (format === "pdf") downloadAsPdf(doc)
  else downloadAsJpeg(doc)
}

type Phase = "chat" | "compliance" | "transactions"

export function DocumentLibrary({
  incorporationDocs,
  complianceDocs,
  transactionDocs,
  onNavigate,
  onDelete,
  onRestore,
}: {
  incorporationDocs: LibraryDoc[]
  complianceDocs: LibraryDoc[]
  transactionDocs: LibraryDoc[]
  onNavigate: (phase: Phase) => void
  onDelete: (doc: LibraryDoc) => void
  onRestore: (doc: LibraryDoc) => void
}) {
  const visibleCount = (docs: LibraryDoc[]) => docs.filter((d) => !d.hidden).length
  const total = visibleCount(incorporationDocs) + visibleCount(complianceDocs) + visibleCount(transactionDocs)
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
            onDelete={onDelete}
            onRestore={onRestore}
          />
          <DocSection
            icon={ShieldCheck}
            title="Compliance Documents"
            docs={complianceDocs}
            emptyText="Filed compliance items will appear here as you complete them in the Compliance Center."
            ctaLabel="Go to Compliance"
            onCta={() => onNavigate("compliance")}
            onView={setViewing}
            onDelete={onDelete}
            onRestore={onRestore}
          />
          <DocSection
            icon={ArrowLeftRight}
            title="Transaction Documents"
            docs={transactionDocs}
            emptyText="Grants, issuances, and transfers will appear here as you record them in Transactions."
            ctaLabel="Go to Transactions"
            onCta={() => onNavigate("transactions")}
            onView={setViewing}
            onDelete={onDelete}
            onRestore={onRestore}
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
  onDelete,
  onRestore,
}: {
  icon: LucideIcon
  title: string
  docs: LibraryDoc[]
  emptyText: string
  ctaLabel: string
  onCta: () => void
  onView: (doc: LibraryDoc) => void
  onDelete: (doc: LibraryDoc) => void
  onRestore: (doc: LibraryDoc) => void
}) {
  const [showHidden, setShowHidden] = useState(false)
  const visible = docs.filter((d) => !d.hidden)
  const hidden = docs.filter((d) => d.hidden)

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
        <span className="text-xs font-medium text-muted-foreground">{visible.length}</span>
      </div>

      {visible.length === 0 ? (
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
          {visible.map((doc) => (
            <DocCard key={doc.id} doc={doc} onView={onView} onDelete={onDelete} />
          ))}
        </div>
      )}

      {hidden.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowHidden((v) => !v)}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className={`h-3 w-3 transition-transform ${showHidden ? "rotate-180" : ""}`} />
            {hidden.length} deleted document{hidden.length === 1 ? "" : "s"} — {showHidden ? "hide" : "show"}
          </button>
          {showHidden && (
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {hidden.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-2.5 rounded-lg border border-dashed border-border bg-card/40 px-3 py-2.5"
                >
                  <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{doc.title}</span>
                  <button
                    onClick={() => onRestore(doc)}
                    title="Restore"
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function DocCard({
  doc,
  onView,
  onDelete,
}: {
  doc: LibraryDoc
  onView: (doc: LibraryDoc) => void
  onDelete: (doc: LibraryDoc) => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [formatMenuOpen, setFormatMenuOpen] = useState(false)
  const viewable = !!doc.content
  const downloadable = viewable

  return (
    <div
      role={viewable ? "button" : undefined}
      tabIndex={viewable ? 0 : undefined}
      onClick={viewable ? () => onView(doc) : undefined}
      onKeyDown={viewable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onView(doc) } } : undefined}
      className={`group flex items-start gap-3 rounded-xl border p-3.5 text-left shadow-sm ${
        doc.pending ? "border-primary/30 bg-primary/5" : "border-border bg-card"
      } ${viewable ? "cursor-pointer transition-colors hover:border-primary/40" : ""}`}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        <FileText className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[13px] font-medium text-foreground">{doc.title}</p>
          {doc.pending && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary-foreground">
              <Send className="h-2 w-2" />
              Pending
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{doc.subtitle}</p>
        {confirming ? (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[10px] font-medium text-destructive">Delete this document?</span>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(doc) }}
              className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive hover:bg-destructive/20"
            >
              Delete
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirming(false) }}
              className="rounded-md px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-secondary"
            >
              Cancel
            </button>
          </div>
        ) : doc.pending ? (
          <p className="mt-1 text-[10px] font-medium text-primary">Filing with the state — usually same-day to a few business days</p>
        ) : viewable ? (
          <p className="mt-1 text-[10px] font-medium text-primary">View document →</p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1">
        {downloadable && (
          <div className="relative mt-0.5">
            <button
              onClick={(e) => { e.stopPropagation(); setFormatMenuOpen((v) => !v) }}
              title="Download"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            {formatMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => { e.stopPropagation(); setFormatMenuOpen(false) }}
                />
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-7 z-50 w-28 overflow-hidden rounded-lg border border-border bg-popover py-1 text-popover-foreground shadow-md"
                >
                  {DOWNLOAD_FORMATS.map((format) => (
                    <button
                      key={format}
                      onClick={() => { downloadDoc(doc, format); setFormatMenuOpen(false) }}
                      className="block w-full px-3 py-1.5 text-left text-[11px] font-medium uppercase tracking-wide text-foreground hover:bg-secondary"
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        {!confirming && (
          <button
            onClick={(e) => { e.stopPropagation(); setConfirming(true) }}
            title="Delete"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/40 opacity-40 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
      {!doc.pending && !confirming && (
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
    </div>
  )
}

export function DocumentViewer({ doc, onClose }: { doc: LibraryDoc; onClose: () => void }) {
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
          <pre
            className="whitespace-pre-wrap text-sm leading-relaxed text-foreground"
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            {doc.content}
          </pre>
        </div>
      </div>
    </div>
  )
}
