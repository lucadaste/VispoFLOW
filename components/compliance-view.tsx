"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Send, Check, Circle, ShieldCheck, CalendarClock, Info, History as HistoryIcon, FileCheck2, Trash2, MessageSquarePlus, HelpCircle } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { BotMessage, UserMessage, TypingIndicator, DraftedCard } from "@/components/chat-message"
import { MobileSidebarTab } from "@/components/mobile-sidebar-tab"
import { SidebarPanel } from "@/components/sidebar-panel"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { FieldChoicesBubble } from "@/components/field-choices-bubble"
import {
  COMPLIANCE_CATEGORIES,
  findComplianceItem,
  type ComplianceCategory,
  type ComplianceItem,
  type ComplianceField,
  type FlowAnswers,
} from "@/lib/flow"
import { renderComplianceDocument, hasComplianceTemplate } from "@/lib/compliance-templates"
import { cn } from "@/lib/utils"
import { loadPersisted, savePersisted, loadFromServer, saveToServer } from "@/lib/persist"
import { STORAGE_KEYS } from "@/lib/storage-keys"
import {
  DocumentViewer,
  withDocSignatures,
  redactSensitiveDocValues,
  rehydrateSensitiveDocValues,
  mergeServerSensitiveValues,
  docHasSensitiveFields,
  SENSITIVE_FIELD_PLACEHOLDER,
  type LibraryDoc,
  type DocSignature,
} from "@/components/document-library"
import { stashSensitiveValues, restoreSensitiveValues } from "@/lib/sensitive-session-store"
import { saveSensitiveValueToServer, loadSensitiveValuesFromServer } from "@/lib/sensitive-server-store"
import { InfoModal, infoButtonClass } from "@/components/info-modal"
import { ConfirmModal } from "@/components/confirm-modal"
import { formatNumberInput } from "@/lib/number-format"
import { formatSsnInput } from "@/lib/ssn-format"
import { ConversationViewer, type ConversationEntry, type ConversationMessage } from "@/components/conversation-viewer"

type CompliancePersisted = {
  messages: ChatMsg[]
  activeCategoryId: ComplianceCategory["id"] | null
  completed: Record<string, boolean>
  activeItemId: string | null
  docs: Record<string, LibraryDoc>
  inputMode?: "chat" | "form"
  activeFiling?: ActiveFiling | null
  history?: ConversationEntry[]
  chatBreakId?: number | null
}

type ChatMsg =
  | { id: number; role: "bot"; text: string }
  | { id: number; role: "user"; text: string }
  | { id: number; role: "filing"; item: ComplianceItem; groupTitle: string }
  | { id: number; role: "categories" }
  | { id: number; role: "fieldChoices"; item: ComplianceItem; groupTitle: string; fieldIndex: number }
  | { id: number; role: "note"; text: string }
  | { id: number; role: "docDrafted"; item: ComplianceItem; groupTitle: string }

type PendingDelegation = { fieldName: string; fieldLabel: string; recipientName: string }

type ActiveFiling = {
  item: ComplianceItem
  groupTitle: string
  fieldIndex: number
  values: Record<string, string>
  /** any `delegatable` fields in this filing that were routed to an emailed invite instead of
   *  being asked here — carried onto the finished LibraryDoc as `awaitingThirdParty` so the
   *  Document Library can show it's still waiting on someone. See the `delegatable` doc comment
   *  on lib/flow.ts's ComplianceField. */
  pendingDelegations?: PendingDelegation[]
}

/** A pending emailed invite for a single delegated field — mirrors the identical type in
 *  incorporation-app.tsx. That component's own copy of a completed doc gets the real value merged
 *  in once the invite is fulfilled, but this component's `docs` (what the sidebar/DocumentViewer
 *  here actually render) is a separate, independently-restored copy that never heard about it —
 *  so it needs its own poll + merge, below, to stay in sync. */
type InfoRequest = {
  id: string
  docId: string
  fieldName: string
  status: "sent" | "viewed" | "fulfilled"
}

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20"

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
const typingTime = (text: string) => Math.min(1100, Math.max(450, text.length * 14))
const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
/** The in-document placeholder for a `delegatable` field whose real value hasn't arrived yet —
 *  distinct from SENSITIVE_FIELD_PLACEHOLDER (used only at the localStorage/server persistence
 *  boundary): this one is meant to be read, since it renders directly into the draft document. */
const delegatedFieldPlaceholder = (recipientName: string) => `(to be entered directly by ${recipientName})`
const DELEGATED_PLACEHOLDER_RE = /^\(to be entered directly by (.+)\)$/

// Reconstructs which fields ended up delegated to a third party purely from the collected
// `values` — used when a filing is completed from Questionnaire mode, where (unlike the chat
// flow) there's no separately-threaded `pendingDelegations` list to hand off.
function derivePendingDelegations(item: ComplianceItem, values: Record<string, string>): PendingDelegation[] {
  const result: PendingDelegation[] = []
  for (const f of item.fields) {
    const match = DELEGATED_PLACEHOLDER_RE.exec(values[f.name] ?? "")
    if (match) result.push({ fieldName: f.name, fieldLabel: f.label, recipientName: match[1] })
  }
  return result
}

/** Heuristic for whether a chat message sent mid-filing is a question rather than an answer. */
const looksLikeQuestion = (text: string) =>
  /\?\s*$/.test(text) ||
  /^(what|why|who|when|where|how|is|are|do|does|can|could|should|will|explain|tell me)\b/i.test(text.trim())

// Prefills a field from the company's formation answers first (e.g. company name), then falls
// back to whatever value the user already gave for a field of the same name on any other
// completed (and not-deleted) compliance filing — e.g. the same DE registered agent's name given
// on the original appointment carries over to its renewal — mirroring the same fallback in
// components/transactions-onboarding.tsx. This only fires for fields explicitly marked `shared`
// in lib/flow.ts — a `name` collision alone isn't enough, since plenty of unrelated fields
// (e.g. "otherMatters", "effectiveDate") happen to share a name across filings without meaning
// the same real-world value. See the `ComplianceField.shared` doc comment for why each opt-in
// was judged safe.
function prefillValue(answers: FlowAnswers, docs: Record<string, LibraryDoc>, field?: ComplianceField): string {
  if (!field) return ""
  if (field.prefillKey && field.prefillKey !== "computed") {
    const v = answers[field.prefillKey]
    if (typeof v === "string" && v) return v
  }
  if (!field.shared) return ""
  for (const doc of Object.values(docs)) {
    const v = doc.values?.[field.name]
    if (v) return v
  }
  return ""
}

// Fields marked `sensitive` in lib/flow.ts (e.g. an SSN/ITIN on the EIN or 83(b) filing) must
// never reach localStorage or the server as their real value — only the live in-memory state used
// to render/download the doc during this session. Called right at the persistence boundary (see the
// snapshot effect below and redactSensitiveDocValues in document-library.tsx for the completed-doc
// counterpart) so the on-screen doc still shows the real value; only the saved copy gets the
// placeholder. The real value is stashed to sessionStorage first (see lib/sensitive-session-store.ts)
// so an ordinary page refresh — still this same browser tab — can restore it via applyState below.
function redactSensitiveValues(itemId: string, values: Record<string, string>): Record<string, string> {
  const sensitiveNames = findComplianceItem(itemId)?.fields.filter((f) => f.sensitive).map((f) => f.name) ?? []
  if (sensitiveNames.length === 0) return values
  stashSensitiveValues(itemId, values, sensitiveNames)
  // Skip a field still holding the placeholder (e.g. the real value hasn't been merged back in yet
  // from the server) — saving it would overwrite the actual backup with the placeholder text itself.
  for (const name of sensitiveNames)
    if (values[name] && values[name] !== SENSITIVE_FIELD_PLACEHOLDER) saveSensitiveValueToServer(itemId, name, values[name])
  const redacted = { ...values }
  for (const name of sensitiveNames) if (redacted[name]) redacted[name] = SENSITIVE_FIELD_PLACEHOLDER
  return redacted
}

// Converts a finished item's live chat transcript into the trimmed, replayable shape stored in
// History — drops interactive-only messages (category chips, field-choice bubbles, the inline
// filing form card) since each of those is always immediately followed by a `user` message
// echoing the answer that was given, so nothing is lost by dropping the interactive widget itself.
function archiveMessages(messages: ChatMsg[]): ConversationMessage[] {
  const kept: ConversationMessage[] = []
  for (const m of messages) {
    if (m.role === "bot" || m.role === "user" || m.role === "note") kept.push(m)
    else if (m.role === "docDrafted") kept.push({ id: m.id, role: "docDrafted", groupTitle: m.groupTitle, title: m.item.title })
  }
  return kept
}

export function ComplianceView({
  answers,
  signedDocs,
  onItemComplete,
  onItemDeleted,
  startExpanded = false,
  onGoToLibrary,
}: {
  answers: FlowAnswers
  signedDocs?: Record<string, DocSignature[]>
  onItemComplete?: (doc: LibraryDoc) => void
  onItemDeleted?: (id: string) => void
  startExpanded?: boolean
  onGoToLibrary?: () => void
}) {
  const { user, isSignedIn } = useUser()
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [activeCategory, setActiveCategory] = useState<ComplianceCategory | null>(null)
  const [expandedCategoryId, setExpandedCategoryId] = useState<ComplianceCategory["id"] | null>(null)
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
  const [docs, setDocs] = useState<Record<string, LibraryDoc>>({})
  const [inputMode, setInputMode] = useState<"chat" | "form">("chat")
  const [activeFiling, setActiveFiling] = useState<ActiveFiling | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [infoItem, setInfoItem] = useState<ComplianceItem | null>(null)
  const [history, setHistory] = useState<ConversationEntry[]>([])
  const [viewingConversation, setViewingConversation] = useState<ConversationEntry | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [viewingDoc, setViewingDoc] = useState<{ doc: LibraryDoc; item: ComplianceItem; groupTitle: string } | null>(null)
  const [redoConfirm, setRedoConfirm] = useState<{ item: ComplianceItem; groupTitle: string } | null>(null)
  const [switchConfirm, setSwitchConfirm] = useState<
    | { mode: "restart"; item: ComplianceItem; groupTitle: string }
    | { mode: "abandon"; fromItem: ComplianceItem; item: ComplianceItem; groupTitle: string }
    | null
  >(null)
  const [newChatAbandonConfirm, setNewChatAbandonConfirm] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [value, setValue] = useState("")
  const [infoRequests, setInfoRequests] = useState<InfoRequest[]>([])
  // Messages before this id are collapsed behind "Show earlier messages" (see startNewChat) —
  // nothing is ever deleted, this only affects what's rendered by default.
  const [chatBreakId, setChatBreakId] = useState<number | null>(null)
  const [showEarlier, setShowEarlier] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)
  const startedRef = useRef(false)

  const pushBot = useCallback((text: string) => {
    setMessages((m) => [...m, { id: ++idRef.current, role: "bot", text }])
  }, [])

  // Repeated mode toggling with nothing else happening in between (see requestSetInputMode)
  // shouldn't stack up a growing list of these — replace the trailing note in place instead.
  const pushNote = useCallback((text: string) => {
    setMessages((m) => {
      const last = m[m.length - 1]
      if (last?.role === "note") return [...m.slice(0, -1), { ...last, text }]
      return [...m, { id: ++idRef.current, role: "note", text }]
    })
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

  const applyState = useCallback((saved: CompliancePersisted) => {
    idRef.current = saved.messages.reduce((max, m) => Math.max(max, m.id), 0)
    // A "filing" message's card reads its field values from `activeFiling.values` (restored
    // below), not from re-running prefill — so keeping it here just resumes the in-progress form
    // where the user left it, same as Chat mode already does for its own draft state.
    setMessages(saved.messages)
    const restoredCategory = COMPLIANCE_CATEGORIES.find((c) => c.id === saved.activeCategoryId) ?? null
    setActiveCategory(restoredCategory)
    setExpandedCategoryId(restoredCategory?.id ?? null)
    setCompleted(saved.completed)
    // See lib/sensitive-session-store.ts — restores any sensitive field still stashed in this
    // browser tab's sessionStorage, so a plain refresh doesn't read as the value being lost.
    const rehydratedDocs = Object.fromEntries(Object.entries(saved.docs ?? {}).map(([id, doc]) => [id, rehydrateSensitiveDocValues(doc)]))
    setDocs(rehydratedDocs)
    setHistory(saved.history ?? [])
    setInputMode(saved.inputMode ?? "chat")
    // Restore activeItemId alongside activeFiling below — otherwise the sidebar has no way to
    // know a filing is still open, and clicking a different one skips the abandon-confirmation.
    setActiveItemId(saved.activeItemId)
    // Chat-mode filings, unlike form-mode ones, have no separate draft state to lose on
    // reload — restore them so the flow keeps expecting the next field's answer.
    const activeFilingSensitiveNames = saved.activeFiling?.item.fields.filter((f) => f.sensitive).map((f) => f.name) ?? []
    setActiveFiling(
      saved.activeFiling
        ? { ...saved.activeFiling, values: restoreSensitiveValues(saved.activeFiling.item.id, saved.activeFiling.values, activeFilingSensitiveNames) }
        : null
    )
    setChatBreakId(saved.chatBreakId ?? null)
    setShowEarlier(false)
    // The sessionStorage rehydration above only covers this same browser tab — for a signed-in
    // account, an async follow-up against the encrypted server backup (see
    // lib/sensitive-server-store.ts) covers a return visit on a later day. See the identical
    // pattern (and fuller explanation) in components/incorporation-app.tsx's applyLibraryState.
    if (isSignedIn) {
      for (const doc of Object.values(rehydratedDocs)) {
        if (!docHasSensitiveFields(doc.id)) continue
        mergeServerSensitiveValues(doc).then((merged) => {
          if (merged) setDocs((docs) => ({ ...docs, [merged.id]: merged }))
        })
      }
      if (saved.activeFiling && activeFilingSensitiveNames.length > 0) {
        const itemId = saved.activeFiling.item.id
        loadSensitiveValuesFromServer(itemId).then((fetched) => {
          if (Object.keys(fetched).length === 0) return
          setActiveFiling((f) => (f && f.item.id === itemId ? { ...f, values: { ...f.values, ...fetched } } : f))
        })
      }
    }
  }, [isSignedIn])

  const openPostIncorporation = useCallback(() => {
    const initialCategory = COMPLIANCE_CATEGORIES.find((c) => c.id === "post-incorporation")
    if (initialCategory) {
      setActiveCategory(initialCategory)
      setExpandedCategoryId(initialCategory.id)
    }
  }, [])

  // Arriving straight from incorporation completion (startExpanded) always gets the fresh,
  // descriptive post-incorporation greeting with no category chips — even if a prior visit
  // (e.g. via the nav bar's always-enabled Compliance pill) left a stale generic-greeting
  // session saved. Progress data (completed items, docs, etc.) from that prior session is
  // still preserved; only the chat transcript is replaced.
  const restoreCompliance = useCallback((saved: CompliancePersisted) => {
    if (startExpanded) {
      const name = user?.firstName
      const initialCategory = COMPLIANCE_CATEGORIES.find((c) => c.id === "post-incorporation")
      let nextId = 0
      const freshMessages: ChatMsg[] = [
        {
          id: ++nextId,
          role: "bot",
          text: name
            ? `Hi ${name}, let's get your post-incorporation compliance started.`
            : "Hi! Let's get your post-incorporation compliance started.",
        },
      ]
      if (initialCategory) freshMessages.push({ id: ++nextId, role: "bot", text: initialCategory.chatResponse })
      applyState({ ...saved, messages: freshMessages })
      openPostIncorporation()
      return
    }
    applyState(saved)
  }, [applyState, startExpanded, user, openPostIncorporation])

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const saved = loadPersisted<CompliancePersisted>(STORAGE_KEYS.compliance)
    if (saved && saved.messages.length > 0) {
      restoreCompliance(saved)
      return
    }

    const name = user?.firstName

    if (startExpanded) {
      pushBot(
        name
          ? `Hi ${name}, let's get your post-incorporation compliance started.`
          : "Hi! Let's get your post-incorporation compliance started."
      )
      const initialCategory = COMPLIANCE_CATEGORIES.find((c) => c.id === "post-incorporation")
      if (initialCategory) pushBot(initialCategory.chatResponse)
      openPostIncorporation()
      return
    }

    pushBot(name ? `Hi ${name}! Let's get your compliance started.` : "Hi! Let's get your compliance started.")
    setMessages((m) => [...m, { id: ++idRef.current, role: "categories" }])
  }, [pushBot, user, restoreCompliance, startExpanded, openPostIncorporation])

  // Once signed in, the account's cloud copy (if any) takes over from the local one
  const syncedRef = useRef(false)
  useEffect(() => {
    if (!isSignedIn || syncedRef.current) return
    syncedRef.current = true
    loadFromServer<CompliancePersisted>(STORAGE_KEYS.compliance).then((saved) => {
      if (saved && saved.messages.length > 0) {
        startedRef.current = true
        restoreCompliance(saved)
      }
    })
  }, [isSignedIn, restoreCompliance])

  useEffect(() => {
    if (!startedRef.current) return
    const snapshot: CompliancePersisted = {
      messages,
      activeCategoryId: activeCategory?.id ?? null,
      completed,
      activeItemId,
      docs: Object.fromEntries(Object.entries(docs).map(([id, doc]) => [id, redactSensitiveDocValues(doc)])),
      history,
      inputMode,
      activeFiling: activeFiling
        ? { ...activeFiling, values: redactSensitiveValues(activeFiling.item.id, activeFiling.values) }
        : activeFiling,
      chatBreakId,
    }
    savePersisted<CompliancePersisted>(STORAGE_KEYS.compliance, snapshot)
    if (isSignedIn) saveToServer(STORAGE_KEYS.compliance, snapshot)
  }, [messages, activeCategory, completed, activeItemId, docs, history, inputMode, activeFiling, chatBreakId, isSignedIn])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  // Same polling pattern as incorporation-app.tsx's own copy — see the `InfoRequest` doc comment
  // above for why this component needs an independent poll rather than relying on that one.
  useEffect(() => {
    if (!isSignedIn) return
    const refresh = () =>
      fetch("/api/info-requests")
        .then((r) => r.json())
        .then((data) => setInfoRequests(data.requests ?? []))
        .catch(() => {})
    refresh()
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [isSignedIn])

  // Once a delegated field is fulfilled, pull the real value in and bake it into this component's
  // own copy of the doc — see components/incorporation-app.tsx's identical effect for the fuller
  // explanation of the reveal endpoint and the awaitingThirdParty matching/clearing.
  useEffect(() => {
    for (const req of infoRequests) {
      if (req.status !== "fulfilled") continue
      const doc = docs[req.docId]
      if (!doc || doc.awaitingThirdParty?.fieldName !== req.fieldName) continue
      fetch(`/api/info-requests/${req.id}/reveal`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { value?: string } | null) => {
          if (!data?.value) return
          setDocs((docs) => {
            const d = docs[req.docId]
            if (!d || d.awaitingThirdParty?.fieldName !== req.fieldName) return docs
            const values = { ...d.values, [req.fieldName]: data.value! }
            return {
              ...docs,
              [req.docId]: { ...d, values, content: renderComplianceDocument(d.id, values) ?? d.content, awaitingThirdParty: undefined },
            }
          })
        })
        .catch(() => {})
    }
  }, [infoRequests, docs])

  const selectCategory = useCallback((cat: ComplianceCategory) => {
    pushUser(cat.label)
    pushBot(cat.chatResponse)
    setActiveCategory(cat)
    setExpandedCategoryId(cat.id)
  }, [pushBot, pushUser])

  const toggleCategory = useCallback((cat: ComplianceCategory) => {
    setExpandedCategoryId((id) => (id === cat.id ? null : cat.id))
  }, [])

  const fieldPrompt = (f: ComplianceField) => {
    const optionalHint = f.optional ? " (optional)" : ""
    return `${f.question ?? f.label}${optionalHint}${f.hint ? ` — ${f.hint}` : ""}`
  }

  // Whether `name` is (loosely) the account holder themself, vs. e.g. a co-founder named on a
  // `delegatable` field — compared against the same value that field already defaults to via its
  // own `prefillKey`, so this matches the app's existing notion of "you" rather than introducing
  // a new, stricter one.
  const isAccountHolder = (name: string) => name.trim().toLowerCase() === (answers.incorporatorName ?? "").trim().toLowerCase()

  // Which name, if any, a `delegatable` field's real value should be collected from instead of
  // asking here — null both when the field isn't delegatable and when the named person *is* the
  // account holder (the normal in-chat question still applies in that case).
  const delegateRecipient = (field: ComplianceField, values: Record<string, string>): string | null => {
    if (!field.delegatable) return null
    const name = values[field.delegatable.nameField]?.trim()
    if (!name || isAccountHolder(name)) return null
    return name
  }

  const modeLabel = (m: "chat" | "form") => (m === "chat" ? "Chat" : "Questionnaire")

  const prefill = (field?: ComplianceField): string => prefillValue(answers, docs, field)

  // Asks for one field in a chat-mode filing. A fixed option set (select) always gets a
  // clickable choice bubble, and a date gets a calendar picker — unless we already have the
  // answer from elsewhere (e.g. the vesting start date set earlier in onboarding), in which
  // case it's treated like any other prefillable value: dropped straight into the chat input
  // as text so accepting it is just hitting Enter, same as text/textarea fields.
  // The message promptField pushes for `field` — either the normal question, or (if delegated to
  // someone else) the email-request instead. Used both to actually ask, and by reinitFilingForMode
  // to tell whether that exact prompt is already the most recent thing shown.
  const expectedFieldPrompt = (field: ComplianceField, values: Record<string, string>): string => {
    const delegateTo = delegateRecipient(field, values)
    return delegateTo
      ? `That's not you, so I'll ask ${delegateTo} to enter it directly instead — what's their email address?`
      : fieldPrompt(field)
  }

  const promptField = useCallback(async (item: ComplianceItem, groupTitle: string, fieldIndex: number, values: Record<string, string>, addChoices = true) => {
    const field = item.fields[fieldIndex]
    const delegateTo = delegateRecipient(field, values)
    if (delegateTo) {
      await pushBotTyped(expectedFieldPrompt(field, values))
      setValue("")
      return
    }
    await pushBotTyped(fieldPrompt(field))
    const prefilled = prefillValue(answers, docs, field)
    if (field.type === "select" || (field.type === "date" && !prefilled)) {
      if (addChoices) {
        setMessages((m) => [...m, { id: ++idRef.current, role: "fieldChoices", item, groupTitle, fieldIndex }])
      }
    } else {
      setValue(prefilled)
    }
  }, [pushBotTyped, answers, docs])

  const handleFilingComplete = useCallback((item: ComplianceItem, groupTitle: string, values: Record<string, string>, pendingDelegations?: PendingDelegation[], lastUserText?: string) => {
    const completedAt = new Date().toISOString()
    const doc: LibraryDoc = {
      id: item.id,
      title: item.title,
      subtitle: groupTitle,
      content: renderComplianceDocument(item.id, values) ?? undefined,
      values,
      createdAt: completedAt,
      awaitingThirdParty: pendingDelegations?.[0],
    }
    // The last field's answer arrives as `lastUserText` instead of already being in `messages` —
    // the caller reaches this synchronously right after calling pushUser for it, so that
    // setMessages update hasn't landed in this callback's `messages` closure yet. Appending it
    // here, atomically with the drafted-card message, keeps it from being dropped from history.
    const lastUserMsg: ChatMsg | null = lastUserText != null ? { id: ++idRef.current, role: "user", text: lastUserText } : null
    const docDraftedMsg: ChatMsg = { id: ++idRef.current, role: "docDrafted", item, groupTitle }
    const trailingMessages = lastUserMsg ? [lastUserMsg, docDraftedMsg] : [docDraftedMsg]
    const entry: ConversationEntry = {
      id: item.id,
      itemId: item.id,
      title: item.title,
      groupTitle,
      completedAt,
      messages: archiveMessages([...messages, ...trailingMessages]),
    }
    setCompleted((c) => ({ ...c, [item.id]: true }))
    setDocs((d) => ({ ...d, [item.id]: doc }))
    setHistory((h) => [entry, ...h.filter((e) => e.itemId !== item.id)])
    setActiveItemId(null)
    // The finished conversation (with its Drafted card) stays on screen — it's only cleared
    // once a new filing is opened (see the reset at the top of openItem below), not immediately.
    // It's already archived into `history` above regardless.
    setMessages((m) => [
      ...m,
      ...trailingMessages,
      { id: ++idRef.current, role: "bot", text: "Select another filing from the right to continue, or ask me anything." },
    ])
    onItemComplete?.(doc)
  }, [messages, onItemComplete])

  const openItem = useCallback((item: ComplianceItem, groupTitle: string) => {
    setMessages([])
    pushUser(item.title)
    setActiveItemId(item.id)
    setMobileOpen(false)
    // Values live on activeFiling regardless of mode, so switching Chat/Questionnaire mid-filing
    // can carry over whatever's already been answered instead of losing it (see requestSetInputMode).
    const initialValues = Object.fromEntries(item.fields.map((f) => [f.name, prefill(f)]))
    setActiveFiling({ item, groupTitle, fieldIndex: 0, values: initialValues })
    if (inputMode === "chat") {
      ;(async () => {
        await pushBotTyped(`Let's complete the ${item.title} filing — I'll ask you for each field one at a time. Feel free to ask me anything along the way.`)
        await promptField(item, groupTitle, 0, initialValues)
      })()
    } else {
      pushBot(`Let's complete the ${item.title} filing. Fill out the form below — feel free to ask me any questions as you go.`)
      setMessages((m) => [...m, { id: ++idRef.current, role: "filing", item, groupTitle }])
    }
  }, [pushBot, pushUser, pushBotTyped, promptField, inputMode, prefill])

  // Advances an in-progress filing to `nextIndex`, prompting for it (or finishing the filing) —
  // shared by the normal per-field path and the delegated-field-invite path below, which reach
  // the same next step but arrive with different `nextValues`/`pendingDelegations`.
  const advanceFiling = useCallback((item: ComplianceItem, groupTitle: string, nextIndex: number, nextValues: Record<string, string>, pendingDelegations?: PendingDelegation[], lastUserText?: string) => {
    if (nextIndex < item.fields.length) {
      // Safe to push right away — the next prompt is driven off `nextValues`/`nextIndex`, not
      // the `messages` closure, so there's no race to worry about here (unlike the completion
      // branch below, see handleFilingComplete).
      if (lastUserText != null) pushUser(lastUserText)
      setActiveFiling({ item, groupTitle, fieldIndex: nextIndex, values: nextValues, pendingDelegations })
      ;(async () => {
        await delay(250)
        await promptField(item, groupTitle, nextIndex, nextValues)
      })()
    } else {
      setActiveFiling(null)
      handleFilingComplete(item, groupTitle, nextValues, pendingDelegations, lastUserText)
    }
  }, [promptField, handleFilingComplete, pushUser])

  // Creates the emailed invite for a delegated field's real value, then moves the filing on with
  // a human-readable placeholder standing in for it in the drafted document until it's fulfilled.
  const submitDelegateEmail = useCallback((item: ComplianceItem, groupTitle: string, fieldIndex: number, values: Record<string, string>, pendingDelegations: PendingDelegation[] | undefined, recipientName: string, email: string) => {
    const field = item.fields[fieldIndex]
    ;(async () => {
      const res = await fetch("/api/info-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docId: item.id,
          docTitle: item.title,
          fieldName: field.name,
          fieldLabel: field.label,
          recipientEmail: email,
          recipientName,
          senderCompanyName: answers.companyName,
        }),
      }).catch(() => null)
      if (!res || !res.ok) {
        await pushBotTyped(`I couldn't send that invite — mind trying ${recipientName}'s email again?`)
        return
      }
      await pushBotTyped(`Sent — ${recipientName} will get a private link to enter it directly, without going through you.`)
      const nextValues = { ...values, [field.name]: delegatedFieldPlaceholder(recipientName) }
      const nextPending = [...(pendingDelegations ?? []), { fieldName: field.name, fieldLabel: field.label, recipientName }]
      advanceFiling(item, groupTitle, fieldIndex + 1, nextValues, nextPending)
    })()
  }, [answers, pushBotTyped, advanceFiling])

  const submitFieldAnswer = useCallback((raw: string) => {
    if (!activeFiling || inputMode !== "chat") return
    const { item, groupTitle, fieldIndex, values, pendingDelegations } = activeFiling
    const field = item.fields[fieldIndex]
    const val = raw.trim()
    const delegateTo = delegateRecipient(field, values)

    if (delegateTo) {
      if (!val) return
      pushUser(val)
      if (!isValidEmail(val)) {
        void pushBotTyped(`That doesn't look like a valid email — what's ${delegateTo}'s email address?`)
        return
      }
      submitDelegateEmail(item, groupTitle, fieldIndex, values, pendingDelegations, delegateTo, val)
      return
    }

    if (!field.optional && !val) return
    const answerText = val ? (field.sensitive ? "•".repeat(val.length) : val) : "Skipped"
    const nextValues = { ...values, [field.name]: val }
    advanceFiling(item, groupTitle, fieldIndex + 1, nextValues, pendingDelegations, answerText)
  }, [activeFiling, inputMode, pushUser, pushBotTyped, submitDelegateEmail, advanceFiling])

  const handleSend = useCallback(() => {
    const text = value.trim()
    const chatFieldActive = !!activeFiling && inputMode === "chat"
    const activeField = chatFieldActive ? activeFiling!.item.fields[activeFiling!.fieldIndex] : undefined

    if (!text) {
      // Nothing typed: the only valid send is skipping an optional field.
      if (chatFieldActive && activeField?.optional) submitFieldAnswer("")
      return
    }
    setValue("")

    if (chatFieldActive && !looksLikeQuestion(text)) {
      submitFieldAnswer(text)
      return
    }

    pushUser(text)
    if (chatFieldActive) {
      const { item, groupTitle, fieldIndex, values } = activeFiling!
      const field = item.fields[fieldIndex]
      ;(async () => {
        await pushBotTyped(field.tooltip ?? field.hint ?? item.explainer ?? item.description)
        // The choice bubble for this field (if any) is still live from before — don't duplicate it.
        await promptField(item, groupTitle, fieldIndex, values, false)
      })()
    } else {
      pushBot("Happy to help. Feel free to fill out the form above or click any item in Compliance Documents to get started.")
    }
  }, [value, activeFiling, inputMode, pushUser, pushBot, pushBotTyped, promptField, submitFieldAnswer])

  const allItems = COMPLIANCE_CATEGORIES.flatMap((c) => c.groups.flatMap((g) => g.items))
  const doneCount = allItems.filter((i) => completed[i.id]).length
  const total = allItems.length

  // Guard against accidentally interrupting a filing that's already open: re-clicking the
  // same in-progress item asks to restart it, clicking a different one asks to abandon it.
  const requestOpenItem = useCallback((item: ComplianceItem, groupTitle: string) => {
    if (!activeItemId) return openItem(item, groupTitle)
    if (activeItemId === item.id) {
      setSwitchConfirm({ mode: "restart", item, groupTitle })
      return
    }
    const fromItem = allItems.find((i) => i.id === activeItemId)
    if (!fromItem) return openItem(item, groupTitle)
    setSwitchConfirm({ mode: "abandon", fromItem, item, groupTitle })
  }, [activeItemId, allItems, openItem])

  // Re-renders the in-progress filing's current question under a newly selected mode, without
  // losing what's already been answered — mirrors incorporation-app.tsx's `reinitStepForMode`.
  // Questionnaire mode shows the full form card (creating it the first time, pre-filled with
  // whatever chat has collected so far); chat mode resumes at the first still-empty field.
  const reinitFilingForMode = useCallback((mode: "chat" | "form") => {
    if (!activeFiling) return
    const { item, groupTitle, values } = activeFiling
    if (mode === "form") {
      setMessages((m) =>
        m.some((msg) => msg.role === "filing" && msg.item.id === item.id)
          ? m
          : [...m, { id: ++idRef.current, role: "filing", item, groupTitle }]
      )
      return
    }
    const nextEmpty = item.fields.findIndex((f) => !f.optional && !values[f.name]?.trim())
    const fieldIndex = nextEmpty === -1 ? item.fields.length - 1 : nextEmpty
    setActiveFiling({ item, groupTitle, fieldIndex, values })
    // Only skip asking if this field's prompt is already the most recent bot message — i.e. we're
    // resuming exactly where chat left off (repeated toggling with nothing else happening in
    // between). If anything else has happened since (a field got filled via the form, etc.), the
    // question needs to be shown again even if its exact text appeared earlier for a different
    // field-visit — otherwise the chat view can look stuck on a stale question after a switch.
    const lastBotText = [...messages].reverse().find((m) => m.role === "bot")?.text
    if (lastBotText !== expectedFieldPrompt(item.fields[fieldIndex], values)) promptField(item, groupTitle, fieldIndex, values)
  }, [activeFiling, promptField, messages])

  // Switching Chat/Questionnaire mode mid-filing keeps the same filing open — nothing is lost,
  // so this just swaps which mode renders the current question (see reinitFilingForMode).
  const requestSetInputMode = useCallback((target: "chat" | "form") => {
    if (target === inputMode) return
    setInputMode(target)
    pushNote(`Switched from ${modeLabel(inputMode)} mode to ${modeLabel(target)} mode.`)
    reinitFilingForMode(target)
  }, [inputMode, pushNote, reinitFilingForMode])

  const openDoc = useCallback((doc: LibraryDoc, item: ComplianceItem, groupTitle: string) => {
    setViewingDoc({ doc: withDocSignatures(doc, signedDocs?.[doc.id] ?? [], answers), item, groupTitle })
  }, [signedDocs, answers])

  // Non-destructive: collapses everything said so far behind "Show earlier messages" rather than
  // deleting it — progress, docs, and history are untouched.
  const startNewChat = useCallback(() => {
    setChatBreakId(idRef.current)
    setShowEarlier(false)
    pushBot("Started a new chat — pick an item from Compliance Documents to continue, or ask me anything.")
  }, [pushBot])

  // Clicking New Chat mid-filing can't just start fresh underneath the field it's waiting on —
  // it needs to abandon the open filing first, same as switching to a different item does.
  const requestNewChat = useCallback(() => {
    if (activeItemId) {
      setNewChatAbandonConfirm(true)
      return
    }
    startNewChat()
  }, [activeItemId, startNewChat])

  const sidebarContent = (
    <SidebarContent
      expandedCategoryId={expandedCategoryId}
      completed={completed}
      docs={docs}
      activeItemId={activeItemId}
      onItemClick={requestOpenItem}
      onCategoryClick={toggleCategory}
      onInfoClick={setInfoItem}
      onViewClick={openDoc}
    />
  )

  const historyContent = <HistoryPanelContent history={history} docs={docs} onEntryClick={setViewingConversation} />

  const hiddenMessageCount = chatBreakId != null ? messages.filter((m) => m.id <= chatBreakId).length : 0
  const visibleMessages = chatBreakId != null && !showEarlier ? messages.filter((m) => m.id > chatBreakId) : messages

  // True while the footer is actually collecting a delegate's email address rather than the
  // active field's own value — the field's own type (e.g. "ssn") must not drive the input's
  // constraints in that case, or there'd be no way to type an email into it (see the input below).
  const isDelegatingActiveField =
    inputMode === "chat" && !!activeFiling && !!delegateRecipient(activeFiling.item.fields[activeFiling.fieldIndex], activeFiling.values)

  return (
    <div className="relative flex w-full flex-1 overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* ── Header ── */}
        <div className="relative border-b border-border bg-card/40 px-4 py-4 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="mx-auto flex max-w-2xl flex-1 flex-wrap items-center justify-between gap-3">
              <h1 className="font-serif text-lg font-semibold tracking-tight text-foreground">Compliance Center</h1>
              <div className="inline-flex items-center rounded-full border border-border bg-card p-0.5 text-xs shadow-sm">
                <button
                  onClick={() => requestSetInputMode("chat")}
                  className={cn(
                    "rounded-full px-3 py-1 font-medium transition-colors",
                    inputMode === "chat" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Chat
                </button>
                <button
                  onClick={() => requestSetInputMode("form")}
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
          {/* ── Mobile sidebar triggers — stacked here instead of floating over the chat, so ── */}
          {/*    they never sit on top of the messages. */}
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 flex-col gap-1 sm:hidden">
            <button
              onClick={() => setHistoryOpen(true)}
              aria-label="Open History"
              title="History"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <HistoryIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open Compliance Documents"
              title="Compliance Documents"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ShieldCheck className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Chat — wrapper bounds History's overlay to exactly this area, below the header ── */}
        {/*    and above the input bar; History simply pops over the chat rather than shifting it. */}
        <div className="relative flex-1 overflow-hidden">
          <div ref={scrollRef} className="h-full overflow-y-auto px-4 py-8 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-2xl space-y-4">
              {hiddenMessageCount > 0 && !showEarlier && (
                <button
                  onClick={() => setShowEarlier(true)}
                  className="mx-auto flex w-full max-w-xs items-center gap-2 text-xs text-muted-foreground/70 transition-colors hover:text-foreground"
                >
                  <span className="h-px flex-1 bg-border" />
                  Show {hiddenMessageCount} earlier message{hiddenMessageCount === 1 ? "" : "s"}
                  <span className="h-px flex-1 bg-border" />
                </button>
              )}
              {(() => {
                const shown = visibleMessages.filter((m) => !(m.role === "filing" && completed[m.item.id]))
                const lastBotIndex = shown.reduce((last, mm, idx) => (mm.role === "bot" ? idx : last), -1)
                return shown.map((m, i) => {
                if (m.role === "bot") {
                  return (
                    <BotMessage key={m.id} showIcon={i === lastBotIndex && !isTyping}>
                      {m.text}
                    </BotMessage>
                  )
                }
                if (m.role === "user") return <UserMessage key={m.id}>{m.text}</UserMessage>
                if (m.role === "filing") {
                  return (
                    <FilingFormCard
                      key={m.id}
                      item={m.item}
                      groupTitle={m.groupTitle}
                      answers={answers}
                      values={activeFiling?.item.id === m.item.id ? activeFiling.values : {}}
                      onChange={(name, val) =>
                        setActiveFiling((af) =>
                          af && af.item.id === m.item.id ? { ...af, values: { ...af.values, [name]: val } } : af
                        )
                      }
                      delegateRecipient={delegateRecipient}
                      onComplete={() => {
                        if (activeFiling?.item.id === m.item.id) {
                          handleFilingComplete(m.item, m.groupTitle, activeFiling.values, derivePendingDelegations(m.item, activeFiling.values))
                        }
                      }}
                      onInfoClick={() => setInfoItem(m.item)}
                    />
                  )
                }
                if (m.role === "categories") return (
                  <CategoryPickerBubble key={m.id} disabled={!!activeCategory} onSelect={selectCategory} />
                )
                if (m.role === "fieldChoices") return (
                  <FieldChoicesBubble
                    key={m.id}
                    field={m.item.fields[m.fieldIndex]}
                    active={inputMode === "chat" && !!activeFiling && activeFiling.item.id === m.item.id && activeFiling.fieldIndex === m.fieldIndex}
                    onChoose={(val) => submitFieldAnswer(val)}
                  />
                )
                if (m.role === "note") return (
                  <p key={`${m.id}-${m.text}`} className="animate-note-whoosh text-xs">{m.text}</p>
                )
                if (m.role === "docDrafted") {
                  const doc = docs[m.item.id]
                  return (
                    <DraftedCard
                      key={m.id}
                      groupTitle={m.groupTitle}
                      title={m.item.title}
                      onClick={doc ? () => openDoc(doc, m.item, m.groupTitle) : undefined}
                    />
                  )
                }
                return null
                })
              })()}
              {isTyping && <TypingIndicator />}
            </div>
          </div>

          {/* ── History — icon-only tab that opens as a floating overlay confined to this area ── */}
          <SidebarPanel icon={HistoryIcon} label="History" widthClass="w-44 md:w-48 lg:w-56 2xl:w-60" side="left" bordered={false} defaultCollapsed overlay>
            {historyContent}
          </SidebarPanel>
          <MobileSidebarTab
            icon={HistoryIcon}
            label="History"
            title="Compliance Center"
            hideTrigger
            open={historyOpen}
            onOpenChange={setHistoryOpen}
          >
            {historyContent}
          </MobileSidebarTab>
          {/* ── Mobile minimized tab / drawer (< sm only) — always available; positioned here ── */}
          {/*    (rather than beside the desktop sidebar below) so it sits below the header, not on it. */}
          <MobileSidebarTab
            icon={ShieldCheck}
            label="Compliance Documents"
            title="Compliance Center"
            hideTrigger
            open={mobileOpen}
            onOpenChange={setMobileOpen}
          >
            {sidebarContent}
          </MobileSidebarTab>
        </div>

        {/* ── Input bar ── */}
        <div className="border-t border-border bg-card/80 backdrop-blur px-4 py-4 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-2xl items-end gap-2">
            <button
              onClick={requestNewChat}
              title={activeItemId ? "Start a new chat — this will abandon the filing you're currently working on" : "Start a new chat — your progress and documents are kept"}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 self-stretch rounded-xl border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary hover:text-primary sm:px-3"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New chat</span>
            </button>
            <div className="flex flex-1 items-end gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm">
              {activeFiling && inputMode === "chat" && !isDelegatingActiveField && activeFiling.item.fields[activeFiling.fieldIndex].type === "address" ? (
                <div className="flex-1">
                  <AddressAutocomplete
                    value={value}
                    onChange={setValue}
                    onEnter={handleSend}
                    placeholder="Type your answer, or ask a question…"
                    className="w-full bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60"
                    rows={1}
                  />
                </div>
              ) : (
                <input
                  value={value}
                  inputMode={
                    inputMode === "chat" && !isDelegatingActiveField && activeFiling?.item.fields[activeFiling.fieldIndex].type === "ssn" ? "numeric" : undefined
                  }
                  maxLength={inputMode === "chat" && !isDelegatingActiveField && activeFiling?.item.fields[activeFiling.fieldIndex].type === "ssn" ? 11 : undefined}
                  onChange={(e) => {
                    const raw = e.target.value
                    const activeType = inputMode === "chat" && !isDelegatingActiveField ? activeFiling?.item.fields[activeFiling.fieldIndex].type : undefined
                    if (activeType === "ssn") setValue(formatSsnInput(raw))
                    else setValue(activeType === "number" && !/[a-z]/i.test(raw) ? formatNumberInput(raw) : raw)
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={
                    activeFiling && inputMode === "chat"
                      ? isDelegatingActiveField
                        ? "Their email address…"
                        : activeFiling.item.fields[activeFiling.fieldIndex].optional
                          ? "Type an answer, or press Enter to skip…"
                          : activeFiling.item.fields[activeFiling.fieldIndex].type === "number"
                            ? "Type the amount, or ask a question…"
                            : "Type your answer, or ask a question…"
                      : "Feel free to ask any questions…"
                  }
                  className="flex-1 bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60"
                />
              )}
              <button
                onClick={handleSend}
                disabled={!value.trim() && !(activeFiling && inputMode === "chat" && activeFiling.item.fields[activeFiling.fieldIndex].optional)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
              >
                Send <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Compliance Documents sidebar — always visible ≥ sm, collapsible ── */}
      <SidebarPanel icon={ShieldCheck} label="Compliance Documents" widthClass="w-52 md:w-60 lg:w-72 2xl:w-80">
        {sidebarContent}
      </SidebarPanel>

      {infoItem && (
        <InfoModal
          title={infoItem.title}
          description={
            hasComplianceTemplate(infoItem.id)
              ? (infoItem.explainer ?? infoItem.description)
              : `${infoItem.explainer ?? infoItem.description} This filing isn't available in Vispo yet — we're still building out the template for it. Check back soon, or handle it with a lawyer in the meantime.`
          }
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
          title="Delete and restart this filing?"
          description={`"${redoConfirm.item.title}" has already been completed. This will delete your saved answers and ask the questions again from the start.`}
          confirmLabel="Delete & restart"
          danger
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
            setHistory((h) => h.filter((e) => e.itemId !== item.id))
            onItemDeleted?.(item.id)
            openItem(item, groupTitle)
          }}
          onCancel={() => setRedoConfirm(null)}
        />
      )}
      {viewingConversation && (
        <ConversationViewer
          entry={viewingConversation}
          onClose={() => setViewingConversation(null)}
          onOpenDoc={
            docs[viewingConversation.itemId]
              ? () => {
                  const item = allItems.find((i) => i.id === viewingConversation.itemId)
                  const doc = docs[viewingConversation.itemId]
                  if (item && doc) {
                    setViewingConversation(null)
                    openDoc(doc, item, viewingConversation.groupTitle)
                  }
                }
              : undefined
          }
        />
      )}
      {switchConfirm && (
        <ConfirmModal
          title={
            switchConfirm.mode === "restart"
              ? "Would you like to restart this filing?"
              : "Would you like to abandon the filing you're currently working on?"
          }
          description={
            switchConfirm.mode === "restart"
              ? `You're partway through "${switchConfirm.item.title}". Restarting will erase your progress and start over from the first question.`
              : `You're partway through "${switchConfirm.fromItem.title}". Starting "${switchConfirm.item.title}" now will abandon your progress on it.`
          }
          confirmLabel={switchConfirm.mode === "restart" ? "Restart filing" : "Abandon & switch"}
          danger
          onConfirm={() => {
            const { item, groupTitle } = switchConfirm
            setSwitchConfirm(null)
            openItem(item, groupTitle)
          }}
          onCancel={() => setSwitchConfirm(null)}
        />
      )}
      {newChatAbandonConfirm && activeItemId && (
        <ConfirmModal
          title="Abandon the filing you're currently working on?"
          description={`You're partway through "${allItems.find((i) => i.id === activeItemId)?.title ?? "this filing"}". Starting a new chat now will abandon your progress on it.`}
          confirmLabel="Abandon & start new chat"
          danger
          onConfirm={() => {
            setNewChatAbandonConfirm(false)
            setActiveItemId(null)
            setActiveFiling(null)
            startNewChat()
          }}
          onCancel={() => setNewChatAbandonConfirm(false)}
        />
      )}
    </div>
  )
}

/* ── Category picker bubbles ── */

function CategoryPickerBubble({
  disabled, onSelect,
}: {
  disabled: boolean
  onSelect: (cat: ComplianceCategory) => void
}) {
  return (
    <div className="flex flex-wrap gap-2 pl-12">
      {COMPLIANCE_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat)}
          disabled={disabled}
          className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground shadow-sm transition-colors enabled:hover:border-primary enabled:hover:text-primary disabled:cursor-default disabled:opacity-50"
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}


/* ── Sidebar content ── */

function SidebarContent({
  expandedCategoryId, completed, docs, activeItemId, onItemClick, onCategoryClick, onInfoClick, onViewClick,
}: {
  expandedCategoryId: ComplianceCategory["id"] | null
  completed: Record<string, boolean>
  docs: Record<string, LibraryDoc>
  activeItemId: string | null
  onItemClick: (item: ComplianceItem, groupTitle: string) => void
  onCategoryClick: (cat: ComplianceCategory) => void
  onInfoClick: (item: ComplianceItem) => void
  onViewClick: (doc: LibraryDoc, item: ComplianceItem, groupTitle: string) => void
}) {
  return (
    <>
      <div className="border-b border-border px-4 py-4">
        <h2 className="font-serif text-sm font-semibold text-foreground">Compliance Documents</h2>
        <p className="mt-1 text-xs text-muted-foreground">Pick a category below to see what's next.</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {COMPLIANCE_CATEGORIES.map((cat) => {
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
                <span className="font-serif text-sm font-semibold text-foreground">{cat.label}</span>
                <span className="text-xs font-medium text-muted-foreground">{doneCount}/{total}</span>
              </button>

              {isExpanded && (
                <div className="px-2 pb-3">
                  <div className="mx-2 mb-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
                  </div>
                  {cat.groups.map((group) => (
                    <div key={group.id} className="mb-4 last:mb-0">
                      <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{group.title}</p>
                      <ul className="space-y-0.5">
                        {group.items.map((item) => {
                          const available = hasComplianceTemplate(item.id)
                          const done = !!completed[item.id]
                          const doc = docs[item.id]
                          const viewable = done && !!doc?.content
                          const isActive = activeItemId === item.id
                          const handleClick = () => {
                            if (!available) return
                            if (done && doc) return onViewClick(doc, item, group.title)
                            return onItemClick(item, group.title)
                          }
                          return (
                            <li key={item.id}>
                              <div
                                role="button"
                                tabIndex={available ? 0 : -1}
                                aria-disabled={!available}
                                onClick={handleClick}
                                onKeyDown={(e) => {
                                  if (available && (e.key === "Enter" || e.key === " ")) {
                                    e.preventDefault()
                                    handleClick()
                                  }
                                }}
                                className={cn(
                                  "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors",
                                  !available
                                    ? "cursor-not-allowed opacity-50"
                                    : cn("cursor-pointer", isActive ? "bg-primary/10" : "hover:bg-secondary/60")
                                )}
                              >
                                <span className={cn(
                                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                                  done ? "bg-success text-success-foreground" : "text-muted-foreground/40"
                                )}>
                                  {done ? <Check className="h-3 w-3" strokeWidth={3} /> : <Circle className="h-3.5 w-3.5" />}
                                </span>
                                <div className="min-w-0 flex-1 leading-tight">
                                  <div className="flex items-center gap-1">
                                    <p className="truncate text-[12px] font-medium text-foreground">
                                      {item.title}
                                    </p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onInfoClick(item)
                                      }}
                                      aria-label={`What is ${item.title}?`}
                                      className={cn(infoButtonClass, "shrink-0")}
                                    >
                                      <Info className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                  <p className={cn(
                                    "mt-0.5 flex items-center gap-1 text-[10px]",
                                    viewable ? "text-success font-medium" : "text-muted-foreground"
                                  )}>
                                    <CalendarClock className="h-2.5 w-2.5 shrink-0" />
                                    <span className="truncate">{viewable ? "View document" : item.deadline}</span>
                                  </p>
                                </div>
                                {!available && (
                                  <span
                                    title="This filing isn't available in Vispo yet — we're still building out the template for it."
                                    className="mt-0.5 shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground shadow-sm"
                                  >
                                    Not available yet
                                  </span>
                                )}
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

/* ── History panel content (dedicated left sidebar) ── */

function HistoryPanelContent({
  history, docs, onEntryClick,
}: {
  history: ConversationEntry[]
  docs: Record<string, LibraryDoc>
  onEntryClick: (entry: ConversationEntry) => void
}) {
  return (
    <>
      <div className="border-b border-border px-4 py-4">
        <h2 className="font-serif text-sm font-semibold text-foreground">History</h2>
        <p className="mt-1 text-xs text-muted-foreground">Past conversations from completed filings.</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <p className="px-4 py-4 text-xs text-muted-foreground/70">No completed filings yet.</p>
        ) : (
          <ul className="flex flex-col gap-1 px-2 py-2">
            {history.map((entry) => {
              const inLibrary = Boolean(docs[entry.itemId])
              return (
                <li key={entry.itemId}>
                  <button
                    onClick={() => onEntryClick(entry)}
                    className="flex w-full flex-col items-start gap-0.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-secondary/40"
                  >
                    <p className="text-[12px] font-medium text-foreground">{entry.title}</p>
                    <p className="text-[10px] text-muted-foreground/70">
                      {entry.groupTitle} · {new Date(entry.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <p className={cn(
                      "mt-0.5 flex items-center gap-1 text-[10px]",
                      inLibrary ? "text-success" : "text-destructive"
                    )}>
                      {inLibrary ? <FileCheck2 className="h-2.5 w-2.5 shrink-0" /> : <Trash2 className="h-2.5 w-2.5 shrink-0" />}
                      <span>{inLibrary ? "In Document Library" : "Document deleted"}</span>
                    </p>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </>
  )
}

/* ── Inline filing form card ── */

function FilingFormCard({
  item, groupTitle, answers, values, onChange, delegateRecipient, onComplete, onInfoClick,
}: {
  item: ComplianceItem
  groupTitle: string
  answers: FlowAnswers
  values: Record<string, string>
  onChange: (name: string, val: string) => void
  delegateRecipient: (field: ComplianceField, values: Record<string, string>) => string | null
  onComplete: () => void
  onInfoClick: () => void
}) {
  const [delegateEmails, setDelegateEmails] = useState<Record<string, string>>({})
  const [delegateStatus, setDelegateStatus] = useState<Record<string, "sending" | "sent" | "error">>({})

  const isEmpty = (f: ComplianceField) => !f.optional && !values[f.name]?.trim()
  const remaining = item.fields.filter(isEmpty).length
  const valid = remaining === 0
  const set = (name: string, val: string) => onChange(name, val)
  // A field already carries its delegated placeholder (e.g. the invite was sent in Chat mode
  // before switching to Questionnaire) even though this card's own `delegateStatus` never saw it.
  const isDelegatedFulfilled = (f: ComplianceField) => DELEGATED_PLACEHOLDER_RE.test(values[f.name] ?? "")

  const sendDelegateInvite = async (f: ComplianceField, recipientName: string) => {
    const email = delegateEmails[f.name]?.trim() ?? ""
    if (!isValidEmail(email)) {
      setDelegateStatus((s) => ({ ...s, [f.name]: "error" }))
      return
    }
    setDelegateStatus((s) => ({ ...s, [f.name]: "sending" }))
    try {
      const res = await fetch("/api/info-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docId: item.id,
          docTitle: item.title,
          fieldName: f.name,
          fieldLabel: f.label,
          recipientEmail: email,
          recipientName,
          senderCompanyName: answers.companyName,
        }),
      })
      if (!res.ok) throw new Error("failed")
      set(f.name, delegatedFieldPlaceholder(recipientName))
      setDelegateStatus((s) => ({ ...s, [f.name]: "sent" }))
    } catch {
      setDelegateStatus((s) => ({ ...s, [f.name]: "error" }))
    }
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
        {item.fields.map((f) => {
          const delegateTo = delegateRecipient(f, values)
          const status = delegateStatus[f.name]
          const fulfilled = status === "sent" || isDelegatedFulfilled(f)
          if (delegateTo && !fulfilled) {
            return (
              <div key={f.name}>
                <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-foreground">
                  {f.label}
                  {!f.optional && <span className="text-destructive">*</span>}
                </label>
                <p className="mb-1.5 text-xs text-muted-foreground">
                  That's not you, so we'll ask {delegateTo} to enter it directly — it's never shared with you.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={delegateEmails[f.name] ?? ""}
                    onChange={(e) => setDelegateEmails((d) => ({ ...d, [f.name]: e.target.value }))}
                    placeholder={`${delegateTo}'s email address`}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => sendDelegateInvite(f, delegateTo)}
                    disabled={status === "sending"}
                    className="shrink-0 rounded-lg bg-secondary px-3 py-2.5 text-sm font-medium text-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {status === "sending" ? "Sending…" : "Send invite"}
                  </button>
                </div>
                {status === "error" && (
                  <p className="mt-1.5 text-xs text-destructive">That didn't go through — check the email and try again.</p>
                )}
              </div>
            )
          }
          return (
          <div key={f.name}>
            <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-foreground">
              {f.label}
              {!f.optional && <span className="text-destructive">*</span>}
              {f.tooltip && (
                <span className="group/tip relative flex items-center">
                  <HelpCircle className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
                  <span className="pointer-events-none absolute left-0 top-full z-10 mt-1.5 w-72 rounded-md border border-border bg-popover px-2.5 py-2 text-xs font-normal leading-snug text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover/tip:opacity-100">
                    {f.tooltip}
                  </span>
                </span>
              )}
            </label>
            {delegateTo && fulfilled ? (
              <p className="rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-sm text-muted-foreground">
                Sent — {delegateTo} will enter this directly.
              </p>
            ) : f.type === "select" ? (
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
                inputMode={f.type === "number" ? "decimal" : f.type === "ssn" ? "numeric" : undefined}
                maxLength={f.type === "ssn" ? 11 : undefined}
                value={values[f.name] ?? ""}
                placeholder={f.placeholder}
                onChange={(e) =>
                  set(f.name, f.type === "number" ? formatNumberInput(e.target.value) : f.type === "ssn" ? formatSsnInput(e.target.value) : e.target.value)
                }
                className={inputClass}
              />
            )}
            {f.hint && <p className="mt-1.5 text-xs text-muted-foreground">{f.hint}</p>}
          </div>
          )
        })}
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
          Save filing
        </button>
      </div>
    </div>
  )
}
