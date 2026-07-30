"use client"

import { useState } from "react"
import { CalendarClock } from "lucide-react"

/** ── Clickable choices for a chat-mode field: a fixed option set, or a date picker.
 *  Rendered inline in the message stream (not in the composer bar) so the bar itself can stay
 *  a plain text input the user can still type a question into while the field is pending. ── */

export function FieldChoicesBubble({
  field, active, onChoose,
}: {
  field: { type?: string; options?: string[] }
  active: boolean
  onChoose: (val: string) => void
}) {
  const [date, setDate] = useState("")

  if (field.type === "date") {
    return (
      <div className="flex items-center gap-2 pl-12">
        <div className="relative">
          <CalendarClock className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={!active}
            className="rounded-full border border-border bg-card py-1.5 pl-8 pr-3 text-xs font-medium text-card-foreground shadow-sm outline-none transition-colors focus:border-ring disabled:opacity-50"
          />
        </div>
        <button
          onClick={() => onChoose(date)}
          disabled={!active || !date}
          className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-colors enabled:hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Use this date
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2 pl-12">
      {field.options?.map((o) => (
        <button
          key={o}
          onClick={() => onChoose(o)}
          disabled={!active}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-card-foreground shadow-sm transition-colors enabled:hover:border-primary/50 enabled:hover:text-primary disabled:cursor-default disabled:opacity-50"
        >
          {o}
        </button>
      ))}
    </div>
  )
}
