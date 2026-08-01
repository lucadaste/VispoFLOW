"use client"

import { useId } from "react"
import { Check, FileCheck2, Send, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

/** Live "thinking" mark for TypingIndicator — the flask tilts side to side while the liquid
 *  (clipped to the glass) sloshes with a larger, slightly delayed swing so it reads as the
 *  liquid catching up to whichever side the glass just tilted toward. */
function AnimatedBeaker() {
  const clipId = useId()
  // A single closed loop (rim, both walls, both flares, rounded bottom) — one continuous shape
  // so there's no separate rim/wall piece to visibly drift apart once the group rotates. Reused
  // verbatim as the liquid's clip so the liquid can never be drawn outside the glass it's tracing.
  const outline = "M14,6 L22,6 L22,13 C26,16 32,20 32,27 C32,32 26,34 18,34 C10,34 4,32 4,27 C4,20 10,16 14,13 Z"
  // Deliberately oversized (runs off all four sides) so at no point in the slosh rotation does
  // its own edge come into view — only the glass clip above ever bounds what's visible.
  const liquid = "M-10,25 C0,21 10,29 18,25 C26,21 36,29 46,25 L46,50 L-10,50 Z"
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0 text-[#6858ff] opacity-[0.62]" fill="none">
      <g className="beaker-tilt-group">
        <circle className="beaker-bubble" cx="15.5" cy="1.6" r="1.2" fill="currentColor" style={{ animationDelay: "0s" }} />
        <circle className="beaker-bubble" cx="19.5" cy="0.6" r="0.8" fill="currentColor" style={{ animationDelay: "0.5s" }} />
        <clipPath id={clipId}>
          <path d={outline} />
        </clipPath>
        <g clipPath={`url(#${clipId})`}>
          <g className="beaker-liquid-group">
            <path d={liquid} fill="currentColor" />
            <circle cx="16" cy="18" r="0.9" fill="currentColor" />
            <circle cx="20.5" cy="21.5" r="1.4" fill="currentColor" />
          </g>
        </g>
        <path d={outline} stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
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
