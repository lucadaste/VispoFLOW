"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Send, Check, Circle, ArrowLeftRight } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { BotMessage, UserMessage } from "@/components/chat-message"
import { MobileSidebarTab } from "@/components/mobile-sidebar-tab"
import { SidebarPanel } from "@/components/sidebar-panel"
import {
  TRANSACTION_CATEGORIES,
  type TransactionCategory,
  type TransactionItem,
  type TransactionField,
  type FlowAnswers,
  initialAnswers,
} from "@/lib/flow"
import { cn } from "@/lib/utils"
import { loadPersisted, savePersisted } from "@/lib/persist"
import { STORAGE_KEYS } from "@/lib/storage-keys"

type TransactionsPersisted = {
  messages: ChatMsg[]
  activeCategoryId: TransactionCategory["id"] | null
  completed: Record<string, boolean>
  activeItemId: string | null
}

type ChatMsg =
  | { id: number; role: "bot"; text: string }
  | { id: number; role: "user"; text: string }
  | { id: number; role: "doc"; item: TransactionItem; groupTitle: string }

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20"

export function TransactionsOnboarding({
  answers = initialAnswers,
  onDocumentReady,
}: {
  answers?: FlowAnswers
  onDocumentReady?: (doc: { id: string; title: string; subtitle: string }) => void
} = {}) {
  const { user } = useUser()
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [activeCategory, setActiveCategory] = useState<TransactionCategory | null>(null)
  const [expandedCategoryId, setExpandedCategoryId] = useState<TransactionCategory["id"] | null>(null)
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
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

    const saved = loadPersisted<TransactionsPersisted>(STORAGE_KEYS.transactions)
    if (saved && saved.messages.length > 0) {
      idRef.current = saved.messages.reduce((max, m) => Math.max(max, m.id), 0)
      setMessages(saved.messages)
      const restoredCategory = TRANSACTION_CATEGORIES.find((c) => c.id === saved.activeCategoryId) ?? null
      setActiveCategory(restoredCategory)
      setExpandedCategoryId(restoredCategory?.id ?? null)
      setCompleted(saved.completed)
      setActiveItemId(saved.activeItemId)
      return
    }

    const name = user?.firstName
    pushBot(
      name
        ? `Hi ${name}, what kind of transaction document do you need today?`
        : "Hi! What kind of transaction document do you need today?"
    )
  }, [pushBot, user])

  useEffect(() => {
    if (!startedRef.current) return
    savePersisted<TransactionsPersisted>(STORAGE_KEYS.transactions, {
      messages,
      activeCategoryId: activeCategory?.id ?? null,
      completed,
      activeItemId,
    })
  }, [messages, activeCategory, completed, activeItemId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const selectCategory = useCallback((cat: TransactionCategory) => {
    pushUser(cat.label)
    pushBot(cat.chatResponse)
    setActiveCategory(cat)
    setExpandedCategoryId(cat.id)
  }, [pushBot, pushUser])

  const toggleCategory = useCallback((cat: TransactionCategory) => {
    setExpandedCategoryId((id) => (id === cat.id ? null : cat.id))
  }, [])

  const handleSend = useCallback(() => {
    const text = value.trim()
    if (!text) return
    setValue("")
    pushUser(text)
    pushBot("Happy to help. Feel free to fill out the form above or click any item in Transaction Documents to get started.")
  }, [value, pushBot, pushUser])

  const openItem = useCallback((item: TransactionItem, groupTitle: string) => {
    pushUser(item.title)
    pushBot(`Let's prepare the ${item.title}. Fill out the form below — feel free to ask me any questions as you go.`)
    setMessages((m) => [...m, { id: ++idRef.current, role: "doc", item, groupTitle }])
    setActiveItemId(item.id)
    setMobileOpen(false)
  }, [pushBot, pushUser])

  const handleDocComplete = useCallback((item: TransactionItem, groupTitle: string) => {
    setCompleted((c) => ({ ...c, [item.id]: true }))
    setActiveItemId(null)
    pushBot(`✓ ${item.title} has been saved. Select another document from the right to continue, or ask me anything.`)
    onDocumentReady?.({ id: item.id, title: item.title, subtitle: groupTitle })
  }, [pushBot, onDocumentReady])

  const prefill = (key?: keyof FlowAnswers | "computed"): string => {
    if (!key || key === "computed") return ""
    const v = answers[key]
    return typeof v === "string" ? v : ""
  }

  const allItems = TRANSACTION_CATEGORIES.flatMap((c) => c.groups.flatMap((g) => g.items))
  const doneCount = allItems.filter((i) => completed[i.id]).length
  const total = allItems.length

  const sidebarContent = (
    <SidebarContent
      activeCategory={activeCategory}
      expandedCategoryId={expandedCategoryId}
      completed={completed}
      activeItemId={activeItemId}
      onItemClick={openItem}
      onCategoryClick={toggleCategory}
    />
  )

  return (
    <div className="flex w-full flex-1 overflow-hidden">
      {/* ── Chat ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border bg-card/40 px-4 py-4 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">Transaction Center</h1>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl space-y-4">
            {messages.map((m) => {
              if (m.role === "bot") return <BotMessage key={m.id}>{m.text}</BotMessage>
              if (m.role === "user") return <UserMessage key={m.id}>{m.text}</UserMessage>
              if (m.role === "doc") return (
                <TransactionFormCard
                  key={m.id}
                  item={m.item}
                  groupTitle={m.groupTitle}
                  done={!!completed[m.item.id]}
                  prefill={prefill}
                  onComplete={() => handleDocComplete(m.item, m.groupTitle)}
                />
              )
              return null
            })}
            {!activeCategory && (
              <div className="flex flex-wrap gap-2 pt-2">
                {TRANSACTION_CATEGORIES.map((cat) => (
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
      </div>

      {/* ── Transaction Documents sidebar — always visible ≥ sm, collapsible ── */}
      <SidebarPanel icon={ArrowLeftRight} label="Transaction Documents" widthClass="w-52 md:w-60 lg:w-72 2xl:w-80">
        {sidebarContent}
      </SidebarPanel>

      {/* ── Mobile minimized tab / drawer (< sm only) — always available ── */}
      <MobileSidebarTab
        icon={ArrowLeftRight}
        label="Transaction Documents"
        count={total > 0 ? { done: doneCount, total } : undefined}
        open={mobileOpen}
        onOpenChange={setMobileOpen}
      >
        {sidebarContent}
      </MobileSidebarTab>
    </div>
  )
}

/* ── Sidebar content ── */

function SidebarContent({
  activeCategory, expandedCategoryId, completed, activeItemId, onItemClick, onCategoryClick,
}: {
  activeCategory: TransactionCategory | null
  expandedCategoryId: TransactionCategory["id"] | null
  completed: Record<string, boolean>
  activeItemId: string | null
  onItemClick: (item: TransactionItem, groupTitle: string) => void
  onCategoryClick: (cat: TransactionCategory) => void
}) {
  if (!activeCategory) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <ArrowLeftRight className="h-8 w-8 text-muted-foreground/40" />
        <p className="mt-3 text-sm font-medium text-foreground">No documents yet</p>
        <p className="mt-1 text-xs text-muted-foreground">Select a transaction category and its documents will appear here.</p>
      </div>
    )
  }

  return (
    <>
      <div className="border-b border-border px-4 py-4">
        <h2 className="text-sm font-semibold text-foreground">Transaction Documents</h2>
        <p className="mt-1 text-xs text-muted-foreground">Pick a category below to see what's available.</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {TRANSACTION_CATEGORIES.map((cat) => {
          const items = cat.groups.flatMap((g) => g.items)
          const doneCount = items.filter((i) => completed[i.id]).length
          const total = items.length
          const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0
          const isExpanded = expandedCategoryId === cat.id

          return (
            <div key={cat.id} className="border-b border-border last:border-b-0">
              <button
                onClick={() => onCategoryClick(cat)}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-3 text-left transition-colors",
                  isExpanded ? "bg-secondary/50" : "hover:bg-secondary/30"
                )}
              >
                <span className="text-sm font-semibold text-foreground">{cat.label}</span>
                <span className="text-xs font-medium text-muted-foreground">{doneCount}/{total}</span>
              </button>

              {isExpanded && (
                <div className="px-2 pb-3">
                  <div className="mx-2 mb-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
                  </div>
                  {cat.groups.map((group) => (
                    <div key={group.id} className="mb-4 last:mb-0">
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
                                  {done ? <Check className="h-3 w-3" strokeWidth={3} /> : <Circle className="h-3.5 w-3.5" />}
                                </span>
                                <div className="min-w-0 flex-1 leading-tight">
                                  <p className={cn("text-[12px] font-medium", done ? "text-muted-foreground line-through" : "text-foreground")}>
                                    {item.title}
                                  </p>
                                  <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">{item.description}</p>
                                </div>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

/* ── Inline transaction document form card ── */

function TransactionFormCard({
  item, groupTitle, done, prefill, onComplete,
}: {
  item: TransactionItem
  groupTitle: string
  done: boolean
  prefill: (key?: keyof FlowAnswers | "computed") => string
  onComplete: () => void
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(item.fields.map((f) => [f.name, prefill(f.prefillKey)]))
  )

  const isEmpty = (f: TransactionField) => !f.optional && !values[f.name]?.trim()
  const remaining = item.fields.filter(isEmpty).length
  const valid = remaining === 0
  const set = (name: string, val: string) => setValues((v) => ({ ...v, [name]: val }))

  if (done) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{groupTitle}</p>
          <p className="text-sm font-medium text-foreground">{item.title} — Saved</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="border-b border-border bg-secondary/30 px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{groupTitle}</p>
        <h3 className="mt-0.5 text-xl font-bold tracking-tight text-foreground">{item.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
      </div>

      {/* Fields */}
      <div className="space-y-4 px-5 py-5">
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
                {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
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
            {f.hint && <p className="mt-1.5 text-xs text-muted-foreground">{f.hint}</p>}
          </div>
        ))}
      </div>

      {/* Card footer */}
      <div className="flex items-center justify-between border-t border-border bg-secondary/20 px-5 py-3.5">
        <p className="text-sm text-muted-foreground">
          {valid ? "All fields complete." : `${remaining} required field${remaining === 1 ? "" : "s"} remaining.`}
        </p>
        <button
          onClick={onComplete}
          disabled={!valid}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Check className="h-4 w-4" />
          Save document
        </button>
      </div>
    </div>
  )
}
