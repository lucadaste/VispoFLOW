"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FileText } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { MobileSidebarTab } from "@/components/mobile-sidebar-tab"
import { SidebarPanel } from "@/components/sidebar-panel"
import { TopBar } from "@/components/top-bar"
import { ComplianceView } from "@/components/compliance-view"
import { TransactionsOnboarding } from "@/components/transactions-onboarding"
import { DocumentLibrary, type LibraryDoc, type DocSignature, type PendingSignRequest } from "@/components/document-library"
import { getSignerSlots } from "@/lib/document-signers"
import { primaryOfficerTitle } from "@/lib/signature"
import { Landing } from "@/components/landing"
import { HomeChat } from "@/components/home-chat"
import {
  BotMessage,
  UserMessage,
  SystemNote,
  TypingIndicator,
} from "@/components/chat-message"
import { FormedCard } from "@/components/formed-card"
import { ChatInput } from "@/components/chat-inputs"
import { FieldComposer } from "@/components/field-composer"
import { DocumentTracker, DocumentTrackerEmpty } from "@/components/document-tracker"
import { STEPS, type StepInput } from "@/lib/steps"
import { getChatFields, assembleChatAnswers } from "@/lib/incorporation-chat-fields"
import {
  type DocStatus,
  type FlowAnswers,
  type ChatField,
  initialAnswers,
  docShorts,
  DOCUMENTS,
} from "@/lib/flow"
import { renderDocumentContent } from "@/lib/document-templates"
import {
  loadPersisted,
  savePersisted,
  clearPersisted,
  loadFromServer,
  saveToServer,
  clearFromServer,
} from "@/lib/persist"
import { STORAGE_KEYS } from "@/lib/storage-keys"
import { mergeProfileIntoAnswers, isProfileEmpty } from "@/lib/profile"
import { useProfile } from "@/lib/use-profile"
import { ProfileSettingsModal } from "@/components/profile-settings-modal"
import { SignedOutGate } from "@/components/signed-out-gate"
import { cn } from "@/lib/utils"

/** Shape shared by CompliancePersisted/TransactionsPersisted — the bits Document Library
 *  deletion/restoration needs to keep in sync, even while that flow's own view isn't mounted. */
type FlowPersistedShape = { completed: Record<string, boolean>; docs: Record<string, LibraryDoc> }

function clearItemInPersisted(key: string, id: string) {
  const saved = loadPersisted<FlowPersistedShape>(key)
  if (saved && (saved.completed[id] || saved.docs[id])) {
    delete saved.completed[id]
    delete saved.docs[id]
    savePersisted(key, saved)
  }
}

async function clearItemOnServer(key: string, id: string) {
  const saved = await loadFromServer<FlowPersistedShape>(key)
  if (saved && (saved.completed[id] || saved.docs[id])) {
    delete saved.completed[id]
    delete saved.docs[id]
    saveToServer(key, saved)
  }
}

function restoreItemInPersisted(key: string, doc: LibraryDoc) {
  const saved = loadPersisted<FlowPersistedShape>(key)
  if (saved) {
    saved.completed[doc.id] = true
    saved.docs[doc.id] = doc
    savePersisted(key, saved)
  }
}

async function restoreItemOnServer(key: string, doc: LibraryDoc) {
  const saved = await loadFromServer<FlowPersistedShape>(key)
  if (saved) {
    saved.completed[doc.id] = true
    saved.docs[doc.id] = doc
    saveToServer(key, saved)
  }
}

type ChatMessage =
  | { id: number; role: "bot"; text: string }
  | { id: number; role: "user"; text: string }
  | { id: number; role: "system"; text: string; variant: "doc" | "filing" }
  | { id: number; role: "widget"; widget: "formed" }

type ActiveChatFields = {
  input: StepInput
  fields: ChatField[]
  fieldIndex: number
  values: Record<string, string>
}

type IncorporationPersisted = {
  messages: ChatMessage[]
  docStatuses: Record<string, DocStatus>
  answers: FlowAnswers
  activeStepIndex: number
  activeInput: StepInput | null
  activeChatFields?: ActiveChatFields | null
  inputMode?: "chat" | "form"
}

type SignRequest = {
  id: string
  docId: string
  recipientEmail: string
  recipientName: string | null
  slotId: string | null
  slotLabel: string | null
  status: "sent" | "viewed" | "signed"
  signerName: string | null
  signatureDataUrl: string | null
  signedAt: string | null
}

type LibraryPersisted = {
  complianceDocs: LibraryDoc[]
  transactionDocs: LibraryDoc[]
  hiddenDocIds: Record<string, true>
  signedDocs: Record<string, DocSignature[]>
}

/** signedDocs used to store one signature stamp per doc directly (not an array) — accounts with
 *  documents signed before multi-signer support still have that shape saved. Wrap it as the
 *  officer slot's entry so old data keeps rendering instead of crashing the array-based code. */
function normalizeSignedDocs(raw: unknown): Record<string, DocSignature[]> {
  if (!raw || typeof raw !== "object") return {}
  const result: Record<string, DocSignature[]> = {}
  for (const [docId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      result[docId] = value as DocSignature[]
      continue
    }
    if (value && typeof value === "object" && "signatureDataUrl" in value && "signerName" in value) {
      const old = value as { signatureDataUrl: string; signerName: string; signerRoles?: string[]; signedAt: string }
      result[docId] = [{
        slotId: "officer",
        slotLabel: "Company officer",
        signatureDataUrl: old.signatureDataUrl,
        signerName: old.signerName,
        signedAt: old.signedAt,
        officerTitle: old.signerRoles ? primaryOfficerTitle(old.signerRoles) ?? undefined : undefined,
      }]
    }
  }
  return result
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
const typingTime = (text: string) => Math.min(1300, Math.max(550, text.length * 16))

export function IncorporationApp() {
  const { user, isSignedIn } = useUser()
  const { profile, setProfile } = useProfile()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [docStatuses, setDocStatuses] = useState<Record<string, DocStatus>>({})
  const [answers, setAnswers] = useState<FlowAnswers>(initialAnswers)
  const effectiveAnswers = profile.autofillEnabled ? mergeProfileIntoAnswers(answers, profile) : answers
  const [activeInput, setActiveInput] = useState<StepInput | null>(null)
  const [activeChatFields, setActiveChatFields] = useState<ActiveChatFields | null>(null)
  const [inputMode, setInputMode] = useState<"chat" | "form">("chat")
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0)
  const [isTyping, setIsTyping] = useState(false)
  const [mobileDocsOpen, setMobileDocsOpen] = useState(false)
  type View = "landing" | "home-chat" | "chat" | "compliance" | "transactions" | "documents"
  const VALID_VIEWS: View[] = ["landing", "home-chat", "chat", "compliance", "transactions", "documents"]

  const [view, setView] = useState<View | "loading">("loading")
  const [homeChatSeed, setHomeChatSeed] = useState<string | undefined>()
  const [homeChatKey, setHomeChatKey] = useState(0)
  const [complianceKey, setComplianceKey] = useState(0)
  const [complianceFromFlow, setComplianceFromFlow] = useState(false)
  const [landingKey, setLandingKey] = useState(0)
  const [transactionsKey, setTransactionsKey] = useState(0)
  const [complianceDocs, setComplianceDocs] = useState<LibraryDoc[]>([])
  const [transactionDocs, setTransactionDocs] = useState<LibraryDoc[]>([])
  const [hiddenDocIds, setHiddenDocIds] = useState<Record<string, true>>({})
  const [signedDocs, setSignedDocs] = useState<Record<string, DocSignature[]>>({})
  const [signRequests, setSignRequests] = useState<SignRequest[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  // Gate the "save" effects below on these (state, not refs) so a save can never fire
  // with the pre-load initial values — see the comment on the library save effect.
  const [libraryLoaded, setLibraryLoaded] = useState(false)
  const [libraryServerLoaded, setLibraryServerLoaded] = useState(false)
  const [incorporationHydrated, setIncorporationHydrated] = useState(false)
  const [incorporationServerLoaded, setIncorporationServerLoaded] = useState(false)

  // Restore saved view after mount so there is no SSR flash
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEYS.view) as View | null
      if (saved && VALID_VIEWS.includes(saved)) { setView(saved); return }
    } catch {}
    setView("landing")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (view !== "loading") sessionStorage.setItem(STORAGE_KEYS.view, view)
  }, [view])

  const applyLibraryState = useCallback((saved: LibraryPersisted) => {
    setComplianceDocs(saved.complianceDocs)
    setTransactionDocs(saved.transactionDocs)
    setHiddenDocIds(saved.hiddenDocIds ?? {})
    setSignedDocs(normalizeSignedDocs(saved.signedDocs))
  }, [])

  // Restore the document vault (compliance/transaction docs) after mount
  useEffect(() => {
    const saved = loadPersisted<LibraryPersisted>(STORAGE_KEYS.library)
    if (saved) applyLibraryState(saved)
    setLibraryLoaded(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Once signed in, the account's cloud copy (if any) takes over from the local one
  const librarySyncedRef = useRef(false)
  useEffect(() => {
    if (!isSignedIn || librarySyncedRef.current) return
    librarySyncedRef.current = true
    loadFromServer<LibraryPersisted>(STORAGE_KEYS.library).then((saved) => {
      if (saved) applyLibraryState(saved)
      setLibraryServerLoaded(true)
    })
  }, [isSignedIn, applyLibraryState])

  useEffect(() => {
    // Wait for the initial load (and, if signed in, the server's copy) before saving —
    // otherwise this fires on mount with the empty initial state and can overwrite real
    // data with a blank snapshot before the load above has a chance to land.
    if (!libraryLoaded) return
    if (isSignedIn && !libraryServerLoaded) return
    const snapshot: LibraryPersisted = { complianceDocs, transactionDocs, hiddenDocIds, signedDocs }
    savePersisted<LibraryPersisted>(STORAGE_KEYS.library, snapshot)
    if (isSignedIn) saveToServer(STORAGE_KEYS.library, snapshot)
  }, [complianceDocs, transactionDocs, hiddenDocIds, signedDocs, isSignedIn, libraryLoaded, libraryServerLoaded])

  // Refresh outstanding "sent to sign" requests whenever the Doc Library is open, so a
  // document signed elsewhere (by the recipient) shows up without a manual reload.
  useEffect(() => {
    if (!isSignedIn || view !== "documents") return
    fetch("/api/sign-requests")
      .then((r) => r.json())
      .then((data) => setSignRequests(data.requests ?? []))
      .catch(() => {})
  }, [isSignedIn, view])

  // Once a sent-out request comes back signed, fold it into signedDocs exactly like a
  // self-signed doc so downloads/rendering treat it the same way. Requests created before
  // multi-signer support have no slotId — treat those as the default officer slot.
  useEffect(() => {
    for (const req of signRequests) {
      if (req.status !== "signed" || !req.signerName || !req.signatureDataUrl || !req.signedAt) continue
      const slotId = req.slotId ?? "officer"
      const slotLabel = req.slotLabel ?? "Company officer"
      const existing = signedDocs[req.docId] ?? []
      if (existing.some((s) => s.slotId === slotId && s.signedAt === req.signedAt)) continue
      const newSig: DocSignature = {
        slotId,
        slotLabel,
        signatureDataUrl: req.signatureDataUrl,
        signerName: req.signerName,
        signedAt: req.signedAt,
      }
      setSignedDocs((docs) => ({
        ...docs,
        [req.docId]: [...(docs[req.docId] ?? []).filter((s) => s.slotId !== slotId), newSig],
      }))
    }
  }, [signRequests, signedDocs])

  const pendingSignRequestsByDocId = useMemo(() => {
    const map: Record<string, PendingSignRequest[]> = {}
    for (const req of signRequests) {
      if (req.status === "signed") continue
      const entry: PendingSignRequest = {
        slotLabel: req.slotLabel ?? "Company officer",
        recipientEmail: req.recipientEmail,
        recipientName: req.recipientName,
      }
      map[req.docId] = [...(map[req.docId] ?? []), entry]
    }
    return map
  }, [signRequests])

  const handleSendToSign = useCallback(
    async (
      doc: LibraryDoc,
      payload: { recipientEmail: string; recipientName?: string; slotId: string; slotLabel: string; lockedName?: string },
    ) => {
      const res = await fetch("/api/sign-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docId: doc.id,
          docTitle: doc.title,
          docContent: doc.content ?? "",
          recipientEmail: payload.recipientEmail,
          recipientName: payload.recipientName,
          senderCompanyName: effectiveAnswers.companyName,
          slotId: payload.slotId,
          slotLabel: payload.slotLabel,
          lockedName: payload.lockedName,
        }),
      })
      if (res.ok) {
        const { request } = await res.json()
        setSignRequests((reqs) => [...reqs, request])
      }
    },
    [effectiveAnswers.companyName],
  )

  // "Redo" a signature: drop it locally, and if it came from an emailed sign request, delete
  // that request server-side too — otherwise the next reconciliation pass would just restore it.
  const handleRemoveSignature = useCallback(
    (doc: LibraryDoc, slotId: string) => {
      setSignedDocs((docs) => ({
        ...docs,
        [doc.id]: (docs[doc.id] ?? []).filter((s) => s.slotId !== slotId),
      }))
      const matchingRequest = signRequests.find(
        (r) => r.docId === doc.id && (r.slotId ?? "officer") === slotId && r.status === "signed",
      )
      if (matchingRequest) {
        setSignRequests((reqs) => reqs.filter((r) => r.id !== matchingRequest.id))
        fetch(`/api/sign-requests/${matchingRequest.id}`, { method: "DELETE" }).catch(() => {})
      }
    },
    [signRequests],
  )

  const handlePhaseClick = (phase: "home" | "chat" | "compliance" | "transactions" | "documents") => {
    if (phase === "home") { setView("landing"); return }
    if (phase === "chat") { setView("chat"); return }
    if (phase === "transactions") { setView("transactions"); return }
    if (phase === "compliance") { setComplianceFromFlow(false); setView("compliance"); return }
    if (phase === "documents") { setView("documents"); return }
  }

  const handleComplianceDocComplete = useCallback((doc: LibraryDoc) => {
    setComplianceDocs((docs) => (docs.some((d) => d.id === doc.id) ? docs.map((d) => (d.id === doc.id ? doc : d)) : [...docs, doc]))
    setHiddenDocIds((ids) => {
      if (!ids[doc.id]) return ids
      const next = { ...ids }
      delete next[doc.id]
      return next
    })
  }, [])

  // "Delete & restart" from the sidebar preview: remove the old doc (and any signature/hidden
  // state tied to it) right away, rather than waiting for the redo to finish and overwrite it.
  const handleComplianceDocDeleted = useCallback((id: string) => {
    setComplianceDocs((docs) => docs.filter((d) => d.id !== id))
    setSignedDocs((docs) => {
      if (!docs[id]) return docs
      const next = { ...docs }
      delete next[id]
      return next
    })
    setHiddenDocIds((ids) => {
      if (!ids[id]) return ids
      const next = { ...ids }
      delete next[id]
      return next
    })
  }, [])

  // Deleting from the Document Library only hides the doc there (restorable) — but the
  // Compliance/Transactions flow that produced it isn't mounted right now, so its own
  // "completed" record has to be patched directly in storage or it'll still show as done
  // next time that flow is opened. Restoring undoes exactly this.
  const flowStorageKeyFor = useCallback((id: string): string | null => {
    if (complianceDocs.some((d) => d.id === id)) return STORAGE_KEYS.compliance
    if (transactionDocs.some((d) => d.id === id)) return STORAGE_KEYS.transactions
    return null
  }, [complianceDocs, transactionDocs])

  const handleDeleteLibraryDoc = useCallback((doc: LibraryDoc) => {
    setHiddenDocIds((ids) => ({ ...ids, [doc.id]: true }))
    const key = flowStorageKeyFor(doc.id)
    if (key) {
      clearItemInPersisted(key, doc.id)
      if (isSignedIn) clearItemOnServer(key, doc.id)
    }
  }, [flowStorageKeyFor, isSignedIn])

  const handleRestoreLibraryDoc = useCallback((doc: LibraryDoc) => {
    setHiddenDocIds((ids) => {
      const next = { ...ids }
      delete next[doc.id]
      return next
    })
    const key = flowStorageKeyFor(doc.id)
    if (key) {
      restoreItemInPersisted(key, doc)
      if (isSignedIn) restoreItemOnServer(key, doc)
    }
  }, [flowStorageKeyFor, isSignedIn])

  const handleSignLibraryDoc = useCallback(
    (doc: LibraryDoc, signature: { signatureDataUrl: string; signerName: string; roles?: string[]; slotId?: string; slotLabel?: string }) => {
      const slotId = signature.slotId ?? "officer"
      const slot = getSignerSlots(doc.id, effectiveAnswers, doc.values).find((s) => s.id === slotId)
      // The ad-hoc "type/draw a signature" path (used when no saved profile signature exists yet)
      // doesn't collect roles. If the typed name matches the account holder, fall back to their
      // saved profile roles so the company execution block still gets filled in correctly.
      const roles =
        signature.roles ??
        (signature.signerName.trim().toLowerCase() === profile.signerName.trim().toLowerCase() ? profile.roles : undefined)
      const newSig: DocSignature = {
        slotId,
        slotLabel: signature.slotLabel ?? slot?.label ?? "Company officer",
        signatureDataUrl: signature.signatureDataUrl,
        signerName: signature.signerName,
        signedAt: new Date().toISOString(),
        officerTitle: slot?.kind === "officer" ? primaryOfficerTitle(roles ?? []) ?? undefined : undefined,
      }
      setSignedDocs((docs) => ({
        ...docs,
        [doc.id]: [...(docs[doc.id] ?? []).filter((s) => s.slotId !== slotId), newSig],
      }))
    },
    [profile.signerName, profile.roles, effectiveAnswers],
  )

  const handleTransactionDocReady = useCallback((doc: LibraryDoc) => {
    setTransactionDocs((docs) => (docs.some((d) => d.id === doc.id) ? docs.map((d) => (d.id === doc.id ? doc : d)) : [...docs, doc]))
    setHiddenDocIds((ids) => {
      if (!ids[doc.id]) return ids
      const next = { ...ids }
      delete next[doc.id]
      return next
    })
  }, [])

  // "Delete & restart" from the sidebar preview: remove the old doc (and any signature/hidden
  // state tied to it) right away, rather than waiting for the redo to finish and overwrite it.
  const handleTransactionDocDeleted = useCallback((id: string) => {
    setTransactionDocs((docs) => docs.filter((d) => d.id !== id))
    setSignedDocs((docs) => {
      if (!docs[id]) return docs
      const next = { ...docs }
      delete next[id]
      return next
    })
    setHiddenDocIds((ids) => {
      if (!ids[id]) return ids
      const next = { ...ids }
      delete next[id]
      return next
    })
  }, [])

  const handleLandingSelect = (
    path: "formation" | "compliance" | "transactions" | "documents" | "questions",
    message?: string,
  ) => {
    if (path === "compliance") { setComplianceFromFlow(false); setView("compliance"); return }
    if (path === "transactions") { setView("transactions"); return }
    if (path === "documents") { setView("documents"); return }
    if (path === "questions") {
      setHomeChatSeed(message)
      setView("home-chat")
      return
    }
    setView("chat")
  }

  const resolveMessage = useCallback((text: string) => {
    if (text === "__GREETING__") {
      return user?.firstName
        ? `Let's get started incorporating your startup as a Delaware Corporation, ${user.firstName}! I'll ask you a few quick questions — feel free to stop and ask anything along the way.`
        : "Let's get started incorporating your startup as a Delaware Corporation! I'll ask you a few quick questions — feel free to stop and ask anything along the way."
    }
    return text
  }, [user])

  const idRef = useRef(0)
  const startedRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const answersRef = useRef(answers)
  answersRef.current = answers
  const effectiveAnswersRef = useRef(effectiveAnswers)
  effectiveAnswersRef.current = effectiveAnswers

  const nextId = () => ++idRef.current

  const pushBot = useCallback(async (text: string) => {
    const resolved = resolveMessage(text)
    setIsTyping(true)
    await delay(typingTime(resolved))
    setIsTyping(false)
    setMessages((m) => [...m, { id: nextId(), role: "bot", text: resolved }])
    await delay(260)
  }, [resolveMessage])

  const pushUser = useCallback((text: string) => {
    setMessages((m) => [...m, { id: nextId(), role: "user", text }])
  }, [])

  const chatFieldPrompt = (f: ChatField) =>
    `${f.label}${f.optional ? " (optional)" : ""}${f.hint ? ` — ${f.hint}` : ""}`

  const animateDocs = useCallback(async (ids: string[]) => {
    setDocStatuses((s) => {
      const next = { ...s }
      ids.forEach((id) => (next[id] = "drafting"))
      return next
    })
    await delay(1250)
    setDocStatuses((s) => {
      const next = { ...s }
      ids.forEach((id) => (next[id] = "complete"))
      return next
    })
    setMessages((m) => [
      ...m,
      { id: nextId(), role: "system", text: `Drafted ${docShorts(ids)}`, variant: "doc" },
    ])
    await delay(400)
  }, [])

  const handleSendToDelaware = useCallback((doc: LibraryDoc) => {
    setDocStatuses((s) => ({ ...s, [doc.id]: "filing" }))
    setMessages((m) => [
      ...m,
      { id: nextId(), role: "system", text: "Certificate of Incorporation sent to Delaware", variant: "filing" },
    ])
  }, [])

  const handleConfirmFiled = useCallback((doc: LibraryDoc) => {
    setDocStatuses((s) => ({ ...s, [doc.id]: "filed" }))
    setMessages((m) => [
      ...m,
      { id: nextId(), role: "system", text: "Certificate of Incorporation filed with Delaware", variant: "doc" },
    ])
  }, [])

  const playStep = useCallback(
    async (index: number) => {
      const step = STEPS[index]
      if (!step) return
      setActiveStepIndex(index)
      setActiveInput(null)
      setActiveChatFields(null)

      for (const msg of step.messages) {
        await pushBot(msg)
      }

      if (step.widget === "formed") {
        setMessages((m) => [...m, { id: nextId(), role: "widget", widget: "formed" }])
        await delay(400)
      }

      if (step.input && !step.autoAdvance) {
        const decomposed = inputMode === "chat" ? getChatFields(step.input, effectiveAnswersRef.current) : null
        if (decomposed) {
          setActiveChatFields({ input: step.input, fields: decomposed.fields, fieldIndex: 0, values: decomposed.defaults })
          if (!decomposed.skipFirstPrompt) {
            await pushBot(chatFieldPrompt(decomposed.fields[0]))
          }
        } else {
          setActiveInput(step.input)
        }
      } else if (step.autoAdvance) {
        await playStep(index + 1)
      }
    },
    [pushBot, inputMode],
  )

  const applyIncorporationState = useCallback((saved: IncorporationPersisted) => {
    idRef.current = saved.messages.reduce((max, m) => Math.max(max, m.id), 0)
    setMessages(saved.messages)
    setDocStatuses(saved.docStatuses)
    setAnswers({ ...initialAnswers, ...saved.answers })
    setActiveStepIndex(saved.activeStepIndex)
    setActiveInput(saved.activeInput)
    setActiveChatFields(saved.activeChatFields ?? null)
    setInputMode(saved.inputMode ?? "chat")
  }, [])

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const saved = loadPersisted<IncorporationPersisted>(STORAGE_KEYS.incorporation)
    if (saved && saved.messages.length > 0) {
      applyIncorporationState(saved)
      setIncorporationHydrated(true)
      return
    }

    playStep(0)
    setIncorporationHydrated(true)
  }, [playStep, applyIncorporationState])

  // Once signed in, the account's cloud copy (if any) takes over from the local one
  const incorporationSyncedRef = useRef(false)
  useEffect(() => {
    if (!isSignedIn || incorporationSyncedRef.current) return
    incorporationSyncedRef.current = true
    loadFromServer<IncorporationPersisted>(STORAGE_KEYS.incorporation).then((saved) => {
      if (saved && saved.messages.length > 0) {
        startedRef.current = true
        applyIncorporationState(saved)
      }
      setIncorporationServerLoaded(true)
    })
  }, [isSignedIn, applyIncorporationState])

  useEffect(() => {
    // startedRef alone isn't a safe gate here: restartFormation flips it back to true
    // synchronously (by design, so incremental saves resume during the restart replay),
    // but on the very first mount it's flipped true by the load effect above in the same
    // commit this effect runs in — so without incorporationHydrated this would still fire
    // once with the pre-load empty state and clobber whatever was actually saved.
    if (!startedRef.current || !incorporationHydrated) return
    if (isSignedIn && !incorporationServerLoaded) return
    const snapshot: IncorporationPersisted = {
      messages,
      docStatuses,
      answers,
      activeStepIndex,
      activeInput,
      activeChatFields,
      inputMode,
    }
    savePersisted<IncorporationPersisted>(STORAGE_KEYS.incorporation, snapshot)
    if (isSignedIn) saveToServer(STORAGE_KEYS.incorporation, snapshot)
  }, [
    messages,
    docStatuses,
    answers,
    activeStepIndex,
    activeInput,
    activeChatFields,
    inputMode,
    isSignedIn,
    incorporationHydrated,
    incorporationServerLoaded,
  ])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, isTyping, activeInput, activeChatFields])

  const handleSubmit = useCallback(
    async (displayText: string, patch: Partial<FlowAnswers>) => {
      const step = STEPS[activeStepIndex]
      setActiveInput(null)
      if (Object.keys(patch).length) setAnswers((a) => ({ ...a, ...patch }))
      if (displayText) {
        setMessages((m) => [...m, { id: nextId(), role: "user", text: displayText }])
        await delay(350)
      }

      if (displayText === "I have questions" && step.id === "welcome") {
        await pushBot("Ask me whatever you'd like about the process of legally incorporating your company. When you're ready to begin, click the button below.")
        setActiveInput({ kind: "questions" })
        return
      }

      if (displayText === "I'm ready to begin my incorporation") {
        await playStep(activeStepIndex + 1)
        return
      }

      if (displayText === "It's already taken — let me pick a different name.") {
        await pushBot("No problem — what would you like to try instead?")
        await playStep(STEPS.findIndex((s) => s.id === "company-name"))
        return
      }

      if (displayText === "I'm not sure how to check — I'll skip it for now.") {
        await pushBot(
          "Understood. Just know that if this name turns out to already be taken, Delaware will reject your Certificate of Incorporation when it's filed — you'd need to refile with a different name, which costs additional time and filing fees. You can still check the name yourself anytime before we file.",
        )
        await playStep(activeStepIndex + 1)
        return
      }

      if (step.completes?.length) {
        await animateDocs(step.completes)
      }

      if (step.id === "vesting" && patch.vestingUsesEarlierDate) {
        await pushBot(`Thanks for providing an earlier vesting start date of ${patch.vestingStartDate}.`)
      }

      if (step.input?.kind === "continue" && step.input.action === "compliance") {
        if (displayText) {
          await pushBot("Happy to help with any questions — whenever you're ready, click \"Continue to Compliance Center\" to move on.")
          setActiveInput(step.input)
          return
        }
        await pushBot("Now let's head to the Compliance Center to complete the regulatory filings required for your incorporation.")
        await delay(300)
        setComplianceFromFlow(true)
        setView("compliance")
        return
      }

      await playStep(activeStepIndex + 1)
    },
    [activeStepIndex, animateDocs, playStep, pushBot],
  )

  const handleChatFieldSubmit = useCallback(
    async (raw: string) => {
      if (!activeChatFields) return
      const { input, fields, fieldIndex, values } = activeChatFields
      const field = fields[fieldIndex]
      const val = raw.trim()
      if (!field.optional && !val) return
      pushUser(val || "Skipped")
      await delay(250)
      const nextValues = { ...values, [field.name]: val }
      const nextIndex = fieldIndex + 1
      if (nextIndex < fields.length) {
        setActiveChatFields({ input, fields, fieldIndex: nextIndex, values: nextValues })
        await pushBot(chatFieldPrompt(fields[nextIndex]))
      } else {
        setActiveChatFields(null)
        const { patch, note } = assembleChatAnswers(input, nextValues, answersRef.current)
        if (note) await pushBot(note)
        await handleSubmit("", patch)
      }
    },
    [activeChatFields, pushUser, pushBot, handleSubmit],
  )

  const restartFormation = () => {
    startedRef.current = false
    idRef.current = 0
    setMessages([])
    setDocStatuses({})
    setAnswers(initialAnswers)
    setActiveInput(null)
    setActiveChatFields(null)
    setActiveStepIndex(0)
    setIsTyping(false)
    setView("chat")
    setHiddenDocIds((ids) => {
      const next = { ...ids }
      DOCUMENTS.forEach((d) => delete next[d.id])
      return next
    })
    setSignedDocs((docs) => {
      const next = { ...docs }
      DOCUMENTS.forEach((d) => delete next[d.id])
      return next
    })
    clearPersisted(STORAGE_KEYS.incorporation)
    if (isSignedIn) clearFromServer(STORAGE_KEYS.incorporation)
    requestAnimationFrame(() => {
      startedRef.current = true
      playStep(0)
    })
  }

  // Server clears must resolve before the view remounts — otherwise the remounted view's
  // own load-from-server effect can race the DELETE and re-hydrate the state we just reset.
  const handleRestart = async () => {
    if (view === "chat") { restartFormation(); return }
    if (view === "home-chat") {
      clearPersisted(STORAGE_KEYS.homeChat)
      if (isSignedIn) await clearFromServer(STORAGE_KEYS.homeChat)
      setHomeChatSeed(undefined)
      setHomeChatKey((k) => k + 1)
      return
    }
    if (view === "landing") { setLandingKey((k) => k + 1); return }
    if (view === "compliance") {
      setHiddenDocIds((ids) => {
        const next = { ...ids }
        complianceDocs.forEach((d) => delete next[d.id])
        return next
      })
      setSignedDocs((docs) => {
        const next = { ...docs }
        complianceDocs.forEach((d) => delete next[d.id])
        return next
      })
      setComplianceDocs([])
      clearPersisted(STORAGE_KEYS.compliance)
      if (isSignedIn) await clearFromServer(STORAGE_KEYS.compliance)
      setComplianceKey((k) => k + 1)
      return
    }
    if (view === "transactions") {
      setHiddenDocIds((ids) => {
        const next = { ...ids }
        transactionDocs.forEach((d) => delete next[d.id])
        return next
      })
      setSignedDocs((docs) => {
        const next = { ...docs }
        transactionDocs.forEach((d) => delete next[d.id])
        return next
      })
      setTransactionDocs([])
      clearPersisted(STORAGE_KEYS.transactions)
      if (isSignedIn) await clearFromServer(STORAGE_KEYS.transactions)
      setTransactionsKey((k) => k + 1)
      return
    }
  }

  const hasDocs = Object.keys(docStatuses).length > 0
  const docsTotal = DOCUMENTS.length
  const docsCompleted = DOCUMENTS.filter(
    (d) => docStatuses[d.id] === "complete" || docStatuses[d.id] === "filing" || docStatuses[d.id] === "filed",
  ).length

  const restartWarning: string | null =
    view === "chat"
      ? "You'll be sent back to the start of the guided incorporation flow, and any incorporation documents you've generated so far will be removed from My Docs."
      : view === "compliance"
      ? "You'll be sent back to the start of the Compliance Center, and any compliance filings you've completed will be removed from My Docs."
      : view === "transactions"
      ? "You'll be sent back to the start of the Transaction Center, and any transaction documents you've prepared will be removed from My Docs."
      : view === "home-chat"
      ? "Your conversation history in this chat will be cleared."
      : null

  const phase =
    view === "loading" || view === "landing" || view === "home-chat"
      ? "home"
      : view === "compliance"
      ? "compliance"
      : view === "transactions"
      ? "transactions"
      : view === "documents"
      ? "documents"
      : "chat"

  const withSignature = (doc: LibraryDoc): LibraryDoc => {
    const signatures = signedDocs[doc.id] ?? []
    const totalSlots = doc.content ? getSignerSlots(doc.id, effectiveAnswers, doc.values).length : 0
    return { ...doc, signatures, signed: totalSlots > 0 && signatures.length >= totalSlots }
  }

  const incorporationLibraryDocs: LibraryDoc[] = DOCUMENTS.filter(
    (d) => docStatuses[d.id] === "complete" || docStatuses[d.id] === "filing" || docStatuses[d.id] === "filed",
  ).map((d) =>
    withSignature({
      id: d.id,
      title: d.label,
      subtitle: d.group,
      content: renderDocumentContent(d.id, effectiveAnswers) ?? undefined,
      pending: docStatuses[d.id] === "filing",
      filed: docStatuses[d.id] === "filed",
      hidden: !!hiddenDocIds[d.id],
    }),
  )

  const visibleDocsCount =
    incorporationLibraryDocs.filter((d) => !d.hidden).length +
    complianceDocs.filter((d) => !hiddenDocIds[d.id]).length +
    transactionDocs.filter((d) => !hiddenDocIds[d.id]).length

  return (
    <div className="flex h-dvh flex-col bg-background">
      <TopBar
        phase={phase}
        onReset={handleRestart}
        onPhaseClick={handlePhaseClick}
        restartWarning={restartWarning}
        onOpenSettings={() => setSettingsOpen(true)}
        profile={profile}
        onSaveProfile={setProfile}
      />

      {view === "loading" ? null : view === "landing" ? (
        <Landing
          key={landingKey}
          onSelect={handleLandingSelect}
          onOpenProfile={() => setSettingsOpen(true)}
          profileComplete={!isProfileEmpty(profile)}
          incorporationStatus={{ started: hasDocs, completed: docsCompleted, total: docsTotal }}
          complianceCount={complianceDocs.length}
          transactionCount={transactionDocs.length}
          docsCount={visibleDocsCount}
        />
      ) : view === "home-chat" ? (
        <HomeChat
          key={homeChatKey}
          initialMessage={homeChatSeed}
          onStartFormation={() => setView("chat")}
        />
      ) : view === "chat" ? (
        <SignedOutGate>
        <div className="flex w-full flex-1 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="border-b border-border bg-card/40 px-4 py-4 sm:px-8 lg:px-12">
              <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
                <h1 className="text-lg font-semibold tracking-tight text-foreground">Incorporation Center</h1>
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
                  if (m.role === "system")
                    return (
                      <SystemNote key={m.id} variant={m.variant}>
                        {m.text}
                      </SystemNote>
                    )
                  if (m.role === "widget" && m.widget === "formed")
                    return <FormedCard key={m.id} answers={effectiveAnswers} />
                  return null
                })}
                {isTyping && <TypingIndicator />}
              </div>
            </div>

            {(activeInput || activeChatFields) && (
              <div className="border-t border-border bg-white/80 backdrop-blur px-4 py-4 sm:px-8 lg:px-12">
                <div className="mx-auto max-w-2xl">
                  {activeChatFields ? (
                    <FieldComposer
                      key={`${activeStepIndex}-${activeChatFields.fieldIndex}`}
                      field={activeChatFields.fields[activeChatFields.fieldIndex]}
                      initialValue={activeChatFields.values[activeChatFields.fields[activeChatFields.fieldIndex].name] ?? ""}
                      onSubmit={handleChatFieldSubmit}
                    />
                  ) : (
                    <ChatInput input={activeInput!} answers={effectiveAnswers} onSubmit={handleSubmit} />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Incorporation Documents sidebar — always visible ≥ sm, collapsible ── */}
          <SidebarPanel icon={FileText} label="Incorporation Documents" widthClass="w-52 md:w-60 lg:w-72 2xl:w-80">
            {hasDocs ? <DocumentTracker statuses={docStatuses} answers={effectiveAnswers} /> : <DocumentTrackerEmpty />}
          </SidebarPanel>

          {/* ── Mobile minimized tab / drawer (< sm only) — always available ── */}
          <MobileSidebarTab
            icon={FileText}
            label="Incorporation Documents"
            count={hasDocs ? { done: docsCompleted, total: docsTotal } : undefined}
            open={mobileDocsOpen}
            onOpenChange={setMobileDocsOpen}
          >
            {hasDocs ? <DocumentTracker statuses={docStatuses} answers={effectiveAnswers} /> : <DocumentTrackerEmpty />}
          </MobileSidebarTab>
        </div>
        </SignedOutGate>
      ) : view === "compliance" ? (
        <SignedOutGate>
          <ComplianceView
            key={complianceKey}
            answers={effectiveAnswers}
            onItemComplete={handleComplianceDocComplete}
            onItemDeleted={handleComplianceDocDeleted}
            startExpanded={complianceFromFlow}
            onGoToLibrary={() => handlePhaseClick("documents")}
          />
        </SignedOutGate>
      ) : view === "transactions" ? (
        <SignedOutGate>
          <TransactionsOnboarding
            key={transactionsKey}
            answers={effectiveAnswers}
            onDocumentReady={handleTransactionDocReady}
            onItemDeleted={handleTransactionDocDeleted}
            onGoToLibrary={() => handlePhaseClick("documents")}
          />
        </SignedOutGate>
      ) : (
        <DocumentLibrary
          companyName={effectiveAnswers.companyName}
          answers={effectiveAnswers}
          incorporationDocs={incorporationLibraryDocs}
          complianceDocs={complianceDocs.map((d) => withSignature({ ...d, hidden: !!hiddenDocIds[d.id] }))}
          transactionDocs={transactionDocs.map((d) => withSignature({ ...d, hidden: !!hiddenDocIds[d.id] }))}
          onNavigate={handlePhaseClick}
          onDelete={handleDeleteLibraryDoc}
          onRestore={handleRestoreLibraryDoc}
          onSign={handleSignLibraryDoc}
          onSendToSign={handleSendToSign}
          onRemoveSignature={handleRemoveSignature}
          onSendToDelaware={handleSendToDelaware}
          onConfirmFiled={handleConfirmFiled}
          savedSignature={
            profile.signatureDataUrl
              ? { signatureDataUrl: profile.signatureDataUrl, signerName: profile.signerName, roles: profile.roles }
              : null
          }
          pendingSignRequests={pendingSignRequestsByDocId}
        />
      )}

      {settingsOpen && (
        <ProfileSettingsModal profile={profile} onSave={setProfile} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  )
}
