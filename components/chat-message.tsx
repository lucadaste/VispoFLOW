"use client"

import { useId } from "react"
import { Check, FileCheck2, Send, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

/** Live "thinking" mark for TypingIndicator — the flask tilts side to side while the liquid
 *  (clipped to the glass) sloshes with a larger, slightly delayed swing so it reads as the
 *  liquid catching up to whichever side the glass just tilted toward. */
function AnimatedBeaker() {
  const clipId = useId()
  const outline = "M14,5.4 L14,13 C14,13 6,20 5,27 C4,32 8,33.5 18,33.5 C28,33.5 32,32 31,27 C30,20 22,13 22,13 L22,5.4"
  const liquid = "M6,26.5 C10,23.5 14,28 18,25 C22,22 26,27 30,25 L31,27 C32,32 28,33.5 18,33.5 C8,33.5 4,32 5,27 Z"
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0 text-[#6858ff] opacity-[0.62]" fill="none">
      <g className="beaker-tilt-group">
        <circle className="beaker-bubble" cx="15.5" cy="1.6" r="1.2" fill="currentColor" style={{ animationDelay: "0s" }} />
        <circle className="beaker-bubble" cx="19.5" cy="0.6" r="0.8" fill="currentColor" style={{ animationDelay: "0.5s" }} />
        <rect x="13" y="4.4" width="10" height="2" rx="1" fill="currentColor" />
        <path d={outline} stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <clipPath id={clipId}>
          <path d={outline + " L22,13 L18,13 L14,13 Z"} />
        </clipPath>
        <g clipPath={`url(#${clipId})`}>
          <g className="beaker-liquid-group">
            <path d={liquid} fill="currentColor" />
            <circle cx="16" cy="18" r="0.9" fill="currentColor" />
            <circle cx="20.5" cy="21.5" r="1.4" fill="currentColor" />
          </g>
        </g>
      </g>
    </svg>
  )
}

export function BotMessage({
  children,
  showIcon = true,
}: {
  children: React.ReactNode
  showIcon?: boolean
}) {
  return (
    <div className="flex animate-message-in items-start gap-3">
      {showIcon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/brand/beaker.png" alt="" className="mt-0.5 h-9 w-9 shrink-0 object-contain" />
      ) : (
        <div className="h-9 w-9 shrink-0" />
      )}
      <div className="max-w-[92%] px-1 py-1 text-sm leading-relaxed text-foreground">
        {children}
      </div>
    </div>
  )
}

export function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex animate-message-in items-start justify-end gap-3">
      <div className="max-w-[88%] whitespace-pre-line rounded-2xl rounded-tr-sm bg-secondary px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm ring-1 ring-border">
        {children}
      </div>
    </div>
  )
}

export function SystemNote({
  children,
  variant = "doc",
  onClick,
}: {
  children: React.ReactNode
  variant?: "doc" | "filing"
  onClick?: () => void
}) {
  const pillClass = cn(
    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1",
    variant === "doc"
      ? "bg-success/10 text-success ring-success/20"
      : "bg-primary/10 text-primary ring-primary/20",
    onClick && (variant === "doc" ? "cursor-pointer transition-colors hover:bg-success/20" : "cursor-pointer transition-colors hover:bg-primary/20"),
  )
  const icon =
    variant === "doc" ? <FileCheck2 className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />

  return (
    <div className="flex animate-message-in justify-center px-2">
      {onClick ? (
        <button onClick={onClick} className={pillClass}>
          {icon}
          <span className="text-foreground/80">{children}</span>
        </button>
      ) : (
        <div className={pillClass}>
          {icon}
          <span className="text-foreground/80">{children}</span>
        </div>
      )}
    </div>
  )
}

/** The single "a document was drafted" confirmation — used once an item is completed, replacing
 * both the old small pill and the old plain checkmark card that used to show up together.
 * `onClick` being omitted always means the underlying doc no longer exists in the Document
 * Library (deleted via the redo/restart flow) — every caller conditions it on the doc's presence
 * — so that state doubles as the "deleted" indicator rather than needing a separate prop. */
export function DraftedCard({
  groupTitle,
  title,
  onClick,
}: {
  groupTitle: string
  title: string
  onClick?: () => void
}) {
  const Tag = onClick ? "button" : "div"
  const deleted = !onClick
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "flex w-full animate-message-in items-center gap-3 rounded-xl border px-4 py-3 text-left shadow-sm",
        deleted ? "border-destructive/30 bg-destructive/5" : "border-success/30 bg-success/5 cursor-pointer transition-colors hover:bg-success/10",
      )}
    >
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
          deleted ? "bg-destructive text-destructive-foreground" : "bg-success text-success-foreground",
        )}
      >
        {deleted ? <Trash2 className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <div className="min-w-0">
        <p className={cn("text-xs font-semibold uppercase tracking-wider", deleted ? "text-destructive/80" : "text-success/80")}>{groupTitle}</p>
        <p className={cn("text-sm font-medium", deleted ? "text-destructive" : "text-foreground")}>{title} — {deleted ? "Document deleted" : "Drafted"}</p>
      </div>
    </Tag>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex animate-message-in items-center gap-3">
      <AnimatedBeaker />
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <span className="animate-pulse text-sm text-muted-foreground">Thinking…</span>
      </div>
    </div>
  )
}
