"use client"

import { FileCheck2, Send } from "lucide-react"
import { cn } from "@/lib/utils"

export function BotMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex animate-message-in items-start gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/beaker.png" alt="" className="mt-0.5 h-8 w-8 shrink-0 object-contain" />
      <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm leading-relaxed text-card-foreground shadow-sm ring-1 ring-border">
        {children}
      </div>
    </div>
  )
}

export function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex animate-message-in items-start justify-end gap-3">
      <div className="max-w-[88%] whitespace-pre-line rounded-2xl rounded-tr-sm bg-gradient-to-br from-indigo-900 to-slate-900 px-4 py-3 text-sm leading-relaxed text-white shadow-sm">
        {children}
      </div>
    </div>
  )
}

export function SystemNote({
  children,
  variant = "doc",
}: {
  children: React.ReactNode
  variant?: "doc" | "filing"
}) {
  return (
    <div className="flex animate-message-in justify-center px-2">
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1",
          variant === "doc"
            ? "bg-success/10 text-success ring-success/20"
            : "bg-primary/10 text-primary ring-primary/20",
        )}
      >
        {variant === "doc" ? (
          <FileCheck2 className="h-3.5 w-3.5" />
        ) : (
          <Send className="h-3.5 w-3.5" />
        )}
        <span className="text-foreground/80">{children}</span>
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex animate-message-in items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/beaker.png" alt="" className="h-8 w-8 shrink-0 object-contain" />
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <span className="animate-pulse text-sm text-muted-foreground">Thinking…</span>
      </div>
    </div>
  )
}
