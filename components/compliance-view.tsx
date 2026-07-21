"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Send, Check, Circle, X, ShieldCheck, CalendarClock } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { BotMessage, UserMessage } from "@/components/chat-message"
import {
  COMPLIANCE_CATEGORIES,
  type ComplianceCategory,
  type ComplianceItem,
  type FlowAnswers,
} from "@/lib/flow"
import { cn } from "@/lib/utils"

type ChatMsg = { id: number; role: "bot" | "user"; text: string }

const fieldClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20"

export function ComplianceView({ answers }: { answers: FlowAnswers }) {
  const { user } = useUser()
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [activeCategory, setActiveCategory] = useState<ComplianceCategory | null>(null)
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [activeItem, setActiveItem] = useState<ComplianceItem | null>(null)
  const [value, setValue] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)
  const startedRef = useRef(false)

  const pushBot = useCallback((text: string) => {
    setMessages((m) => [...m, { id: ++idRef.current, role: "bot", text }])
  }, [])

  const pushUser = useCallback((text: string) => {
    setMessages((m) => [...m, { id: ++idRef.current, role: "user", text }])
  }, [])

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    const name = user?.firstName
    pushBot(
      name
        ? `Hi ${name}, what kind of compliance do you need help with today?`
        : "Hi! What kind of compliance do you need help with today?"
    )
  }, [pushBot, user])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const selectCategory = useCallback((cat: ComplianceCategory) => {
    pushUser(cat.label)
    pushBot(cat.chatResponse)
    setActiveCategory(cat)
  }, [pushBot, pushUser])

  const handleSubmit = useCallback(() => {
    const text = value.trim()
    if (!text) return
    setValue("")
    pushUser(text)
    pushBot("Happy to help. Feel free to click any item in the tracker on the right to get started, or keep asking questions here.")
  }, [value, pushBot, pushUser])

  const allItems = activeCategory?.groups.flatMap((g) => g.items) ?? []
  const doneCount = allItems.filter((i) => completed[i.id]).length
  const total = allItems.length
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  const prefill = (key?: keyof FlowAnswers | "computed") => {
    if (!key || key === "computed") return ""
    const v = answers[key]
    return typeof v === "string" ? v : ""
  }

  return (
    <div className="flex w-full flex-1 overflow-hidden">
      {/* ── Chat ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl space-y-4">
            {messages.map((m) =>
              m.role === "bot"
                ? <BotMessage key={m.id}>{m.text}</BotMessage>
                : <UserMessage key={m.id}>{m.text}</UserMessage>
            )}
          </div>
        </div>

        <div className="border-t border-border bg-white/80 backdrop-blur px-4 py-4 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl space-y-2.5">
            {!activeCategory && (
              <div className="flex flex-wrap gap-2">
                {COMPLIANCE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => selectCategory(cat)}
                    className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Type a message…"
                className="flex-1 bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60"
              />
              <button
                onClick={handleSubmit}
                disabled={!value.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
              >
                Send <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Compliance Tracker sidebar ── */}
      <aside className="hidden w-72 shrink-0 border-l border-border bg-card/40 xl:flex xl:flex-col 2xl:w-80">
        {activeCategory ? (
          <>
            <div className="border-b border-border px-5 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Compliance Tracker</h2>
                <span className="text-xs font-medium text-muted-foreground">{doneCount}/{total}</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-success transition-all duration-700 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Click any item to complete it.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">
              {activeCategory.groups.map((group) => (
                <div key={group.id} className="mb-4 last:mb-0">
                  <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.title}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const done = !!completed[item.id]
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => setActiveItem(item)}
                            className="flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-secondary/60"
                          >
                            <span className={cn(
                              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                              done ? "bg-success text-success-foreground" : "text-muted-foreground/40"
                            )}>
                              {done
                                ? <Check className="h-3 w-3" strokeWidth={3} />
                                : <Circle className="h-3.5 w-3.5" />
                              }
                            </span>
                            <div className="min-w-0 flex-1 leading-tight">
                              <p className={cn(
                                "text-[13px] font-medium",
                                done ? "text-muted-foreground line-through" : "text-foreground"
                              )}>
                                {item.title}
                              </p>
                              <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                                <CalendarClock className="h-2.5 w-2.5" />
                                {item.deadline}
                              </p>
                            </div>
                            {done
                              ? <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">Filed</span>
                              : <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent-foreground">Outstanding</span>
                            }
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <ShieldCheck className="h-8 w-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-foreground">Compliance Tracker</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Select a compliance category and your checklist will appear here.
            </p>
          </div>
        )}
      </aside>

      {/* ── Filing Drawer ── */}
      {activeItem && (
        <FilingDrawer
          item={activeItem}
          done={!!completed[activeItem.id]}
          prefill={prefill}
          onClose={() => setActiveItem(null)}
          onComplete={() => {
            setCompleted((c) => ({ ...c, [activeItem.id]: true }))
            setActiveItem(null)
          }}
        />
      )}
    </div>
  )
}

function FilingDrawer({
  item, done, prefill, onClose, onComplete,
}: {
  item: ComplianceItem
  done: boolean
  prefill: (key?: keyof FlowAnswers | "computed") => string
  onClose: () => void
  onComplete: () => void
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(item.fields.map((f) => [f.name, prefill(f.prefillKey)]))
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
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{f.label}</label>
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
