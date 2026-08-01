"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FileText, RotateCcw } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { MobileSidebarTab } from "@/components/mobile-sidebar-tab"
import { SidebarPanel } from "@/components/sidebar-panel"
import { TopBar } from "@/components/top-bar"
import { ComplianceView } from "@/components/compliance-view"
import { TransactionsOnboarding } from "@/components/transactions-onboarding"
import {
  DocumentLibrary,
  DocumentViewer,
  withDocSignatures,
  redactSensitiveDocValues,
  type LibraryDoc,
  type DocSignature,
  type PendingSignRequest,
} from "@/components/document-library"
import { getSignerSlots } from "@/lib/document-signers"
import { primaryOfficerTitle } from "@/lib/signature"
import { Landing } from "@/components/landing"
import { HomeChat } from "@/components/home-chat"
import {
  BotMessage,
  UserMessage,
  SystemNote,
  DraftedCard,
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
  DOCUMENTS,
} from "@/lib/flow"
import { renderDocumentContent } from "@/lib/document-templates"
import { renderComplianceDocument } from "@/lib/compliance-templates"
import {
  loadPersisted,
  savePersisted,
  clearPersisted,
  loadFromServer,
  saveToServer,
  clearFromServer,
  updateServerValue,
} from "@/lib/persist"
import { STORAGE_KEYS } from "@/lib/storage-keys"
import { mergeProfileIntoAnswers, isProfileEmpty } from "@/lib/profile"
import { useProfile } from "@/lib/use-profile"
import { ProfileSettingsModal } from "@/components/profile-settings-modal"
import { ConfirmModal } from "@/components/confirm-modal"
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

function clearItemOnServer(key: string, id: string) {
  return updateServerValue<FlowPersistedShape>(key, (saved) => {
    if (saved && (saved.completed[id] || saved.docs[id])) {
      delete saved.completed[id]
      delete saved.docs[id]
      return saved
    }
    return null
  })
}

function restoreItemInPersisted(key: string, doc: LibraryDoc) {
  const saved = loadPersisted<FlowPersistedShape>(key)
  if (saved) {
    saved.completed[doc.id] = true
    saved.docs[doc.id] = doc
    savePersisted(key, saved)
  }
}

function restoreItemOnServer(key: string, doc: LibraryDoc) {
  return updateServerValue<FlowPersistedShape>(key, (saved) => {
    if (!saved) return null
    saved.completed[doc.id] = true
    saved.docs[doc.id] = doc
    return saved
  })
}

type ChatMessage =
  | { id: number; role: "bot"; text: string }
  | { id: number; role: "user"; text: string }
  | { id: number; role: "system"; text: string; variant: "doc" | "filing" }
  | { id: number; role: "docDrafted"; docId: string }
  | { id: number; role: "widget"; widget: "formed" }
  | { id: number; role: "note"; text: string }

type ActiveChatFields = {
  input: StepInput
  fields: ChatField[]
  fieldIndex: number
  values: Record<string, string>
}

type IncorporationPersisted = {
  messages: ChatMessage[]
  docStatuses: Record<string, DocStatus>
  /** when each doc first reached "complete" — shown next to it in the deleted list, see LibraryDoc.createdAt */
  docCompletedAt?: Record<string, string>
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
  /** the recipient's values for any extra fields (e.g. Address, Email) their slot's block required */
  fields: Record<string, string> | null
}

/** A pending emailed invite for a single sensitive field delegated to someone other than the
 *  account holder (see lib/flow.ts's `ComplianceField.delegatable`). Never carries the value
 *  itself — that's only ever fetched, decrypted, through app/api/info-requests/[id]/reveal. */
type InfoRequest = {
  id: string
  docId: string
  fieldName: string
  status: "sent" | "viewed" | "fulfilled"
}

type LibraryPersisted = {
  complianceDocs: LibraryDoc[]
  transactionDocs: LibraryDoc[]
  /** doc id -> ISO timestamp of when it was deleted (moved to the deleted list) */
  hiddenDocIds: Record<string, string>
  signedDocs: Record<string, DocSignature[]>
}

/** How long a deleted document stays in the "deleted documents" list before it's purged for good. */
const DELETED_DOC_RETENTION_MS = 7 * 24 * 60 * 60 * 1000

/** Older persisted data marked a deletion with `true` instead of a timestamp — treat those as
 *  deleted right now so they get a fresh retention window instead of vanishing immediately. */
function normalizeHiddenDocIds(raw: Record<string, unknown> | undefined): Record<string, string> {
  const now = new Date().toISOString()
  const result: Record<string, string> = {}
  for (const [id, value] of Object.entries(raw ?? {})) {
    result[id] = typeof value === "string" ? value : now
  }
  return result
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

/** Heuristic for whether a chat message sent mid-step is a question rather than an answer. */
const looksLikeQuestion = (text: string) =>
  /\?\s*$/.test(text) ||
  /^(what|why|who|when|where|how|is|are|do|does|can|could|should|will|explain|tell me)\b/i.test(text.trim())

export function IncorporationApp() {
  const { user, isSignedIn } = useUser()
  const { profile, setProfile } = useProfile()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [docStatuses, setDocStatuses] = useState<Record<string, DocStatus>>({})
  const [docCompletedAt, setDocCompletedAt] = useState<Record<string, string>>({})
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
  const [viewingDoc, setViewingDoc] = useState<LibraryDoc | null>(null)
  const [hiddenDocIds, setHiddenDocIds] = useState<Record<string, string>>({})
  const [signedDocs, setSignedDocs] = useState<Record<string, DocSignature[]>>({})
  const [signRequests, setSignRequests] = useState<SignRequest[]>([])
  const [infoRequests, setInfoRequests] = useState<InfoRequest[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [incorporationRestartConfirm, setIncorporationRestartConfirm] = useState(false)
  const [modeSwitchConfirm, setModeSwitchConfirm] = useState<"chat" | "form" | null>(null)
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
    // Purge deletions past the retention window right away, so a stale deleted doc never even
    // flashes in the list before disappearing on the next render. Only compliance/transaction
    // docs can actually be purged (removed from their array) — an incorporation doc's "complete"
    // state lives in docStatuses, not a removable list, so its deletion just stays hidden past
    // the window rather than silently reappearing.
    const purgeableIds = new Set([...saved.complianceDocs, ...saved.transactionDocs].map((d) => d.id))
    const hiddenDocIds = normalizeHiddenDocIds(saved.hiddenDocIds)
    const now = Date.now()
    const expiredIds = new Set(
      Object.entries(hiddenDocIds)
        .filter(([id, deletedAt]) => purgeableIds.has(id) && now - new Date(deletedAt).getTime() > DELETED_DOC_RETENTION_MS)
        .map(([id]) => id),
    )
    for (const id of expiredIds) delete hiddenDocIds[id]
    setComplianceDocs(saved.complianceDocs.filter((d) => !expiredIds.has(d.id)))
    setTransactionDocs(saved.transactionDocs.filter((d) => !expiredIds.has(d.id)))
    setHiddenDocIds(hiddenDocIds)
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
    const snapshot: LibraryPersisted = {
      complianceDocs: complianceDocs.map(redactSensitiveDocValues),
      transactionDocs,
      hiddenDocIds,
      signedDocs,
    }
    savePersisted<LibraryPersisted>(STORAGE_KEYS.library, snapshot)
    if (isSignedIn) saveToServer(STORAGE_KEYS.library, snapshot)
  }, [complianceDocs, transactionDocs, hiddenDocIds, signedDocs, isSignedIn, libraryLoaded, libraryServerLoaded])

  // Refresh outstanding "sent to sign" requests while signed in, so a document signed
  // elsewhere (by the recipient) shows up without a manual reload. Not scoped to the
  // Doc Library view — Transaction Center documents (e.g. SAFEs) are reviewed from the
  // "transactions" view too, and there's no push channel for signing events.
  useEffect(() => {
    if (!isSignedIn) return
    const refresh = () =>
      fetch("/api/sign-requests")
        .then((r) => r.json())
        .then((data) => setSignRequests(data.requests ?? []))
        .catch(() => {})
    refresh()
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [isSignedIn])

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
        extraFields: req.fields ?? undefined,
      }
      setSignedDocs((docs) => ({
        ...docs,
        [req.docId]: [...(docs[req.docId] ?? []).filter((s) => s.slotId !== slotId), newSig],
      }))
    }
  }, [signRequests, signedDocs])

  // Same polling pattern as sign-requests above, for compliance fields delegated to a third
  // party (see lib/flow.ts's ComplianceField.delegatable and components/compliance-view.tsx).
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

  // Once a delegated field is fulfilled, pull the real value in (owner-authenticated reveal —
  // see app/api/info-requests/[id]/reveal/route.ts) and bake it into the doc it belongs to,
  // replacing the placeholder left in its `values`/`content`. Matching on the doc's own
  // `awaitingThirdParty.fieldName` means a request only gets merged once — it's cleared here,
  // so the next poll no longer finds a match for it.
  useEffect(() => {
    for (const req of infoRequests) {
      if (req.status !== "fulfilled") continue
      const doc = complianceDocs.find((d) => d.id === req.docId)
      if (!doc || doc.awaitingThirdParty?.fieldName !== req.fieldName) continue
      fetch(`/api/info-requests/${req.id}/reveal`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { value?: string } | null) => {
          if (!data?.value) return
          setComplianceDocs((docs) =>
            docs.map((d) => {
              if (d.id !== req.docId || d.awaitingThirdParty?.fieldName !== req.fieldName) return d
              const values = { ...d.values, [req.fieldName]: data.value! }
              return {
                ...d,
                values,
                content: renderComplianceDocument(d.id, values) ?? d.content,
                awaitingThirdParty: undefined,
              }
            }),
          )
        })
        .catch(() => {})
    }
  }, [infoRequests, complianceDocs])

  const pendingSignRequestsByDocId = useMemo(() => {
    const map: Record<string, PendingSignRequest[]> = {}
    for (const req of signRequests) {
      if (req.status === "signed") continue
      const entry: PendingSignRequest = {
        id: req.id,
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
      payload: {
        recipientEmail: string
        recipientName?: string
        slotId: string
        slotLabel: string
        lockedName?: string
        requiredFields?: string[]
      },
    ) => {
      // A doc with a `sensitive` field (e.g. an EIN/83(b) SSN) only ever holds the real value in
      // this live, in-memory session — redact it here too, exactly like the snapshot effect above
      // does before persisting, so it can't reach the signature_requests table (and from there,
      // the public /sign/[token] page) unredacted.
      const res = await fetch("/api/sign-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docId: doc.id,
          docTitle: doc.title,
          docContent: redactSensitiveDocValues(doc).content ?? "",
          recipientEmail: payload.recipientEmail,
          recipientName: payload.recipientName,
          senderCompanyName: effectiveAnswers.companyName,
          slotId: payload.slotId,
          slotLabel: payload.slotLabel,
          lockedName: payload.lockedName,
          requiredFields: payload.requiredFields,
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

  // The one place that fully erases a document's signatures — both collected locally and any
  // outstanding/completed "send to sign" request server-side. Every "delete this document" /
  // "redo" path MUST route through this: leaving either behind means the doc's next regeneration
  // (same catalog id) silently inherits the old signature instead of requiring a fresh one, which
  // is exactly the bug this exists to prevent (see reconciliation effect above, which would
  // otherwise re-fold a surviving "signed" sign request straight back into signedDocs).
  const clearSignaturesForDoc = useCallback(
    (id: string) => {
      setSignedDocs((docs) => {
        if (!docs[id]) return docs
        const next = { ...docs }
        delete next[id]
        return next
      })
      const matching = signRequests.filter((r) => r.docId === id)
      if (matching.length > 0) {
        setSignRequests((reqs) => reqs.filter((r) => r.docId !== id))
        matching.forEach((r) => {
          fetch(`/api/sign-requests/${r.id}`, { method: "DELETE" }).catch(() => {})
        })
      }
    },
    [signRequests],
  )

  // Withdraws an outstanding "sent to sign" request — e.g. sent to the wrong email, or no
  // longer needed — so it stops showing as awaiting signature.
  const handleCancelSignRequest = useCallback((requestId: string) => {
    setSignRequests((reqs) => reqs.filter((r) => r.id !== requestId))
    fetch(`/api/sign-requests/${requestId}`, { method: "DELETE" }).catch(() => {})
  }, [])

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
    clearSignaturesForDoc(id)
    setHiddenDocIds((ids) => {
      if (!ids[id]) return ids
      const next = { ...ids }
      delete next[id]
      return next
    })
  }, [clearSignaturesForDoc])

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
    setHiddenDocIds((ids) => ({ ...ids, [doc.id]: new Date().toISOString() }))
    clearSignaturesForDoc(doc.id)
    const key = flowStorageKeyFor(doc.id)
    if (key) {
      clearItemInPersisted(key, doc.id)
      if (isSignedIn) clearItemOnServer(key, doc.id)
    }
  }, [flowStorageKeyFor, isSignedIn, clearSignaturesForDoc])

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
      const isAccountHolder = signature.signerName.trim().toLowerCase() === profile.signerName.trim().toLowerCase()
      // The ad-hoc "type/draw a signature" path (used when no saved profile signature exists yet)
      // doesn't collect roles. If the typed name matches the account holder, fall back to their
      // saved profile roles so the company execution block still gets filled in correctly.
      const roles = signature.roles ?? (isAccountHolder ? profile.roles : undefined)
      // Self-signing only ever represents the company (external slots go through "send to sign"
      // instead — see selfSignableSlotsFor), so any blank Address/Email in this block is the
      // account holder's own saved company info.
      const extraFields =
        slot?.kind === "officer" && !slot.external && isAccountHolder
          ? { Address: profile.companyAddress, Email: profile.email }
          : undefined
      const newSig: DocSignature = {
        slotId,
        slotLabel: signature.slotLabel ?? slot?.label ?? "Company officer",
        signatureDataUrl: signature.signatureDataUrl,
        signerName: signature.signerName,
        signedAt: new Date().toISOString(),
        officerTitle: slot?.kind === "officer" ? primaryOfficerTitle(roles ?? []) ?? undefined : undefined,
        extraFields,
      }
      setSignedDocs((docs) => ({
        ...docs,
        [doc.id]: [...(docs[doc.id] ?? []).filter((s) => s.slotId !== slotId), newSig],
      }))
    },
    [profile.signerName, profile.roles, profile.companyAddress, profile.email, effectiveAnswers],
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
    clearSignaturesForDoc(id)
    setHiddenDocIds((ids) => {
      if (!ids[id]) return ids
      const next = { ...ids }
      delete next[id]
      return next
    })
  }, [clearSignaturesForDoc])

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

  // Repeated mode toggling with nothing else happening in between (see requestSetInputMode)
  // shouldn't stack up a growing list of these — replace the trailing note in place instead.
  const pushNote = useCallback((text: string) => {
    setMessages((m) => {
      const last = m[m.length - 1]
      if (last?.role === "note") return [...m.slice(0, -1), { ...last, text }]
      return [...m, { id: nextId(), role: "note", text }]
    })
  }, [])

  const chatFieldPrompt = (f: ChatField) =>
    `${f.label}${f.optional ? " (optional)" : ""}${f.hint ? ` — ${f.hint}` : ""}`

  const modeLabel = (m: "chat" | "form") => (m === "chat" ? "Chat" : "Questionnaire")

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
    setDocCompletedAt((at) => {
      const next = { ...at }
      const now = new Date().toISOString()
      ids.forEach((id) => (next[id] = now))
      return next
    })
    setMessages((m) => [
      ...m,
      ...ids.map((id) => ({ id: nextId(), role: "docDrafted" as const, docId: id })),
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
        if (step.completes?.length) {
          await animateDocs(step.completes)
        }
        await playStep(index + 1)
      }
    },
    [pushBot, inputMode, animateDocs],
  )

  const applyIncorporationState = useCallback((saved: IncorporationPersisted) => {
    idRef.current = saved.messages.reduce((max, m) => Math.max(max, m.id), 0)
    setMessages(saved.messages)
    setDocStatuses(saved.docStatuses)
    setDocCompletedAt(saved.docCompletedAt ?? {})
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
      docCompletedAt,
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
    docCompletedAt,
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

  // What's typed might be a genuine question rather than an answer — in which case explain
  // and re-ask instead of recording it as the field's value. None of these chat fields use
  // the select/date types, so there's no free-text-less field type to exclude here.
  const handleChatFieldInput = useCallback((raw: string) => {
    if (!activeChatFields) return
    const field = activeChatFields.fields[activeChatFields.fieldIndex]
    const val = raw.trim()
    if (val && looksLikeQuestion(val)) {
      pushUser(val)
      ;(async () => {
        await pushBot(field.hint ?? "Happy to help — once you're ready, just answer the question above and we'll continue.")
        await pushBot(chatFieldPrompt(field))
      })()
      return
    }
    handleChatFieldSubmit(raw)
  }, [activeChatFields, pushUser, pushBot, handleChatFieldSubmit])

  // Re-renders the current step's input under a newly selected mode, without replaying the
  // step's intro messages (those already happened) — used when switching Chat/Questionnaire
  // mid-step, as opposed to `playStep`, which is only for advancing to a new step.
  const reinitStepForMode = useCallback((mode: "chat" | "form") => {
    const step = STEPS[activeStepIndex]
    if (!step?.input || step.autoAdvance) {
      setActiveInput(null)
      setActiveChatFields(null)
      return
    }
    const decomposed = mode === "chat" ? getChatFields(step.input, effectiveAnswersRef.current) : null
    if (decomposed) {
      setActiveInput(null)
      setActiveChatFields({ input: step.input, fields: decomposed.fields, fieldIndex: 0, values: decomposed.defaults })
      // Toggling modes back and forth re-enters chat at the same field every time (nothing to
      // resume past, since neither mode lifts its in-progress values to the other). Only skip
      // pushing the prompt if it's already the most recent bot message — i.e. repeated toggling
      // with nothing else happening in between — so a real event since then (however unlikely
      // here) still gets a fresh prompt instead of looking stuck on a stale one.
      const prompt = chatFieldPrompt(decomposed.fields[0])
      const lastBotText = [...messages].reverse().find((m) => m.role === "bot")?.text
      if (!decomposed.skipFirstPrompt && lastBotText !== prompt) pushBot(prompt)
    } else {
      setActiveChatFields(null)
      setActiveInput(step.input)
    }
  }, [activeStepIndex, pushBot, messages])

  // Switching Chat/Questionnaire mode mid-step discards answers already stepped past in the
  // chat-field sequence, so confirm first when there's real progress to lose. Nothing is lost
  // switching away from an unstarted or form-mode step, so those switch immediately.
  const requestSetInputMode = useCallback((target: "chat" | "form") => {
    if (target === inputMode) return
    const hasProgress = inputMode === "chat" && !!activeChatFields && activeChatFields.fieldIndex > 0
    if (!hasProgress) {
      setInputMode(target)
      pushNote(`Switched from ${modeLabel(inputMode)} mode to ${modeLabel(target)} mode.`)
      reinitStepForMode(target)
      return
    }
    setModeSwitchConfirm(target)
  }, [inputMode, activeChatFields, pushNote, reinitStepForMode])

  const restartFormation = () => {
    startedRef.current = false
    idRef.current = 0
    setMessages([])
    setDocStatuses({})
    setDocCompletedAt({})
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
    DOCUMENTS.forEach((d) => clearSignaturesForDoc(d.id))
    clearPersisted(STORAGE_KEYS.incorporation)
    if (isSignedIn) clearFromServer(STORAGE_KEYS.incorporation)
    requestAnimationFrame(() => {
      startedRef.current = true
      playStep(0)
    })
  }

  const hasDocs = Object.keys(docStatuses).length > 0
  const docsTotal = DOCUMENTS.length
  const docsCompleted = DOCUMENTS.filter(
    (d) => docStatuses[d.id] === "complete" || docStatuses[d.id] === "filing" || docStatuses[d.id] === "filed",
  ).length

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

  const withSignature = (doc: LibraryDoc): LibraryDoc =>
    withDocSignatures(doc, signedDocs[doc.id] ?? [], effectiveAnswers)

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
      createdAt: docCompletedAt[d.id],
    }),
  )

  const coiSigned = !!incorporationLibraryDocs.find((d) => d.id === "coi")?.signed
  const docsSigned = incorporationLibraryDocs.filter((d) => d.signed).length
  const complianceSignedCount = complianceDocs.filter((d) => withSignature(d).signed).length

  const visibleDocsCount =
    incorporationLibraryDocs.filter((d) => !d.hidden).length +
    complianceDocs.filter((d) => !hiddenDocIds[d.id]).length +
    transactionDocs.filter((d) => !hiddenDocIds[d.id]).length

  return (
    <div className="flex h-dvh flex-col bg-background">
      <TopBar
        phase={phase}
        onPhaseClick={handlePhaseClick}
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
          incorporationStatus={{ started: hasDocs, completed: docsCompleted, total: docsTotal, signed: docsSigned }}
          complianceCount={complianceDocs.length}
          complianceSignedCount={complianceSignedCount}
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
              <div className="flex items-center gap-3">
                <div className="mx-auto flex max-w-2xl flex-1 items-center justify-between gap-3">
                  <h1 className="font-serif text-lg font-semibold tracking-tight text-foreground">Incorporation Center</h1>
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
            </div>

            {/* ── Chat — relative wrapper positions the mobile "Incorporation Documents" tab ── */}
            {/*    below this header rather than mid-conversation. */}
            <div className="relative flex-1 overflow-hidden">
              <div ref={scrollRef} className="h-full overflow-y-auto px-4 py-8 sm:px-8 lg:px-12">
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
                    if (m.role === "docDrafted") {
                      const doc = DOCUMENTS.find((d) => d.id === m.docId)
                      if (!doc) return null
                      const libDoc = incorporationLibraryDocs.find((d) => d.id === m.docId)
                      return (
                        <DraftedCard
                          key={m.id}
                          groupTitle={doc.group}
                          title={doc.label}
                          onClick={libDoc ? () => setViewingDoc(libDoc) : undefined}
                        />
                      )
                    }
                    if (m.role === "widget" && m.widget === "formed")
                      return <FormedCard key={m.id} answers={effectiveAnswers} />
                    if (m.role === "note")
                      return <p key={m.id} className="animate-message-in text-xs text-muted-foreground">{m.text}</p>
                    return null
                  })}
                  {isTyping && <TypingIndicator />}
                </div>
              </div>

              {/* ── Mobile minimized tab / drawer (< sm only) — always available ── */}
              <MobileSidebarTab
                icon={FileText}
                label="Incorporation Documents"
                title="Incorporation Center"
                open={mobileDocsOpen}
                onOpenChange={setMobileDocsOpen}
              >
                {hasDocs ? (
                  <DocumentTracker
                    statuses={docStatuses}
                    answers={effectiveAnswers}
                    signedDocs={signedDocs}
                    onGoToLibrary={() => handlePhaseClick("documents")}
                    onDeleteRestart={() => setIncorporationRestartConfirm(true)}
                    coiSigned={coiSigned}
                  />
                ) : (
                  <DocumentTrackerEmpty />
                )}
              </MobileSidebarTab>
            </div>

            {(activeInput || activeChatFields) && (
              <div className="border-t border-border bg-card/80 backdrop-blur px-4 py-4 sm:px-8 lg:px-12">
                <div className="mx-auto flex max-w-2xl items-end gap-2">
                  <button
                    onClick={() => setIncorporationRestartConfirm(true)}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 self-stretch rounded-xl border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-secondary hover:text-foreground sm:px-3"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Restart</span>
                  </button>
                  <div className="flex-1">
                    {activeChatFields ? (
                      <FieldComposer
                        key={`${activeStepIndex}-${activeChatFields.fieldIndex}`}
                        field={activeChatFields.fields[activeChatFields.fieldIndex]}
                        initialValue={activeChatFields.values[activeChatFields.fields[activeChatFields.fieldIndex].name] ?? ""}
                        onSubmit={handleChatFieldInput}
                      />
                    ) : (
                      <ChatInput input={activeInput!} answers={effectiveAnswers} onSubmit={handleSubmit} />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Incorporation Documents sidebar — always visible ≥ sm, collapsible ── */}
          <SidebarPanel icon={FileText} label="Incorporation Documents" widthClass="w-52 md:w-60 lg:w-72 2xl:w-80">
            {hasDocs ? (
              <DocumentTracker
                statuses={docStatuses}
                answers={effectiveAnswers}
                signedDocs={signedDocs}
                onGoToLibrary={() => handlePhaseClick("documents")}
                onDeleteRestart={() => setIncorporationRestartConfirm(true)}
                coiSigned={coiSigned}
              />
            ) : (
              <DocumentTrackerEmpty />
            )}
          </SidebarPanel>
        </div>
        </SignedOutGate>
      ) : view === "compliance" ? (
        <SignedOutGate>
          <ComplianceView
            key={complianceKey}
            answers={effectiveAnswers}
            signedDocs={signedDocs}
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
            signedDocs={signedDocs}
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
          onCancelSignRequest={handleCancelSignRequest}
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

      {viewingDoc && (
        <DocumentViewer
          doc={viewingDoc}
          answers={effectiveAnswers}
          onClose={() => setViewingDoc(null)}
          onGoToLibrary={() => { setViewingDoc(null); handlePhaseClick("documents") }}
        />
      )}

      {settingsOpen && (
        <ProfileSettingsModal profile={profile} onSave={setProfile} onClose={() => setSettingsOpen(false)} />
      )}

      {incorporationRestartConfirm && (
        <ConfirmModal
          title="Delete and restart your incorporation?"
          description="All incorporation documents share one guided flow, so there's no way to redo just this one — this restarts the whole flow from the beginning and removes any incorporation documents you've generated so far from My Docs."
          confirmLabel="Delete & restart"
          onConfirm={() => {
            setIncorporationRestartConfirm(false)
            restartFormation()
          }}
          onCancel={() => setIncorporationRestartConfirm(false)}
        />
      )}

      {modeSwitchConfirm && (
        <ConfirmModal
          title="Switch modes and restart this step?"
          description={`Switching to ${modeLabel(modeSwitchConfirm)} mode will restart this step and discard the answers you've entered for it so far.`}
          confirmLabel="Restart & switch"
          onConfirm={() => {
            const target = modeSwitchConfirm
            setModeSwitchConfirm(null)
            setInputMode(target)
            pushNote(`Switched from ${modeLabel(inputMode)} mode to ${modeLabel(target)} mode.`)
            reinitStepForMode(target)
          }}
          onCancel={() => setModeSwitchConfirm(null)}
        />
      )}
    </div>
  )
}
