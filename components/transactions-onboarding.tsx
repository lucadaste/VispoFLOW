"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Send, ArrowLeftRight, Check } from "lucide-react"
import { BotMessage, UserMessage } from "@/components/chat-message"
import { MobileSidebarTab } from "@/components/mobile-sidebar-tab"
import { SidebarPanel } from "@/components/sidebar-panel"

type ChatMessage =
  | { id: number; role: "bot"; text: string }
  | { id: number; role: "user"; text: string }

type TxDoc = { id: string; title: string; subtitle: string }

type Flow = "none" | "options" | "shares" | "transfer" | "questions"
type Step = "start" | "recipient" | "amount" | "price" | "vesting" | "share-class" | "transfer-from" | "transfer-to" | "open" | "done"

const SUGGESTIONS = [
  "Issue stock options",
  "Issue shares",
  "Record a stock transfer",
  "I have questions",
]

const GREETING = "Hi! I can help you record and prepare documents for post-incorporation transactions. What would you like to do?"

const fieldClass = "flex-1 bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60"

type State = {
  flow: Flow
  step: Step
  recipient: string
  amount: string
  price: string
  vesting: string
  shareClass: string
  transferFrom: string
  transferTo: string
}

const initialState: State = {
  flow: "none",
  step: "start",
  recipient: "",
  amount: "",
  price: "",
  vesting: "",
  shareClass: "",
  transferFrom: "",
  transferTo: "",
}

export function TransactionsOnboarding({
  onDocumentReady,
}: {
  onDocumentReady?: (doc: { id: string; title: string; subtitle: string }) => void
} = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [state, setState] = useState<State>(initialState)
  const [value, setValue] = useState("")
  const [docs, setDocs] = useState<TxDoc[]>([])
  const [mobileDocsOpen, setMobileDocsOpen] = useState(false)
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
    pushBot(GREETING)
  }, [pushBot])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const startFlow = useCallback((suggestion: string) => {
    pushUser(suggestion)

    if (suggestion === "Issue stock options") {
      pushBot("Let's prepare a stock option grant. Who is the recipient?")
      setState({ ...initialState, flow: "options", step: "recipient" })
    } else if (suggestion === "Issue shares") {
      pushBot("Got it. Who is receiving the shares?")
      setState({ ...initialState, flow: "shares", step: "recipient" })
    } else if (suggestion === "Record a stock transfer") {
      pushBot("Sure. Who is transferring shares?")
      setState({ ...initialState, flow: "transfer", step: "transfer-from" })
    } else {
      pushBot("Happy to help. What's your question about post-incorporation transactions?")
      setState({ ...initialState, flow: "questions", step: "open" })
    }
  }, [pushBot, pushUser])

  const addDoc = useCallback((doc: TxDoc) => {
    setDocs((d) => [...d, doc])
    onDocumentReady?.(doc)
  }, [onDocumentReady])

  const handleSubmit = useCallback(() => {
    const text = value.trim()
    if (!text) return
    setValue("")
    pushUser(text)

    const s = state

    if (s.step === "start") { startFlow(text); return }

    if (s.flow === "options") {
      if (s.step === "recipient") {
        setState((p) => ({ ...p, recipient: text, step: "amount" }))
        pushBot(`How many options are you granting to ${text}?`)
      } else if (s.step === "amount") {
        setState((p) => ({ ...p, amount: text, step: "price" }))
        pushBot("What is the exercise price per share? (e.g. $0.001)")
      } else if (s.step === "price") {
        setState((p) => ({ ...p, price: text, step: "vesting" }))
        pushBot("What vesting schedule applies? Standard is 4-year with a 1-year cliff — type \"standard\" or describe a custom schedule.")
      } else if (s.step === "vesting") {
        const vesting = text.toLowerCase() === "standard" ? "4-year / 1-year cliff (standard)" : text
        setState((p) => ({ ...p, vesting, step: "done" }))
        pushBot(`Got it — stock option grant prepared:\n\n• Recipient: ${s.recipient}\n• Options: ${s.amount}\n• Exercise price: ${s.price}\n• Vesting: ${vesting}\n\nYour grant document is ready for review and signature.`)
        addDoc({
          id: `option-grant-${Date.now()}`,
          title: `Stock Option Grant — ${s.recipient}`,
          subtitle: `${s.amount} options · ${vesting}`,
        })
      }
    } else if (s.flow === "shares") {
      if (s.step === "recipient") {
        setState((p) => ({ ...p, recipient: text, step: "amount" }))
        pushBot(`How many shares are being issued to ${text}?`)
      } else if (s.step === "amount") {
        setState((p) => ({ ...p, amount: text, step: "share-class" }))
        pushBot("What share class? (e.g. Common, Series A Preferred)")
      } else if (s.step === "share-class") {
        setState((p) => ({ ...p, shareClass: text, step: "done" }))
        pushBot(`Done — share issuance prepared:\n\n• Recipient: ${s.recipient}\n• Shares: ${s.amount}\n• Class: ${text}\n\nYour stock issuance document is ready for review and signature.`)
        addDoc({
          id: `share-issuance-${Date.now()}`,
          title: `Stock Issuance — ${s.recipient}`,
          subtitle: `${s.amount} shares · ${text}`,
        })
      }
    } else if (s.flow === "transfer") {
      if (s.step === "transfer-from") {
        setState((p) => ({ ...p, transferFrom: text, step: "transfer-to" }))
        pushBot(`Who is receiving the shares from ${text}?`)
      } else if (s.step === "transfer-to") {
        setState((p) => ({ ...p, transferTo: text, step: "amount" }))
        pushBot("How many shares are being transferred?")
      } else if (s.step === "amount") {
        setState((p) => ({ ...p, amount: text, step: "done" }))
        pushBot(`Transfer recorded:\n\n• From: ${s.transferFrom}\n• To: ${s.transferTo}\n• Shares: ${text}\n\nYour stock transfer document is ready for review and signature.`)
        addDoc({
          id: `stock-transfer-${Date.now()}`,
          title: `Stock Transfer — ${s.transferFrom} → ${s.transferTo}`,
          subtitle: `${text} shares`,
        })
      }
    } else if (s.flow === "questions") {
      pushBot("That's a great question. For specifics on your situation, we'd recommend consulting a startup attorney — but feel free to keep asking and I'll help with what I can.")
    }
  }, [value, state, pushBot, pushUser, startFlow, addDoc])

  const showInput = state.step !== "done"
  const placeholder =
    state.step === "start" ? "Type a message…" :
    state.step === "price" ? "e.g. $0.001" :
    state.step === "vesting" ? "e.g. standard, or describe custom…" :
    state.step === "share-class" ? "e.g. Common, Series A Preferred" :
    "Type your answer…"

  const sidebarContent = <TransactionDocsContent docs={docs} />

  return (
    <div className="flex w-full flex-1 overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border bg-card/40 px-4 py-4 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">Transaction Center</h1>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl space-y-4">
            {messages.map((m) =>
              m.role === "bot" ? (
                <BotMessage key={m.id}>{m.text}</BotMessage>
              ) : (
                <UserMessage key={m.id}>{m.text}</UserMessage>
              ),
            )}
          </div>
        </div>

        {showInput && (
          <div className="border-t border-border bg-white/80 backdrop-blur px-4 py-4 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-2xl space-y-2.5">
              {state.step === "start" && (
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => startFlow(s)}
                      className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm">
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder={placeholder}
                  autoFocus={state.step !== "start"}
                  className={fieldClass}
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
        )}
      </div>

      {/* ── Transaction Documents sidebar — always visible ≥ sm, collapsible ── */}
      <SidebarPanel icon={ArrowLeftRight} label="Transaction Documents" widthClass="w-52 md:w-60 lg:w-72 2xl:w-80">
        {sidebarContent}
      </SidebarPanel>

      {/* ── Mobile minimized tab / drawer (< sm only) — always available ── */}
      <MobileSidebarTab
        icon={ArrowLeftRight}
        label="Transaction Documents"
        count={docs.length > 0 ? { done: docs.length, total: docs.length } : undefined}
        open={mobileDocsOpen}
        onOpenChange={setMobileDocsOpen}
      >
        {sidebarContent}
      </MobileSidebarTab>
    </div>
  )
}

function TransactionDocsContent({ docs }: { docs: TxDoc[] }) {
  if (docs.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <ArrowLeftRight className="h-8 w-8 text-muted-foreground/40" />
        <p className="mt-3 text-sm font-medium text-foreground">Transaction Documents</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Grants, issuances, and transfers will appear here as you record them.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Transaction Documents</h2>
          <span className="text-xs font-medium text-muted-foreground">{docs.length}</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Prepared as you complete each transaction.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {docs.map((doc) => (
            <li key={doc.id} className="flex items-start gap-2 rounded-lg px-2 py-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-[12px] font-medium text-foreground">{doc.title}</p>
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{doc.subtitle}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
