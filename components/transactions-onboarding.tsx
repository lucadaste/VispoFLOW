"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Send, Check, Circle, ArrowLeftRight, Info } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { BotMessage, UserMessage, TypingIndicator } from "@/components/chat-message"
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
import { loadPersisted, savePersisted, loadFromServer, saveToServer } from "@/lib/persist"
import { STORAGE_KEYS } from "@/lib/storage-keys"
import { FieldComposer } from "@/components/field-composer"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { InfoModal, infoButtonClass } from "@/components/info-modal"
import { ConfirmModal } from "@/components/confirm-modal"
import { DocumentViewer, type LibraryDoc } from "@/components/document-library"
import { renderTransactionDocument } from "@/lib/transaction-templates"

type TransactionsPersisted = {
  messages: ChatMsg[]
  activeCategoryId: TransactionCategory["id"] | null
  completed: Record<string, boolean>
  activeItemId: string | null
  docs: Record<string, LibraryDoc>
  inputMode?: "chat" | "form"
}

type ChatMsg =
  | { id: number; role: "bot"; text: string }
  | { id: number; role: "user"; text: string }
  | { id: number; role: "doc"; item: TransactionItem; groupTitle: string }

type ActiveFiling = {
  item: TransactionItem
  groupTitle: string
  fieldIndex: number
  values: Record<string, string>
}

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20"

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
const typingTime = (text: string) => Math.min(1100, Math.max(450, text.length * 14))

export function TransactionsOnboarding({
  answers = initialAnswers,
  onDocumentReady,
  onItemDeleted,
  onGoToLibrary,
}: {
  answers?: FlowAnswers
  onDocumentReady?: (doc: LibraryDoc) => void
  onItemDeleted?: (id: string) => void
  onGoToLibrary?: () => void
} = {}) {
  const { user, isSignedIn } = useUser()
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [activeCategory, setActiveCategory] = useState<TransactionCategory | null>(null)
  const [expandedCategoryId, setExpandedCategoryId] = useState<TransactionCategory["id"] | null>(null)
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
  const [docs, setDocs] = useState<Record<string, LibraryDoc>>({})
  const [inputMode, setInputMode] = useState<"chat" | "form">("chat")
  const [activeFiling, setActiveFiling] = useState<ActiveFiling | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [infoItem, setInfoItem] = useState<TransactionItem | null>(null)
  const [viewingDoc, setViewingDoc] = useState<{ doc: LibraryDoc; item: TransactionItem; groupTitle: string } | null>(null)
  const [redoConfirm, setRedoConfirm] = useState<{ item: TransactionItem; groupTitle: string } | null>(null)
  const [switchConfirm, setSwitchConfirm] = useState<
    | { mode: "restart"; item: TransactionItem; groupTitle: string }
    | { mode: "abandon"; fromItem: TransactionItem; item: TransactionItem; groupTitle: string }
    | null
  >(null)
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

  const pushBotTyped = useCallback(async (text: string) => {
    setIsTyping(true)
    await delay(typingTime(text))
    setIsTyping(false)
    setMessages((m) => [...m, { id: ++idRef.current, role: "bot", text }])
    await delay(150)
  }, [])

  const applyState = useCallback((saved: TransactionsPersisted) => {
    idRef.current = saved.messages.reduce((max, m) => Math.max(max, m.id), 0)
    // Don't restore document forms the user opened but never completed — reopening one
    // implicitly re-runs autofill, so it must only happen from an explicit click, not on load.
    const restoredMessages = saved.messages.filter(
      (m) => m.role !== "doc" || saved.completed[m.item.id]
    )
    setMessages(restoredMessages)
    const restoredCategory = TRANSACTION_CATEGORIES.find((c) => c.id === saved.activeCategoryId) ?? null
    setActiveCategory(restoredCategory)
    setExpandedCategoryId(restoredCategory?.id ?? null)
    setCompleted(saved.completed)
    setDocs(saved.docs ?? {})
    setInputMode(saved.inputMode ?? "chat")
    // activeItemId only ever points at an incomplete item (completion clears it), so
    // it always refers to a form we just dropped above — nothing should read as "open".
    setActiveItemId(null)
  }, [])

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const saved = loadPersisted<TransactionsPersisted>(STORAGE_KEYS.transactions)
    if (saved && saved.messages.length > 0) {
      applyState(saved)
      return
    }

    const name = user?.firstName
    pushBot(
      name
        ? `Hi ${name}, what kind of transaction document do you need today?`
        : "Hi! What kind of transaction document do you need today?"
    )
  }, [pushBot, user, applyState])

  // Once signed in, the account's cloud copy (if any) takes over from the local one
  const syncedRef = useRef(false)
  useEffect(() => {
    if (!isSignedIn || syncedRef.current) return
    syncedRef.current = true
    loadFromServer<TransactionsPersisted>(STORAGE_KEYS.transactions).then((saved) => {
      if (saved && saved.messages.length > 0) {
        startedRef.current = true
        applyState(saved)
      }
    })
  }, [isSignedIn, applyState])

  useEffect(() => {
    if (!startedRef.current) return
    const snapshot: TransactionsPersisted = {
      messages,
      activeCategoryId: activeCategory?.id ?? null,
      completed,
      activeItemId,
      docs,
      inputMode,
    }
    savePersisted<TransactionsPersisted>(STORAGE_KEYS.transactions, snapshot)
    if (isSignedIn) saveToServer(STORAGE_KEYS.transactions, snapshot)
  }, [messages, activeCategory, completed, activeItemId, docs, inputMode, isSignedIn])

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

  const fieldPrompt = (f: TransactionField) =>
    `${f.label}${f.optional ? " (optional)" : ""}${f.hint ? ` — ${f.hint}` : ""}`

  const openItem = useCallback((item: TransactionItem, groupTitle: string) => {
    pushUser(item.title)
    setActiveItemId(item.id)
    setMobileOpen(false)
    if (inputMode === "chat") {
      setActiveFiling({ item, groupTitle, fieldIndex: 0, values: {} })
      ;(async () => {
        await pushBotTyped(`Let's prepare the ${item.title} — I'll ask you for each field one at a time.`)
        await pushBotTyped(fieldPrompt(item.fields[0]))
      })()
    } else {
      pushBot(`Let's prepare the ${item.title}. Fill out the form below — feel free to ask me any questions as you go.`)
      setMessages((m) => [...m, { id: ++idRef.current, role: "doc", item, groupTitle }])
    }
  }, [pushBot, pushUser, pushBotTyped, inputMode])

  const handleDocComplete = useCallback((item: TransactionItem, groupTitle: string, values: Record<string, string>) => {
    const doc: LibraryDoc = { id: item.id, title: item.title, subtitle: groupTitle, content: renderTransactionDocument(item.id, values) ?? undefined }
    setCompleted((c) => ({ ...c, [item.id]: true }))
    setDocs((d) => ({ ...d, [item.id]: doc }))
    setActiveItemId(null)
    pushBot(`✓ ${item.title} has been saved. Select another document from the right to continue, or ask me anything.`)
    onDocumentReady?.(doc)
  }, [pushBot, onDocumentReady])

  const handleFieldSubmit = useCallback((raw: string) => {
    if (!activeFiling) return
    const { item, groupTitle, fieldIndex, values } = activeFiling
    const field = item.fields[fieldIndex]
    const val = raw.trim()
    if (!field.optional && !val) return
    pushUser(val || "Skipped")
    const nextValues = { ...values, [field.name]: val }
    const nextIndex = fieldIndex + 1
    if (nextIndex < item.fields.length) {
      setActiveFiling({ item, groupTitle, fieldIndex: nextIndex, values: nextValues })
      ;(async () => {
        await delay(250)
        await pushBotTyped(fieldPrompt(item.fields[nextIndex]))
      })()
    } else {
      setActiveFiling(null)
      handleDocComplete(item, groupTitle, nextValues)
    }
  }, [activeFiling, pushUser, pushBotTyped, handleDocComplete])

  const prefill = (key?: keyof FlowAnswers | "computed"): string => {
    if (!key || key === "computed") return ""
    const v = answers[key]
    return typeof v === "string" ? v : ""
  }

  const allItems = TRANSACTION_CATEGORIES.flatMap((c) => c.groups.flatMap((g) => g.items))
  const doneCount = allItems.filter((i) => completed[i.id]).length
  const total = allItems.length
  // Category chips are only for the very first choice — once a category or a document has
  // been picked (even via a direct sidebar click that skips selectCategory), hide them for good.
  const hasStartedFlow = !!activeCategory || !!activeItemId || !!activeFiling || Object.keys(docs).length > 0

  // Guard against accidentally interrupting a document that's already open: re-clicking the
  // same in-progress item asks to restart it, clicking a different one asks to abandon it.
  const requestOpenItem = useCallback((item: TransactionItem, groupTitle: string) => {
    if (!activeItemId) return openItem(item, groupTitle)
    if (activeItemId === item.id) {
      setSwitchConfirm({ mode: "restart", item, groupTitle })
      return
    }
    const fromItem = allItems.find((i) => i.id === activeItemId)
    if (!fromItem) return openItem(item, groupTitle)
    setSwitchConfirm({ mode: "abandon", fromItem, item, groupTitle })
  }, [activeItemId, allItems, openItem])

  const sidebarContent = (
    <SidebarContent
      expandedCategoryId={expandedCategoryId}
      completed={completed}
      docs={docs}
      activeItemId={activeItemId}
      onItemClick={requestOpenItem}
      onCategoryClick={toggleCategory}
      onInfoClick={setInfoItem}
      onViewClick={(doc, item, groupTitle) => setViewingDoc({ doc, item, groupTitle })}
    />
  )

  return (
    <div className="flex w-full flex-1 overflow-hidden">
      {/* ── Chat ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border bg-card/40 px-4 py-4 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">Transaction Center</h1>
            <div className="inline-flex items-center rounded-full border border-border bg-card p-0.5 text-xs shadow-sm">
              <button
                onClick={() => setInputMode("chat")}
                className={cn(
                  "rounded-full px-3 py-1 font-medium transition-colors",
                  inputMode === "chat" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Chat
              </button>
              <button
                onClick={() => setInputMode("form")}
                className={cn(
                  "rounded-full px-3 py-1 font-medium transition-colors",
                  inputMode === "form" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Questionnaire
              </button>
            </div>
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
                  onComplete={(values) => handleDocComplete(m.item, m.groupTitle, values)}
                  onInfoClick={() => setInfoItem(m.item)}
                />
              )
              return null
            })}
            {!hasStartedFlow && (
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
            {isTyping && <TypingIndicator />}
          </div>
        </div>

        <div className="border-t border-border bg-white/80 backdrop-blur px-4 py-4 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl">
            {activeFiling ? (
              <FieldComposer
                key={`${activeFiling.item.id}-${activeFiling.fieldIndex}`}
                field={activeFiling.item.fields[activeFiling.fieldIndex]}
                initialValue={prefill(activeFiling.item.fields[activeFiling.fieldIndex].prefillKey)}
                onSubmit={handleFieldSubmit}
              />
            ) : (
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
            )}
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

      {infoItem && (
        <InfoModal
          title={infoItem.title}
          description={infoItem.description}
          onClose={() => setInfoItem(null)}
        />
      )}
      {viewingDoc && (
        <DocumentViewer
          doc={viewingDoc.doc}
          answers={answers}
          onClose={() => setViewingDoc(null)}
          onGoToLibrary={onGoToLibrary ? () => { setViewingDoc(null); onGoToLibrary() } : undefined}
          onDeleteRestart={() => {
            const { item, groupTitle } = viewingDoc
            setViewingDoc(null)
            setRedoConfirm({ item, groupTitle })
          }}
        />
      )}
      {redoConfirm && (
        <ConfirmModal
          title="Delete and restart this document?"
          description={`"${redoConfirm.item.title}" has already been completed. This will delete your saved answers and ask the questions again from the start.`}
          confirmLabel="Delete & restart"
          onConfirm={() => {
            const { item, groupTitle } = redoConfirm
            setRedoConfirm(null)
            setCompleted((c) => {
              const { [item.id]: _removed, ...rest } = c
              return rest
            })
            setDocs((d) => {
              const { [item.id]: _removed, ...rest } = d
              return rest
            })
            openItem(item, groupTitle)
          }}
          onCancel={() => setRedoConfirm(null)}
        />
      )}
      {switchConfirm && (
        <ConfirmModal
          title={switchConfirm.mode === "restart" ? "Would you like to restart this document?" : "Would you like to abandon the document you're currently working on?"}
          description={
            switchConfirm.mode === "restart"
              ? `You're partway through "${switchConfirm.item.title}". Restarting will erase your progress and start over from the first question.`
              : `You're partway through "${switchConfirm.fromItem.title}". Starting "${switchConfirm.item.title}" now will abandon your progress on it.`
          }
          confirmLabel={switchConfirm.mode === "restart" ? "Restart document" : "Abandon & switch"}
          onConfirm={() => {
            const { item, groupTitle } = switchConfirm
            setSwitchConfirm(null)
            openItem(item, groupTitle)
          }}
          onCancel={() => setSwitchConfirm(null)}
        />
      )}
    </div>
  )
}

/* ── Sidebar content ── */

function SidebarContent({
  expandedCategoryId, completed, docs, activeItemId, onItemClick, onCategoryClick, onInfoClick, onViewClick,
}: {
  expandedCategoryId: TransactionCategory["id"] | null
  completed: Record<string, boolean>
  docs: Record<string, LibraryDoc>
  activeItemId: string | null
  onItemClick: (item: TransactionItem, groupTitle: string) => void
  onCategoryClick: (cat: TransactionCategory) => void
  onInfoClick: (item: TransactionItem) => void
  onViewClick: (doc: LibraryDoc, item: TransactionItem, groupTitle: string) => void
}) {
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
                          const doc = docs[item.id]
                          const isActive = activeItemId === item.id
                          const handleClick = () => {
                            if (done && doc) return onViewClick(doc, item, group.title)
                            return onItemClick(item, group.title)
                          }
                          return (
                            <li key={item.id}>
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={handleClick}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault()
                                    handleClick()
                                  }
                                }}
                                className={cn(
                                  "flex w-full cursor-pointer items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors",
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
                                  <div className="flex items-center gap-1">
                                    <p className={cn("text-[12px] font-medium", done ? "text-muted-foreground line-through" : "text-foreground")}>
                                      {item.title}
                                    </p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onInfoClick(item)
                                      }}
                                      aria-label={`What is ${item.title}?`}
                                      className={infoButtonClass}
                                    >
                                      <Info className="h-3 w-3" />
                                    </button>
                                  </div>
                                  <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">{item.description}</p>
                                </div>
                              </div>
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
  item, groupTitle, done, prefill, onComplete, onInfoClick,
}: {
  item: TransactionItem
  groupTitle: string
  done: boolean
  prefill: (key?: keyof FlowAnswers | "computed") => string
  onComplete: (values: Record<string, string>) => void
  onInfoClick: () => void
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
        <div className="mt-0.5 flex items-center gap-1.5">
          <h3 className="text-xl font-bold tracking-tight text-foreground">{item.title}</h3>
          <button
            onClick={onInfoClick}
            aria-label={`What is ${item.title}?`}
            className={infoButtonClass}
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
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
            ) : f.type === "address" ? (
              <AddressAutocomplete
                value={values[f.name] ?? ""}
                onChange={(v) => set(f.name, v)}
                placeholder={f.placeholder}
                className={inputClass}
                rows={3}
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
          onClick={() => onComplete(values)}
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
