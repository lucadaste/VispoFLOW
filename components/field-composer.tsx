"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import type { ChatField } from "@/lib/flow"

/** One-at-a-time input for a single field in a conversational (chat mode) flow. */
export function FieldComposer({
  field, initialValue, onSubmit,
}: {
  field: ChatField
  initialValue: string
  onSubmit: (v: string) => void
}) {
  const [value, setValue] = useState(initialValue)
  const canSubmit = field.optional || !!value.trim()
  const placeholder =
    field.placeholder ??
    (field.optional
      ? "Type an answer, ask a question, or press Enter to skip…"
      : "Type your answer, or feel free to ask a question…")
  return (
    <div className="flex items-end gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm">
      <div className="flex-1 px-1">
        {field.type === "select" ? (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full cursor-pointer bg-transparent py-1.5 text-sm text-foreground outline-none"
          >
            <option value="" disabled>Select…</option>
            {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : field.type === "textarea" ? (
          <textarea
            rows={2}
            value={value}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
            className="w-full resize-none bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        ) : (
          <input
            type={field.type === "date" ? "date" : "text"}
            value={value}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && onSubmit(value)}
            className="w-full bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        )}
      </div>
      {field.optional && (
        <button
          onClick={() => onSubmit("")}
          className="shrink-0 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Skip
        </button>
      )}
      <button
        onClick={() => onSubmit(value)}
        disabled={!canSubmit}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Send <Send className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
