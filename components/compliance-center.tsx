"use client"

import { useMemo, useState } from "react"
import {
  ArrowLeft,
  Check,
  Clock,
  X,
  ChevronRight,
  ShieldCheck,
  CalendarClock,
} from "lucide-react"
import {
  COMPLIANCE_GROUPS,
  type ComplianceItem,
  type FlowAnswers,
} from "@/lib/flow"
import { cn } from "@/lib/utils"
import { ComplianceChat } from "@/components/compliance-chat"

const fieldClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20"

export function ComplianceCenter({
  answers,
  onBack,
}: {
  answers: FlowAnswers
  onBack: () => void
}) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [active, setActive] = useState<ComplianceItem | null>(null)

  const allItems = useMemo(() => COMPLIANCE_GROUPS.flatMap((g) => g.items), [])
  const doneCount = allItems.filter((i) => completed[i.id]).length
  const total = allItems.length
  const pct = Math.round((doneCount / total) * 100)

  const prefill = (key?: keyof FlowAnswers | "computed") => {
    if (!key || key === "computed") return ""
    const v = answers[key]
    return typeof v === "string" ? v : ""
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to formation
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance">Compliance Center</h1>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              We&apos;ve pre-selected the filings required for {answers.companyName || "your corporation"} based
              on your incorporation. Complete each one to stay in good standing.
            </p>
          </div>
        </div>

        {/* progress */}
        <div className="mt-6 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Overall progress</span>
            <span className="text-muted-foreground">
              {doneCount} of {total} complete
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-success transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          {doneCount === total && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-success">
              <Check className="h-4 w-4" /> All required filings complete — you&apos;re in good standing.
            </p>
          )}
        </div>

        {/* groups */}
        <div className="mt-8 space-y-8">
          {COMPLIANCE_GROUPS.map((group) => {
            const groupDone = group.items.filter((i) => completed[i.id]).length
            return (
              <section key={group.id}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.title}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {groupDone}/{group.items.length}
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {group.items.map((item) => {
                    const isDone = !!completed[item.id]
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => setActive(item)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/40",
                            isDone ? "border-success/30" : "border-border",
                          )}
                        >
                          <StatusDot done={isDone} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">{item.title}</p>
                            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                              {item.description}
                            </p>
                            <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                              <CalendarClock className="h-3 w-3" />
                              {item.deadline}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
                              isDone
                                ? "bg-success/10 text-success"
                                : "bg-accent/15 text-accent-foreground",
                            )}
                          >
                            {isDone ? "Filed" : "Outstanding"}
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      </div>

      <ComplianceChat />

      {active && (
        <FilingDrawer
          item={active}
          done={!!completed[active.id]}
          prefill={prefill}
          onClose={() => setActive(null)}
          onComplete={() => {
            setCompleted((c) => ({ ...c, [active.id]: true }))
            setActive(null)
          }}
        />
      )}
    </div>
  )
}

function StatusDot({ done }: { done: boolean }) {
  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
        done ? "bg-success text-success-foreground" : "bg-secondary text-muted-foreground",
      )}
    >
      {done ? <Check className="h-4 w-4" strokeWidth={3} /> : <Clock className="h-3.5 w-3.5" />}
    </span>
  )
}

function FilingDrawer({
  item,
  done,
  prefill,
  onClose,
  onComplete,
}: {
  item: ComplianceItem
  done: boolean
  prefill: (key?: keyof FlowAnswers | "computed") => string
  onClose: () => void
  onComplete: () => void
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(item.fields.map((f) => [f.name, prefill(f.prefillKey)])),
  )
  const valid = item.fields.every((f) => values[f.name]?.trim())

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col bg-card shadow-xl animate-message-in">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div className="pr-4">
            <h3 className="text-base font-semibold text-foreground text-balance">{item.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{item.deadline}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <p className="rounded-lg bg-secondary/60 p-3 text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>

          <div className="mt-5 space-y-4">
            {item.fields.map((f) => (
              <div key={f.name}>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  {f.label}
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    rows={2}
                    value={values[f.name] ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    className={cn(fieldClass, "resize-none")}
                  />
                ) : (
                  <input
                    type={f.type === "date" ? "date" : "text"}
                    value={values[f.name] ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    className={fieldClass}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border px-5 py-4">
          <button
            onClick={onComplete}
            disabled={!valid}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check className="h-4 w-4" />
            {done ? "Update filing" : "Mark as filed"}
          </button>
        </div>
      </div>
    </div>
  )
}
