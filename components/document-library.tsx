"use client"

import { Fragment, useState } from "react"
import { Building2, ShieldCheck, ArrowLeftRight, FileText, Check, X, Landmark, Download, Trash2, RotateCcw, ChevronDown, PenLine, Mail, MoreVertical } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { signatureBlockText, resolveSignatureLines, fillCompanyExecutionBlock, fillSignedDateLine, formatSignedDate, primaryOfficerTitle } from "@/lib/signature"
import { getSignerSlots, type SignerSlot } from "@/lib/document-signers"
import type { FlowAnswers } from "@/lib/flow"
import { SignaturePad } from "@/components/signature-pad"

/** One collected signature on a document, placed at whichever slot (see lib/document-signers.ts)
 *  it was signed for. */
export type DocSignature = {
  slotId: string
  slotLabel: string
  signatureDataUrl: string
  signerName: string
  signedAt: string
  /** for the officer slot only — the title used to fill the "THE COMPANY:" block's Name:/Title: lines */
  officerTitle?: string
}

export type LibraryDoc = {
  id: string
  title: string
  subtitle: string
  content?: string
  /** for Transaction Center docs: the raw field values collected to generate this document
   *  instance — lets getSignerSlots resolve a counterparty (e.g. a loan's Lender) that isn't
   *  part of the global FlowAnswers. */
  values?: Record<string, string>
  /** true while an external process (e.g. a state filing) is still resolving in the real world */
  pending?: boolean
  /** true once the filing tracked by `pending` has been manually confirmed complete */
  filed?: boolean
  /** true if the user deleted this from My Docs — kept around (not the underlying doc) so it can be restored */
  hidden?: boolean
  signatures?: DocSignature[]
  /** true once every signer slot the document requires has a signature — set by the caller, which
   *  is where FlowAnswers (and therefore the slot list) is in scope */
  signed?: boolean
}

type SavedSignature = { signatureDataUrl: string; signerName: string; roles?: string[] }
type SignPayload = { signatureDataUrl: string; signerName: string; roles?: string[]; slotId?: string; slotLabel?: string }
type SendToSignPayload = { recipientEmail: string; recipientName?: string; slotId: string; slotLabel: string; lockedName?: string }
/** An outstanding (not-yet-signed) request to sign a given doc, keyed by doc.id. */
export type PendingSignRequest = { id: string; slotLabel: string; recipientEmail: string; recipientName?: string | null }

type ResolvedSignature = { sig: DocSignature; lines: number[] }

/** Every collected signature on a doc, paired with the document line(s) it resolves to (a signer's
 *  mark can land on more than one line, e.g. the company's execution block repeated once per
 *  founder in a combined multi-founder agreement). */
function resolveSignatures(content: string, doc: LibraryDoc, answers: FlowAnswers): ResolvedSignature[] {
  const slots = getSignerSlots(doc.id, answers, doc.values)
  return (doc.signatures ?? []).map((sig) => {
    const slot: SignerSlot = slots.find((s) => s.id === sig.slotId) ?? { id: sig.slotId, label: sig.slotLabel, kind: "officer" }
    const lines = resolveSignatureLines(content, slot, sig.signerName)
    // A slot that never resolves to a line silently falls back to being appended at the end of the
    // document instead of sitting on the signer's actual line — almost always because a new/edited
    // template's signature block doesn't match the pattern its getSignerSlots entry assumes.
    if (lines.length === 0 && process.env.NODE_ENV !== "production") {
      console.warn(
        `[document-library] Signature slot "${slot.id}" (kind: ${slot.kind}) found no matching line in doc "${doc.id}" — it will be appended at the bottom instead of placed on its signature line. Update getSignerSlots/resolveSignatureLines to match this template's actual layout.`,
      )
    }
    return { sig, lines }
  })
}

/** The signer slots this document still needs — what "Send to sign" is allowed to offer. */
function availableSlotsFor(doc: LibraryDoc, answers: FlowAnswers): SignerSlot[] {
  const filled = new Set((doc.signatures ?? []).map((s) => s.slotId))
  return getSignerSlots(doc.id, answers, doc.values).filter((slot) => !filled.has(slot.id))
}

/** The subset of `availableSlotsFor` the account holder is allowed to self-sign. Excludes any
 *  `external` slot (a genuinely separate counterparty, e.g. a Founder Loan's Lender or a Service
 *  Provider) — self-signing only ever represents the company, so an external slot must go through
 *  "Send to sign" instead, otherwise one person could sign as both sides of the same document. */
function selfSignableSlotsFor(doc: LibraryDoc, answers: FlowAnswers): SignerSlot[] {
  return availableSlotsFor(doc, answers).filter((slot) => !slot.external)
}

/** The document text as actually signed — blank Name:/Title: lines in the company execution
 *  block(s) filled in from the officer signer's title, and any blank Date:____ line right after a
 *  signer's own signature line filled with the date they actually signed, so the printed document
 *  matches who signed and when instead of leaving those blanks forever. */
function signedContent(doc: LibraryDoc, answers: FlowAnswers): string {
  let content = doc.content ?? ""
  const slots = getSignerSlots(doc.id, answers, doc.values)
  for (const sig of doc.signatures ?? []) {
    const slot = slots.find((s) => s.id === sig.slotId) ?? { id: sig.slotId, label: sig.slotLabel, kind: "officer" as const }
    if (sig.officerTitle) content = fillCompanyExecutionBlock(content, sig.signerName, [sig.officerTitle], slot.headerPattern)
    for (const lineIndex of resolveSignatureLines(content, slot, sig.signerName)) {
      content = fillSignedDateLine(content, lineIndex, sig.signedAt)
    }
  }
  return content
}

/** Titles and major section names (e.g. "BYLAWS", "CORPORATE OFFICES", "***") are set in all-caps — bold + centered. */
function isAllCapsHeadingLine(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false
  if (trimmed === "***") return true
  if (!/[A-Z]/.test(trimmed) || /[a-z]/.test(trimmed)) return false
  return /^[A-Z0-9][A-Z0-9 .,'&()/-]*$/.test(trimmed)
}

/** A numbered/"Article N" line counts as a heading only if it's a short standalone label, not a
 *  numbered clause whose text runs on past the label (e.g. "2. Definitions. As used herein..."). */
function isStandaloneHeadingText(rest: string): boolean {
  const body = rest.trim()
  if (!body) return false
  const periodIndex = body.indexOf(".")
  return periodIndex === -1 || periodIndex === body.length - 1
}

/** Matches section headers like "Article I", "1. Adoption of Bylaws", or "II.1. Place of Meetings" — bold, left-aligned. */
function isNumberedHeadingLine(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed || trimmed.length > 90) return false
  if (/^Article\s+[IVXLCDM]+$/i.test(trimmed)) return true
  const numbered = trimmed.match(/^\d+\.\s+(.*)$/)
  if (numbered) return isStandaloneHeadingText(numbered[1])
  const romanNumbered = trimmed.match(/^[IVXLCDM]+\.\d+\.\s+(.*)$/i)
  if (romanNumbered) return isStandaloneHeadingText(romanNumbered[1])
  return false
}

/** The document title is its first non-blank line — always bolded and centered as a safety net,
 *  even for a future template whose title doesn't happen to be all-caps. */
function docTitleLineIndex(content: string): number {
  return content.split("\n").findIndex((l) => l.trim().length > 0)
}

function classifyDocLine(line: string, isTitle: boolean): { bold: boolean; center: boolean } {
  if (isTitle) return { bold: true, center: true }
  if (isAllCapsHeadingLine(line)) return { bold: true, center: true }
  if (isNumberedHeadingLine(line)) return { bold: true, center: false }
  return { bold: false, center: false }
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

function fullContent(doc: LibraryDoc, answers: FlowAnswers): string {
  const base = signedContent(doc, answers)
  const resolved = resolveSignatures(base, doc, answers)
  return resolved
    .filter((r) => r.lines.length === 0)
    .reduce((acc, r) => acc + signatureBlockText({ signerName: r.sig.signerName, signedAt: r.sig.signedAt }), base)
}

function downloadAsTxt(doc: LibraryDoc, answers: FlowAnswers) {
  triggerDownload(new Blob([fullContent(doc, answers)], { type: "text/plain" }), `${doc.title}.txt`)
}

async function downloadAsPdf(doc: LibraryDoc, answers: FlowAnswers) {
  const { jsPDF } = await import("jspdf")
  const pdf = new jsPDF({ unit: "pt", format: "letter" })
  const margin = 56
  const lineHeight = 16
  const pageWidth = pdf.internal.pageSize.getWidth()
  const maxWidth = pageWidth - margin * 2
  const pageHeight = pdf.internal.pageSize.getHeight()
  const centerX = pageWidth / 2

  pdf.setFontSize(11)

  let y = margin
  const advance = () => {
    y += lineHeight
    if (y > pageHeight - margin) {
      pdf.addPage()
      y = margin
    }
  }

  const content = signedContent(doc, answers)
  const rawLines = content.split("\n")
  const titleIndex = docTitleLineIndex(content)
  const resolved = resolveSignatures(content, doc, answers)
  const lineToSig = new Map<number, DocSignature>()
  for (const r of resolved) for (const idx of r.lines) lineToSig.set(idx, r.sig)
  const unplaced = resolved.filter((r) => r.lines.length === 0).map((r) => r.sig)
  const inlineImgHeight = 34

  rawLines.forEach((raw, i) => {
    const sig = lineToSig.get(i)
    if (sig) {
      pdf.addImage(sig.signatureDataUrl, "PNG", margin, y - inlineImgHeight + 4, inlineImgHeight * 3, inlineImgHeight)
      advance()
      return
    }

    if (!raw.trim()) {
      advance()
      return
    }

    const { bold, center } = classifyDocLine(raw, i === titleIndex)
    pdf.setFont("times", bold ? "bold" : "normal")

    const wrapped: string[] = pdf.splitTextToSize(raw, maxWidth)
    for (const w of wrapped) {
      if (center) pdf.text(w, centerX, y, { align: "center" })
      else pdf.text(w, margin, y)
      advance()
    }

    const prevSig = lineToSig.get(i - 1)
    if (prevSig) {
      pdf.setFont("times", "italic")
      pdf.setFontSize(9)
      pdf.text(`Electronically signed on ${formatSignedDate(prevSig.signedAt)}`, margin, y)
      pdf.setFontSize(11)
      pdf.setFont("times", "normal")
      advance()
    }
  })

  for (const sig of unplaced) {
    const imgHeight = 50
    const imgWidth = 160
    if (y + imgHeight > pageHeight - margin) {
      pdf.addPage()
      y = margin
    }
    y += 10
    pdf.addImage(sig.signatureDataUrl, "PNG", margin, y, imgWidth, imgHeight)
    y += imgHeight
    pdf.setFont("times", "normal")
    for (const line of signatureBlockText({ signerName: sig.signerName, signedAt: sig.signedAt }).trim().split("\n")) {
      pdf.text(line, margin, y)
      advance()
    }
  }

  pdf.save(`${doc.title}.pdf`)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function downloadAsJpeg(doc: LibraryDoc, answers: FlowAnswers) {
  const width = 850
  const margin = 48
  const lineHeight = 22
  const fontSize = 15
  const font = `${fontSize}px Georgia, serif`
  const sigImageHeight = 75

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.font = font
  const maxWidth = width - margin * 2
  const content = signedContent(doc, answers)
  const lines: string[] = []
  const sourceLineWrappedStart: number[] = []
  for (const raw of content.split("\n")) {
    sourceLineWrappedStart.push(lines.length)
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

  const resolved = resolveSignatures(content, doc, answers)
  const placed = resolved.filter((r) => r.lines.length > 0)
  const unplaced = resolved.filter((r) => r.lines.length === 0).map((r) => r.sig)

  const placedSpots = (
    await Promise.all(
      placed.flatMap((r) =>
        r.lines.map(async (sourceIdx) => ({
          wrappedIdx: sourceLineWrappedStart[sourceIdx],
          captionWrappedIdx:
            sourceIdx + 2 < sourceLineWrappedStart.length ? sourceLineWrappedStart[sourceIdx + 2] - 1 : lines.length - 1,
          sig: r.sig,
          img: await loadImage(r.sig.signatureDataUrl).catch(() => null),
        })),
      ),
    )
  ).filter((s): s is typeof s & { img: HTMLImageElement } => !!s.img)
  const byWrappedIdx = new Map(placedSpots.map((p) => [p.wrappedIdx, p]))
  const captionByWrappedIdx = new Map(placedSpots.map((p) => [p.captionWrappedIdx, p.sig]))

  const unplacedImages = (
    await Promise.all(unplaced.map(async (sig) => ({ sig, img: await loadImage(sig.signatureDataUrl).catch(() => null) })))
  ).filter((u): u is typeof u & { img: HTMLImageElement } => !!u.img)

  const sigBlockHeight = unplacedImages.reduce(
    (h, u) => h + sigImageHeight + signatureBlockText({ signerName: u.sig.signerName, signedAt: u.sig.signedAt }).trim().split("\n").length * lineHeight,
    0,
  )

  canvas.width = width
  canvas.height = margin * 2 + lines.length * lineHeight + sigBlockHeight + captionByWrappedIdx.size * lineHeight
  // canvas dimension changes reset the 2D context, so font/fill must be reapplied
  ctx.font = font
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#1a1a1a"
  ctx.textBaseline = "top"

  let yCursor = margin
  lines.forEach((line, i) => {
    const spot = byWrappedIdx.get(i)
    if (spot) {
      const inlineHeight = 40
      const inlineWidth = spot.img.width * (inlineHeight / spot.img.height)
      ctx.drawImage(spot.img, margin, yCursor - 10, inlineWidth, inlineHeight)
    } else {
      ctx.fillText(line, margin, yCursor)
    }
    yCursor += lineHeight
    const captionSig = captionByWrappedIdx.get(i)
    if (captionSig) {
      ctx.font = `italic ${fontSize - 2}px Georgia, serif`
      ctx.fillStyle = "#666666"
      ctx.fillText(`Electronically signed on ${formatSignedDate(captionSig.signedAt)}`, margin, yCursor)
      ctx.font = font
      ctx.fillStyle = "#1a1a1a"
      yCursor += lineHeight
    }
  })

  for (const { sig, img } of unplacedImages) {
    ctx.drawImage(img, margin, yCursor, img.width * (sigImageHeight / img.height), sigImageHeight)
    yCursor += sigImageHeight
    ctx.font = font
    const sigLines = signatureBlockText({ signerName: sig.signerName, signedAt: sig.signedAt }).trim().split("\n")
    sigLines.forEach((line, i) => ctx.fillText(line, margin, yCursor + i * lineHeight))
    yCursor += sigLines.length * lineHeight
  }

  canvas.toBlob((blob) => {
    if (blob) triggerDownload(blob, `${doc.title}.jpg`)
  }, "image/jpeg", 0.92)
}

function downloadDoc(doc: LibraryDoc, format: DownloadFormat, answers: FlowAnswers) {
  if (!doc.content) return
  if (format === "txt") downloadAsTxt(doc, answers)
  else if (format === "pdf") downloadAsPdf(doc, answers)
  else downloadAsJpeg(doc, answers)
}

type Phase = "chat" | "compliance" | "transactions"

export function DocumentLibrary({
  companyName,
  answers,
  incorporationDocs,
  complianceDocs,
  transactionDocs,
  onNavigate,
  onDelete,
  onRestore,
  onSign,
  onSendToSign,
  onRemoveSignature,
  onCancelSignRequest,
  onSendToDelaware,
  onConfirmFiled,
  savedSignature,
  pendingSignRequests = {},
}: {
  companyName?: string
  answers: FlowAnswers
  incorporationDocs: LibraryDoc[]
  complianceDocs: LibraryDoc[]
  transactionDocs: LibraryDoc[]
  onNavigate: (phase: Phase) => void
  onDelete: (doc: LibraryDoc) => void
  onRestore: (doc: LibraryDoc) => void
  onSign: (doc: LibraryDoc, signature: SignPayload) => void
  onSendToSign?: (doc: LibraryDoc, payload: SendToSignPayload) => void
  onRemoveSignature?: (doc: LibraryDoc, slotId: string) => void
  /** Withdraws an outstanding "sent to sign" request that's no longer wanted. */
  onCancelSignRequest?: (requestId: string) => void
  /** Marks a signed COI as sent — the actual submission isn't automated yet, this just flips it to "pending" in the library. */
  onSendToDelaware?: (doc: LibraryDoc) => void
  /** Manually confirms Delaware has accepted a pending filing. */
  onConfirmFiled?: (doc: LibraryDoc) => void
  savedSignature: SavedSignature | null
  pendingSignRequests?: Record<string, PendingSignRequest[]>
}) {
  const visibleCount = (docs: LibraryDoc[]) => docs.filter((d) => !d.hidden).length
  const total = visibleCount(incorporationDocs) + visibleCount(complianceDocs) + visibleCount(transactionDocs)
  const [viewing, setViewing] = useState<LibraryDoc | null>(null)

  const handleSign = (doc: LibraryDoc, signature: SignPayload) => {
    onSign(doc, signature)
    setViewing((v) => {
      if (!v || v.id !== doc.id) return v
      const slotId = signature.slotId ?? "officer"
      const slot = getSignerSlots(doc.id, answers, doc.values).find((s) => s.id === slotId)
      const newSig: DocSignature = {
        slotId,
        slotLabel: signature.slotLabel ?? slot?.label ?? "Company officer",
        signatureDataUrl: signature.signatureDataUrl,
        signerName: signature.signerName,
        signedAt: new Date().toISOString(),
        officerTitle: slot?.kind === "officer" ? primaryOfficerTitle(signature.roles ?? []) ?? undefined : undefined,
      }
      const signatures = [...(v.signatures ?? []).filter((s) => s.slotId !== slotId), newSig]
      const totalSlots = v.content ? getSignerSlots(doc.id, answers, doc.values).length : 0
      return { ...v, signatures, signed: totalSlots > 0 && signatures.length >= totalSlots }
    })
  }

  const handleRemoveSignature = (doc: LibraryDoc, slotId: string) => {
    onRemoveSignature?.(doc, slotId)
    setViewing((v) =>
      v && v.id === doc.id
        ? { ...v, signatures: (v.signatures ?? []).filter((s) => s.slotId !== slotId), signed: false }
        : v,
    )
  }

  const handleSendToDelaware = (doc: LibraryDoc) => {
    onSendToDelaware?.(doc)
    setViewing((v) => (v && v.id === doc.id ? { ...v, pending: true } : v))
  }

  const handleConfirmFiled = (doc: LibraryDoc) => {
    onConfirmFiled?.(doc)
    setViewing((v) => (v && v.id === doc.id ? { ...v, pending: false, filed: true } : v))
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {companyName ? `${companyName}'s Document Vault` : "Document Vault"}
          </h1>
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
            answers={answers}
            emptyText="Formation documents will appear here as you complete the Incorporation flow."
            ctaLabel="Go to Incorporation"
            onCta={() => onNavigate("chat")}
            onView={setViewing}
            onDelete={onDelete}
            onRestore={onRestore}
            onSign={handleSign}
            onSendToSign={onSendToSign}
            savedSignature={savedSignature}
            pendingSignRequests={pendingSignRequests}
          />
          <DocSection
            icon={ShieldCheck}
            title="Compliance Documents"
            docs={complianceDocs}
            answers={answers}
            emptyText="Filed compliance items will appear here as you complete them in the Compliance Center."
            ctaLabel="Go to Compliance"
            onCta={() => onNavigate("compliance")}
            onView={setViewing}
            onDelete={onDelete}
            onRestore={onRestore}
            onSign={handleSign}
            onSendToSign={onSendToSign}
            savedSignature={savedSignature}
            pendingSignRequests={pendingSignRequests}
          />
          <DocSection
            icon={ArrowLeftRight}
            title="Transaction Documents"
            docs={transactionDocs}
            answers={answers}
            emptyText="Grants, issuances, and transfers will appear here as you record them in Transactions."
            ctaLabel="Go to Transactions"
            onCta={() => onNavigate("transactions")}
            onView={setViewing}
            onDelete={onDelete}
            onRestore={onRestore}
            onSign={handleSign}
            onSendToSign={onSendToSign}
            savedSignature={savedSignature}
            pendingSignRequests={pendingSignRequests}
          />
        </div>
      </div>

      {viewing && (
        <DocumentViewer
          doc={viewing}
          answers={answers}
          onClose={() => setViewing(null)}
          onSign={handleSign}
          onSendToSign={onSendToSign}
          onDelete={(doc) => { onDelete(doc); setViewing(null) }}
          onRemoveSignature={onRemoveSignature ? handleRemoveSignature : undefined}
          onCancelSignRequest={onCancelSignRequest}
          onSendToDelaware={onSendToDelaware ? handleSendToDelaware : undefined}
          onConfirmFiled={onConfirmFiled ? handleConfirmFiled : undefined}
          savedSignature={savedSignature}
          pendingSignRequests={pendingSignRequests[viewing.id]}
        />
      )}
    </div>
  )
}

function DocSection({
  icon: Icon,
  title,
  docs,
  answers,
  emptyText,
  ctaLabel,
  onCta,
  onView,
  onDelete,
  onRestore,
  onSign,
  onSendToSign,
  savedSignature,
  pendingSignRequests,
}: {
  icon: LucideIcon
  title: string
  docs: LibraryDoc[]
  answers: FlowAnswers
  emptyText: string
  ctaLabel: string
  onCta: () => void
  onView: (doc: LibraryDoc) => void
  onDelete: (doc: LibraryDoc) => void
  onRestore: (doc: LibraryDoc) => void
  onSign: (doc: LibraryDoc, signature: SignPayload) => void
  onSendToSign?: (doc: LibraryDoc, payload: SendToSignPayload) => void
  savedSignature: SavedSignature | null
  pendingSignRequests: Record<string, PendingSignRequest[]>
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
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {visible.map((doc) => (
            <DocTile
              key={doc.id}
              doc={doc}
              answers={answers}
              onView={onView}
              onDelete={onDelete}
              onSign={onSign}
              onSendToSign={onSendToSign}
              savedSignature={savedSignature}
              pendingSignRequests={pendingSignRequests[doc.id]}
            />
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

/** The "sign this yourself" form — a slot picker (only shown when the document still needs more
 *  than one signature, e.g. a loan's Company officer vs. Lender) plus a saved-signature confirm
 *  if the account has one, else the capture pad. Shared by the full sign button and the tile's
 *  kebab menu. */
function SignPopoverContent({
  doc,
  answers,
  onSign,
  savedSignature,
  onDone,
}: {
  doc: LibraryDoc
  answers: FlowAnswers
  onSign: (doc: LibraryDoc, signature: SignPayload) => void
  savedSignature: SavedSignature | null
  onDone: () => void
}) {
  const slots = selfSignableSlotsFor(doc, answers)
  const [slotId, setSlotId] = useState<string | null>(null)
  if (slots.length === 0) return null
  const selectedSlot = slots.find((s) => s.id === slotId) ?? slots[0]

  const slotPicker = slots.length > 1 && (
    <select
      value={selectedSlot.id}
      onChange={(e) => setSlotId(e.target.value)}
      className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary"
    >
      {slots.map((slot) => (
        <option key={slot.id} value={slot.id}>
          {slot.label}
        </option>
      ))}
    </select>
  )

  if (savedSignature) {
    return (
      <div className="space-y-2.5 p-3">
        <p className="text-xs font-medium text-foreground">Sign with your saved signature?</p>
        {slotPicker}
        <div className="flex items-center rounded-md border border-border bg-white px-2 py-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={savedSignature.signatureDataUrl} alt="Your signature" className="h-8 object-contain object-left" />
        </div>
        <button
          onClick={() => { onSign(doc, { ...savedSignature, slotId: selectedSlot.id, slotLabel: selectedSlot.label }); onDone() }}
          className="w-full rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Sign document{slots.length > 1 ? ` as ${selectedSlot.label}` : ""}
        </button>
      </div>
    )
  }
  return (
    <div className="space-y-2.5 p-3">
      {slotPicker}
      <SignaturePad
        defaultName=""
        onCapture={(dataUrl, _method, name) => {
          onSign(doc, { signatureDataUrl: dataUrl, signerName: name, slotId: selectedSlot.id, slotLabel: selectedSlot.label })
          onDone()
        }}
      />
    </div>
  )
}

function SignButton({
  doc,
  answers,
  onSign,
  savedSignature,
  variant = "icon",
}: {
  doc: LibraryDoc
  answers: FlowAnswers
  onSign: (doc: LibraryDoc, signature: SignPayload) => void
  savedSignature: SavedSignature | null
  variant?: "icon" | "full"
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Sign"
        className={
          variant === "icon"
            ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            : "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        }
      >
        <PenLine className="h-3.5 w-3.5" />
        {variant === "full" && "Sign"}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-72 rounded-lg border border-border bg-popover text-popover-foreground shadow-md">
            <SignPopoverContent doc={doc} answers={answers} onSign={onSign} savedSignature={savedSignature} onDone={() => setOpen(false)} />
          </div>
        </>
      )}
    </div>
  )
}

/** The "invite someone else to sign" form — a slot picker (only the roles this document still
 *  needs) plus recipient email/name. Shared by the full send-to-sign button and the tile's kebab menu. */
function SendToSignPopoverContent({
  doc,
  answers,
  onSendToSign,
  onDone,
}: {
  doc: LibraryDoc
  answers: FlowAnswers
  onSendToSign: (doc: LibraryDoc, payload: SendToSignPayload) => void
  onDone: () => void
}) {
  const slots = availableSlotsFor(doc, answers)
  const [slotId, setSlotId] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")

  if (slots.length === 0) return null
  const selectedSlot = slots.find((s) => s.id === slotId) ?? slots[0]

  const send = () => {
    if (!email.trim()) return
    onSendToSign(doc, {
      recipientEmail: email.trim(),
      recipientName: name.trim() || undefined,
      slotId: selectedSlot.id,
      slotLabel: selectedSlot.label,
      lockedName: selectedSlot.kind === "named" ? selectedSlot.matchName : undefined,
    })
    onDone()
  }

  return (
    <div className="space-y-2.5 p-3">
      <p className="text-xs font-medium text-foreground">Send for e-signature</p>
      {slots.length > 1 ? (
        <select
          value={selectedSlot.id}
          onChange={(e) => setSlotId(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary"
        >
          {slots.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {slot.label}
            </option>
          ))}
        </select>
      ) : (
        <p className="text-xs text-muted-foreground">Signing as: {selectedSlot.label}</p>
      )}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="recipient@email.com"
        className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary"
      />
      {selectedSlot.kind === "named" ? (
        <p className="text-xs text-muted-foreground">Name is fixed by the document: {selectedSlot.matchName}</p>
      ) : (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Their name (optional)"
          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary"
        />
      )}
      <button
        onClick={send}
        disabled={!email.trim()}
        className="w-full rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        Send signing link
      </button>
    </div>
  )
}

function SendToSignButton({
  doc,
  answers,
  onSendToSign,
  variant = "icon",
}: {
  doc: LibraryDoc
  answers: FlowAnswers
  onSendToSign: (doc: LibraryDoc, payload: SendToSignPayload) => void
  variant?: "icon" | "full"
}) {
  const slots = availableSlotsFor(doc, answers)
  const [open, setOpen] = useState(false)

  if (slots.length === 0) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Send to sign"
        className={
          variant === "icon"
            ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            : "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        }
      >
        <Mail className="h-3.5 w-3.5" />
        {variant === "full" && "Send to sign"}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-72 rounded-lg border border-border bg-popover text-popover-foreground shadow-md">
            <SendToSignPopoverContent doc={doc} answers={answers} onSendToSign={onSendToSign} onDone={() => setOpen(false)} />
          </div>
        </>
      )}
    </div>
  )
}

/** A small, real (not simulated) preview of the document's own text, clipped to the tile. */
function MiniPreview({ doc, answers }: { doc: LibraryDoc; answers: FlowAnswers }) {
  if (!doc.content) {
    return (
      <div className="flex h-full items-center justify-center">
        <FileText className="h-7 w-7 text-muted-foreground/30" />
      </div>
    )
  }
  const content = signedContent(doc, answers)
  const lines = content.split("\n").slice(0, 32)
  const titleIndex = docTitleLineIndex(content)
  return (
    <div className="relative h-full overflow-hidden">
      <div
        className="px-2.5 pt-2.5 text-[4.5px] leading-[6px] text-foreground/70"
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
      >
        {lines.map((line, i) => {
          const { bold, center } = classifyDocLine(line, i === titleIndex)
          return (
            <p key={i} className={cn("m-0 whitespace-pre-wrap", bold && "font-bold", center && "text-center")}>
              {line || " "}
            </p>
          )
        })}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card to-transparent" />
    </div>
  )
}

/** The "⋮" quick-actions menu on a tile — the same Sign / Send to sign / Download / Delete
 *  actions available in the full document viewer, without needing to open it. */
function DocTileMenu({
  doc,
  answers,
  onDelete,
  onSign,
  onSendToSign,
  savedSignature,
}: {
  doc: LibraryDoc
  answers: FlowAnswers
  onDelete: (doc: LibraryDoc) => void
  onSign: (doc: LibraryDoc, signature: SignPayload) => void
  onSendToSign?: (doc: LibraryDoc, payload: SendToSignPayload) => void
  savedSignature: SavedSignature | null
}) {
  type Mode = "menu" | "sign" | "send" | "delete-confirm"
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("menu")
  const viewable = !!doc.content
  const canSign = viewable && selfSignableSlotsFor(doc, answers).length > 0
  const canSendToSign = viewable && !!onSendToSign && availableSlotsFor(doc, answers).length > 0

  const close = () => { setOpen(false); setMode("menu") }

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="More actions"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} />
          <div className="absolute right-0 top-7 z-50 w-64 rounded-lg border border-border bg-popover text-popover-foreground shadow-md">
            {mode === "menu" && (
              <div className="py-1">
                {canSign && (
                  <button
                    onClick={() => setMode("sign")}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-secondary"
                  >
                    <PenLine className="h-3.5 w-3.5" /> Sign
                  </button>
                )}
                {canSendToSign && (
                  <button
                    onClick={() => setMode("send")}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-secondary"
                  >
                    <Mail className="h-3.5 w-3.5" /> Send to sign
                  </button>
                )}
                {viewable && DOWNLOAD_FORMATS.map((format) => (
                  <button
                    key={format}
                    onClick={() => { downloadDoc(doc, format, answers); close() }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-foreground hover:bg-secondary"
                  >
                    <Download className="h-3.5 w-3.5" /> {format}
                  </button>
                ))}
                <button
                  onClick={() => setMode("delete-confirm")}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            )}
            {mode === "sign" && <SignPopoverContent doc={doc} answers={answers} onSign={onSign} savedSignature={savedSignature} onDone={close} />}
            {mode === "send" && onSendToSign && (
              <SendToSignPopoverContent doc={doc} answers={answers} onSendToSign={onSendToSign} onDone={close} />
            )}
            {mode === "delete-confirm" && (
              <div className="space-y-2.5 p-3">
                <p className="text-xs font-medium text-foreground">Delete this document?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { onDelete(doc); close() }}
                    className="flex-1 rounded-md bg-destructive/10 px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setMode("menu")}
                    className="flex-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/** The COI sits in a "ready to file" state once signed, before it's been sent — the one point
 *  where the Document Library itself expects a further user action rather than just displaying
 *  a completed record. */
function readyToSendToDelaware(doc: LibraryDoc): boolean {
  return doc.id === "coi" && !!doc.signed && !doc.pending && !doc.filed
}

function docStatusText(doc: LibraryDoc, answers: FlowAnswers, pendingSignRequests?: PendingSignRequest[]): string | null {
  if (doc.filed) return "Filed with Delaware"
  if (doc.pending) return "Awaiting Delaware approval"
  if (readyToSendToDelaware(doc)) return "Ready to send to Delaware"
  if (doc.signed) return "Signed"
  const signatures = doc.signatures ?? []
  const totalSlots = doc.content ? getSignerSlots(doc.id, answers, doc.values).length : 0
  if (signatures.length > 0 && totalSlots > 0) return `${signatures.length} of ${totalSlots} signed`
  if (pendingSignRequests?.length) return "Awaiting signature"
  return null
}

function DocTile({
  doc,
  answers,
  onView,
  onDelete,
  onSign,
  onSendToSign,
  savedSignature,
  pendingSignRequests,
}: {
  doc: LibraryDoc
  answers: FlowAnswers
  onView: (doc: LibraryDoc) => void
  onDelete: (doc: LibraryDoc) => void
  onSign: (doc: LibraryDoc, signature: SignPayload) => void
  onSendToSign?: (doc: LibraryDoc, payload: SendToSignPayload) => void
  savedSignature: SavedSignature | null
  pendingSignRequests?: PendingSignRequest[]
}) {
  const viewable = !!doc.content
  const status = docStatusText(doc, answers, pendingSignRequests)
  const readyToSend = readyToSendToDelaware(doc)

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => viewable && onView(doc)}
        disabled={!viewable}
        className={cn(
          "relative aspect-[3/4] w-full overflow-hidden rounded-md border bg-card text-left shadow-sm transition-shadow",
          doc.pending ? "border-primary/30 bg-primary/5" : readyToSend ? "border-primary/40 bg-primary/5" : "border-border",
          viewable ? "cursor-pointer hover:shadow-md hover:border-primary/40" : "cursor-default",
        )}
      >
        <MiniPreview doc={doc} answers={answers} />
        {readyToSend ? (
          <span className="absolute right-1.5 top-1.5 flex h-6 w-6 animate-pulse items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Landmark className="h-3 w-3" />
          </span>
        ) : (
          doc.signed && (
            <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground shadow-sm">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
          )
        )}
        {doc.pending && (
          <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Landmark className="h-2.5 w-2.5" />
          </span>
        )}
        {readyToSend && (
          <span className="absolute inset-x-0 bottom-0 bg-primary py-1 text-center text-[10px] font-semibold text-primary-foreground">
            Submit to Delaware
          </span>
        )}
      </button>
      <div className="mt-2 flex items-start justify-between gap-1 px-0.5">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-foreground">{doc.title}</p>
          <p className={cn("truncate text-[11px]", readyToSend ? "font-semibold text-primary" : "text-muted-foreground")}>
            {status ?? doc.subtitle}
          </p>
        </div>
        <DocTileMenu doc={doc} answers={answers} onDelete={onDelete} onSign={onSign} onSendToSign={onSendToSign} savedSignature={savedSignature} />
      </div>
    </div>
  )
}

function DocumentBody({ doc, answers }: { doc: LibraryDoc; answers: FlowAnswers }) {
  const content = signedContent(doc, answers)
  const lines = content.split("\n")
  const titleIndex = docTitleLineIndex(content)
  const resolved = resolveSignatures(content, doc, answers)
  const lineToSig = new Map<number, DocSignature>()
  for (const r of resolved) for (const idx of r.lines) lineToSig.set(idx, r.sig)
  const unplaced = resolved.filter((r) => r.lines.length === 0).map((r) => r.sig)

  return (
    <div className="text-sm leading-relaxed text-foreground" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      {lines.map((line, i) => {
        const sig = lineToSig.get(i)
        if (sig) {
          return (
            <div key={i} className="my-0.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sig.signatureDataUrl} alt="Signature" className="h-12 object-contain object-left" />
            </div>
          )
        }
        const { bold, center } = classifyDocLine(line, i === titleIndex)
        const prevSig = lineToSig.get(i - 1)
        return (
          <Fragment key={i}>
            <p className={cn("m-0 whitespace-pre-wrap", bold && "font-bold", center && "text-center")}>
              {line || " "}
            </p>
            {prevSig && (
              <p className="m-0 mt-1 text-xs text-muted-foreground">
                Electronically signed on {formatSignedDate(prevSig.signedAt)}
              </p>
            )}
          </Fragment>
        )
      })}
      {unplaced.map((sig) => (
        <div key={sig.slotId} className="mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sig.signatureDataUrl} alt="Signature" className="h-14 object-contain object-left" />
          <p className="m-0 whitespace-pre-wrap">{signatureBlockText({ signerName: sig.signerName, signedAt: sig.signedAt }).trim()}</p>
        </div>
      ))}
    </div>
  )
}

function DownloadMenuButton({ doc, answers }: { doc: LibraryDoc; answers: FlowAnswers }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Download"
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Download className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-28 overflow-hidden rounded-lg border border-border bg-popover py-1 text-popover-foreground shadow-md">
            {DOWNLOAD_FORMATS.map((format) => (
              <button
                key={format}
                onClick={() => { downloadDoc(doc, format, answers); setOpen(false) }}
                className="block w-full px-3 py-1.5 text-left text-[11px] font-medium uppercase tracking-wide text-foreground hover:bg-secondary"
              >
                {format}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** Manual stand-in for a real Delaware filing integration: marks the signed COI as sent, which
 *  flips it to the same "pending" state a real filing would sit in while Delaware processes it. */
function SendToDelawareButton({ doc, onSendToDelaware }: { doc: LibraryDoc; onSendToDelaware: (doc: LibraryDoc) => void }) {
  const [confirming, setConfirming] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
      >
        <Landmark className="h-3.5 w-3.5" />
        Send to Delaware
      </button>
      {confirming && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setConfirming(false)} />
          <div className="absolute right-0 top-9 z-50 w-72 space-y-2.5 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md">
            <p className="text-xs font-medium text-foreground">Send to Delaware?</p>
            <p className="text-[11px] leading-snug text-muted-foreground">
              Vispo doesn't submit filings automatically yet — this just marks the Certificate of
              Incorporation as sent so its status is tracked here. Make sure it's actually been
              filed with Delaware (directly, or through your registered agent) first. Once it is,
              come back and confirm here when Delaware accepts it.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { onSendToDelaware(doc); setConfirming(false) }}
                className="flex-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                Send to Delaware
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/** Manual attestation that Delaware has accepted the filing — there's no live status check yet,
 *  so the user confirms it themselves once they hear back. */
function ConfirmFiledButton({ doc, onConfirmFiled }: { doc: LibraryDoc; onConfirmFiled: (doc: LibraryDoc) => void }) {
  return (
    <button
      onClick={() => onConfirmFiled(doc)}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
    >
      <Check className="h-3.5 w-3.5" />
      Confirm filed
    </button>
  )
}

function DeleteButton({ doc, onDelete }: { doc: LibraryDoc; onDelete: (doc: LibraryDoc) => void }) {
  const [confirming, setConfirming] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setConfirming((v) => !v)}
        title="Delete"
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {confirming && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setConfirming(false)} />
          <div className="absolute right-0 top-8 z-50 w-56 space-y-2.5 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md">
            <p className="text-xs font-medium text-foreground">Delete this document?</p>
            <div className="flex gap-2">
              <button
                onClick={() => onDelete(doc)}
                className="flex-1 rounded-md bg-destructive/10 px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function DocumentViewer({
  doc,
  answers,
  onClose,
  onSign,
  onSendToSign,
  onDelete,
  onRemoveSignature,
  onCancelSignRequest,
  onSendToDelaware,
  onConfirmFiled,
  savedSignature = null,
  pendingSignRequests,
  onGoToLibrary,
  onDeleteRestart,
}: {
  doc: LibraryDoc
  answers: FlowAnswers
  onClose: () => void
  onSign?: (doc: LibraryDoc, signature: SignPayload) => void
  onSendToSign?: (doc: LibraryDoc, payload: SendToSignPayload) => void
  /** Present only when opened from the Document Library itself — soft-deletes (hides,
   *  restorable) the doc, distinct from onDeleteRestart's "wipe answers and start over". */
  onDelete?: (doc: LibraryDoc) => void
  /** Removes one collected signature so that slot can be signed again — a "redo". */
  onRemoveSignature?: (doc: LibraryDoc, slotId: string) => void
  /** Withdraws an outstanding "sent to sign" request that's no longer wanted. */
  onCancelSignRequest?: (requestId: string) => void
  /** Marks a signed COI as sent to Delaware (manual — no real filing integration yet). */
  onSendToDelaware?: (doc: LibraryDoc) => void
  /** Manually confirms Delaware has accepted a pending filing. */
  onConfirmFiled?: (doc: LibraryDoc) => void
  savedSignature?: SavedSignature | null
  pendingSignRequests?: PendingSignRequest[]
  /** Present only when opened from a flow's sidebar (not from the Document Library itself) — jumps to the library. */
  onGoToLibrary?: () => void
  /** Present only when opened from a flow's sidebar — deletes the saved answers and restarts the questions. */
  onDeleteRestart?: () => void
}) {
  const canSign = doc.content ? selfSignableSlotsFor(doc, answers).length > 0 : false
  const canSendToDelaware = readyToSendToDelaware(doc) && !!onSendToDelaware
  const canConfirmFiled = doc.id === "coi" && doc.pending && !!onConfirmFiled

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-card shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="pr-4">
            <h3 className="text-base font-semibold text-foreground text-balance">{doc.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{doc.subtitle}</p>
            {!doc.signed && pendingSignRequests?.map((req) => (
              <p key={req.id} className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                {req.slotLabel}: sent to {req.recipientName || req.recipientEmail} — awaiting signature
                {onCancelSignRequest && (
                  <button
                    onClick={() => onCancelSignRequest(req.id)}
                    className="underline-offset-2 text-muted-foreground/70 hover:text-destructive hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </p>
            ))}
            {canSendToDelaware && (
              <p className="mt-1 text-[11px] font-semibold text-primary">
                Signed — ready to send to Delaware. Use the button above when you're ready.
              </p>
            )}
            {doc.pending && (
              <p className="mt-1 text-[11px] font-medium text-primary">
                Awaiting Delaware approval — confirm below once they accept the filing.
              </p>
            )}
            {doc.filed && <p className="mt-1 text-[11px] font-medium text-success">Filed with Delaware.</p>}
            {(onGoToLibrary || onDeleteRestart) && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {onGoToLibrary && (
                  <button
                    onClick={onGoToLibrary}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    View in Document Library
                  </button>
                )}
                {onDeleteRestart && (
                  <button
                    onClick={onDeleteRestart}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:border-destructive hover:bg-destructive/10"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Delete &amp; restart
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {doc.content && canSign && onSign && (
              <SignButton doc={doc} answers={answers} onSign={onSign} savedSignature={savedSignature} variant="full" />
            )}
            {doc.content && onSendToSign && (
              <SendToSignButton doc={doc} answers={answers} onSendToSign={onSendToSign} variant="full" />
            )}
            {canSendToDelaware && <SendToDelawareButton doc={doc} onSendToDelaware={onSendToDelaware!} />}
            {canConfirmFiled && <ConfirmFiledButton doc={doc} onConfirmFiled={onConfirmFiled!} />}
            {doc.content && <DownloadMenuButton doc={doc} answers={answers} />}
            {onDelete && <DeleteButton doc={doc} onDelete={onDelete} />}
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        {doc.signatures && doc.signatures.length > 0 && (
          <div className="border-b border-border bg-secondary/20 px-5 py-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Signatures</p>
            <div className="space-y-1.5">
              {doc.signatures.map((sig) => (
                <div key={sig.slotId} className="flex items-center justify-between gap-2 rounded-md bg-card px-2.5 py-1.5 shadow-sm">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-foreground">{sig.slotLabel}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {sig.signerName} · {formatSignedDate(sig.signedAt)}
                    </p>
                  </div>
                  {onRemoveSignature && (
                    <button
                      onClick={() => onRemoveSignature(doc, sig.slotId)}
                      title="Remove signature (redo)"
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {doc.content ? (
            <DocumentBody doc={doc} answers={answers} />
          ) : (
            <p className="text-sm text-muted-foreground">No document preview is available for this item yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
