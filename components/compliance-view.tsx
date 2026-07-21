"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Send, Check, Circle, ShieldCheck, CalendarClock, ArrowLeft, X } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { BotMessage, UserMessage } from "@/components/chat-message"
import {
  COMPLIANCE_CATEGORIES,
  type ComplianceCategory,
  type ComplianceItem,
  type ComplianceField,
  type FlowAnswers,
} from "@/lib/flow"
import { cn } from "@/lib/utils"

type ChatMsg = { id: number; role: "bot" | "user"; text: string }
type ActiveItem = { item: ComplianceItem; groupTitle: string; categoryLabel: string }

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20"

export function ComplianceView({ answers }: { answers: FlowAnswers }) {
  const { user } = useUser()
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [activeCategory, setActiveCategory] = useState<ComplianceCategory | null>(null)
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
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
    if (!activeItem) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    }
  }, [messages, activeItem])

  const selectCategory = useCallback((cat: ComplianceCategory) => {
    pushUser(cat.label)
    pushBot(cat.chatResponse)
    setActiveCategory(cat)
  }, [pushBot, pushUser])

  const handleSend = useCallback(() => {
    const text = value.trim()
    if (!text) return
    setValue("")
    pushUser(text)
    pushBot("Happy to help. Feel free to click any item in the Compliance Center on the right to get started, or keep asking questions here.")
  }, [value, pushBot, pushUser])

  const handleFilingComplete = useCallback((item: ComplianceItem) => {
    setCompleted((c) => ({ ...c, [item.id]: true }))
    pushBot(`✓ ${item.title} has been saved. Select another filing from the right to continue, or ask me anything.`)
    setActiveItem(null)
  }, [pushBot])

  const prefill = (key?: keyof FlowAnswers | "computed"): string => {
    if (!key || key === "computed") return ""
    const v = answers[key]
    return typeof v === "string" ? v : ""
  }

  const allItems = activeCategory?.groups.flatMap((g) => g.items) ?? []
  const doneCount = allItems.filter((i) => completed[i.id]).length
  const total = allItems.length
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  const openItem = (item: ComplianceItem, groupTitle: string) => {
    setActiveItem({ item, groupTitle, categoryLabel: activeCategory!.label })
    setMobileOpen(false)
  }

  const sidebarContent = (
    <SidebarContent
      activeCategory={activeCategory}
      completed={completed}
      activeItemId={activeItem?.item.id}
      doneCount={doneCount}
      total={total}
      pct={pct}
      onItemClick={openItem}
    />
  )

  return (
    <div className="flex w-full flex-1 overflow-hidden">
      {/* ── Chat / Filing area ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {activeItem ? (
          <FilingForm
            item={activeItem.item}
            groupTitle={activeItem.groupTitle}
            categoryLabel={activeItem.categoryLabel}
            done={!!completed[activeItem.item.id]}
            prefill={prefill}
            onBack={() => setActiveItem(null)}
            onComplete={() => handleFilingComplete(activeItem.item)}
          />
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-12">
              <div className="mx-auto max-w-2xl space-y-4">
                {messages.map((m) =>
                  m.role === "bot"
                    ? <BotMessage key={m.id}>{m.text}</BotMessage>
                    : <UserMessage key={m.id}>{m.text}</UserMessage>
                )}
                {!activeCategory && (
                  <div className="flex flex-wrap gap-2 pt-2">
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
              </div>
            </div>

            <div className="border-t border-border bg-white/80 backdrop-blur px-4 py-4 sm:px-8 lg:px-12">
              <div className="mx-auto max-w-2xl">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm">
                  <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Feel free to ask any questions…"
                    className="flex-1 bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!value.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
                  >
                    Send <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Compliance Center sidebar — always visible ≥ sm ── */}
      <aside className="hidden w-52 shrink-0 flex-col border-l border-border bg-card/40 sm:flex md:w-60 lg:w-72 2xl:w-80">
        {sidebarContent}
      </aside>

      {/* ── Mobile: floating tab button (< sm only) ── */}
      {activeCategory && (
        <button
          onClick={() => setMobileOpen(true)}
          className="sm:hidden fixed bottom-24 right-3 z-40 flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-md transition-colors hover:border-primary hover:text-primary"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Compliance Center {total > 0 && <span className="text-muted-foreground">({doneCount}/{total})</span>}
        </button>
      )}

      {/* ── Mobile: bottom sheet (< sm only) ── */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex max-h-[78dvh] flex-col overflow-hidden rounded-t-2xl bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-semibold text-foreground">Compliance Center</h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SidebarContent({
  activeCategory, completed, activeItemId, doneCount, total, pct, onItemClick,
}: {
  activeCategory: ComplianceCategory | null
  completed: Record<string, boolean>
  activeItemId: string | undefined
  doneCount: number
  total: number
  pct: number
  onItemClick: (item: ComplianceItem, groupTitle: string) => void
}) {
  if (!activeCategory) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <ShieldCheck className="h-8 w-8 text-muted-foreground/40" />
        <p className="mt-3 text-sm font-medium text-foreground">Compliance Center</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Select a compliance category and your checklist will appear here.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Compliance Center</h2>
          <span className="text-xs font-medium text-muted-foreground">{doneCount}/{total}</span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Click any item to begin filing.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {activeCategory.groups.map((group) => (
          <div key={group.id} className="mb-4 last:mb-0">
            <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const done = !!completed[item.id]
                const isActive = activeItemId === item.id
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onItemClick(item, group.title)}
                      className={cn(
                        "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors",
                        isActive ? "bg-primary/10" : "hover:bg-secondary/60"
                      )}
                    >
                      <span className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                        done ? "bg-primary text-primary-foreground" : "text-muted-foreground/40"
                      )}>
                        {done
                          ? <Check className="h-3 w-3" strokeWidth={3} />
                          : <Circle className="h-3.5 w-3.5" />
                        }
                      </span>
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className={cn(
                          "text-[12px] font-medium",
                          done ? "text-muted-foreground line-through" : "text-foreground"
                        )}>
                          {item.title}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                          <CalendarClock className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">{item.deadline}</span>
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </>
  )
}

function FilingForm({
  item, groupTitle, categoryLabel, done, prefill, onBack, onComplete,
}: {
  item: ComplianceItem
  groupTitle: string
  categoryLabel: string
  done: boolean
  prefill: (key?: keyof FlowAnswers | "computed") => string
  onBack: () => void
  onComplete: () => void
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(item.fields.map((f) => [f.name, prefill(f.prefillKey)]))
  )

  const isEmpty = (f: ComplianceField) => !f.optional && !values[f.name]?.trim()
  const remaining = item.fields.filter(isEmpty).length
  const valid = remaining === 0

  const set = (name: string, val: string) => setValues((v) => ({ ...v, [name]: val }))

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to {categoryLabel}
          </button>

          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {groupTitle}
          </p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-foreground">{item.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>

          <div className="mt-8 space-y-5">
            {item.fields.map((f) => (
              <div key={f.name}>
                <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-foreground">
                  {f.label}
                  {!f.optional && <span className="text-destructive">*</span>}
                </label>
                {f.type === "select" ? (
                  <select
                    value={values[f.name] ?? ""}
                    onChange={(e) => set(f.name, e.target.value)}
                    className={cn(inputClass, "cursor-pointer")}
                  >
                    <option value="" disabled>Select…</option>
                    {f.options?.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea
                    rows={3}
                    value={values[f.name] ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) => set(f.name, e.target.value)}
                    className={cn(inputClass, "resize-none")}
                  />
                ) : (
                  <input
                    type={f.type === "date" ? "date" : "text"}
                    value={values[f.name] ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) => set(f.name, e.target.value)}
                    className={inputClass}
                  />
                )}
                {f.hint && (
                  <p className="mt-1.5 text-xs text-muted-foreground">{f.hint}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-white/80 backdrop-blur px-4 py-4 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {valid
              ? "All fields complete."
              : `${remaining} required field${remaining === 1 ? "" : "s"} remaining.`}
          </p>
          <button
            onClick={onComplete}
            disabled={!valid}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check className="h-4 w-4" />
            {done ? "Update filing" : "Save filing"}
          </button>
        </div>
      </div>
    </div>
  )
}
