"use client"

import { X } from "lucide-react"
import { BotMessage, UserMessage, DraftedCard } from "@/components/chat-message"

export type ConversationMessage =
  | { id: number; role: "bot"; text: string }
  | { id: number; role: "user"; text: string }
  | { id: number; role: "note"; text: string }
  | { id: number; role: "docDrafted"; groupTitle: string; title: string }

export type ConversationEntry = {
  id: string
  itemId: string
  title: string
  groupTitle: string
  completedAt: string
  messages: ConversationMessage[]
}

const formatCompletedAt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

/** Read-only replay of a past, completed item's chat — reached from the sidebar's History
 *  list. Only `bot`/`user`/`note`/`docDrafted` messages are ever archived into a
 *  ConversationEntry (see the archiving step in compliance-view.tsx / transactions-onboarding.tsx),
 *  so there's nothing interactive left to wire up here. */
export function ConversationViewer({
  entry,
  onClose,
  onOpenDoc,
}: {
  entry: ConversationEntry
  onClose: () => void
  onOpenDoc?: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="pr-4">
            <h3 className="text-base font-semibold text-foreground text-balance">{entry.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {entry.groupTitle} · Completed {formatCompletedAt(entry.completedAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-4">
            {(() => {
              const lastBotIndex = entry.messages.reduce((last, mm, idx) => (mm.role === "bot" ? idx : last), -1)
              return entry.messages.map((m, i) => {
              if (m.role === "bot") {
                return (
                  <BotMessage key={m.id} showIcon={i === lastBotIndex}>
                    {m.text}
                  </BotMessage>
                )
              }
              if (m.role === "user") return <UserMessage key={m.id}>{m.text}</UserMessage>
              if (m.role === "note") return (
                <p key={m.id} className="text-xs text-muted-foreground">{m.text}</p>
              )
              return (
                <DraftedCard
                  key={m.id}
                  groupTitle={m.groupTitle}
                  title={m.title}
                  onClick={onOpenDoc}
                />
              )
              })
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
