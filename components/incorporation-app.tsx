"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { TopBar } from "@/components/top-bar"
import { ComplianceView } from "@/components/compliance-view"
import { TransactionsOnboarding } from "@/components/transactions-onboarding"
import { Landing } from "@/components/landing"
import { HomeChat } from "@/components/home-chat"
import {
  BotMessage,
  UserMessage,
  SystemNote,
  TypingIndicator,
} from "@/components/chat-message"
import { NameCheckCard } from "@/components/name-check-card"
import { FormedCard } from "@/components/formed-card"
import { ChatInput } from "@/components/chat-inputs"
import { DocumentTracker, DocumentTrackerEmpty } from "@/components/document-tracker"
import { STEPS, type StepInput } from "@/lib/steps"
import {
  type DocStatus,
  type FlowAnswers,
  initialAnswers,
  docShorts,
} from "@/lib/flow"

type ChatMessage =
  | { id: number; role: "bot"; text: string }
  | { id: number; role: "user"; text: string }
  | { id: number; role: "system"; text: string; variant: "doc" | "filing" }
  | { id: number; role: "widget"; widget: "name-check"; companyName: string }
  | { id: number; role: "widget"; widget: "formed" }

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
const typingTime = (text: string) => Math.min(1300, Math.max(550, text.length * 16))

export function IncorporationApp() {
  const { user } = useUser()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [docStatuses, setDocStatuses] = useState<Record<string, DocStatus>>({})
  const [answers, setAnswers] = useState<FlowAnswers>(initialAnswers)
  const [activeInput, setActiveInput] = useState<StepInput | null>(null)
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0)
  const [isTyping, setIsTyping] = useState(false)
  type View = "landing" | "home-chat" | "chat" | "compliance" | "transactions"
  const VALID_VIEWS: View[] = ["landing", "home-chat", "chat", "compliance", "transactions"]

  const [view, setView] = useState<View | "loading">("loading")
  const [homeChatSeed, setHomeChatSeed] = useState<string | undefined>()
  const [homeChatKey, setHomeChatKey] = useState(0)
  const [complianceKey, setComplianceKey] = useState(0)
  const [landingKey, setLandingKey] = useState(0)
  const [transactionsKey, setTransactionsKey] = useState(0)

  // Restore saved view after mount so there is no SSR flash
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("vispo-view") as View | null
      if (saved && VALID_VIEWS.includes(saved)) { setView(saved); return }
    } catch {}
    setView("landing")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (view !== "loading") sessionStorage.setItem("vispo-view", view)
  }, [view])

  const handlePhaseClick = (phase: "home" | "chat" | "compliance" | "transactions") => {
    if (phase === "home") { setView("landing"); return }
    if (phase === "chat") { setView("chat"); return }
    if (phase === "transactions") { setView("transactions"); return }
    if (phase === "compliance") { setView("compliance"); return }
  }

  const handleLandingSelect = (path: "formation" | "compliance" | "questions", message?: string) => {
    if (path === "compliance") { setView("compliance"); return }
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

  const nextId = () => ++idRef.current

  const pushBot = useCallback(async (text: string) => {
    const resolved = resolveMessage(text)
    setIsTyping(true)
    await delay(typingTime(resolved))
    setIsTyping(false)
    setMessages((m) => [...m, { id: nextId(), role: "bot", text: resolved }])
    await delay(260)
  }, [resolveMessage])

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

  const playStep = useCallback(
    async (index: number) => {
      const step = STEPS[index]
      if (!step) return
      setActiveStepIndex(index)
      setActiveInput(null)

      for (const msg of step.messages) {
        await pushBot(msg)
      }

      if (step.widget === "name-check") {
        setMessages((m) => [
          ...m,
          {
            id: nextId(),
            role: "widget",
            widget: "name-check",
            companyName: answersRef.current.companyName,
          },
        ])
        await delay(2700)
      }

      if (step.widget === "formed") {
        setMessages((m) => [...m, { id: nextId(), role: "widget", widget: "formed" }])
        await delay(400)
      }

      if (step.special === "file-coi") {
        setDocStatuses((s) => ({ ...s, coi: "filing" }))
        setMessages((m) => [
          ...m,
          {
            id: nextId(),
            role: "system",
            text: "Certificate of Incorporation transmitted to Delaware",
            variant: "filing",
          },
        ])
        await delay(450)
      }

      if (step.input && !step.autoAdvance) {
        setActiveInput(step.input)
      } else if (step.autoAdvance) {
        await playStep(index + 1)
      }
    },
    [pushBot],
  )

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    playStep(0)
  }, [playStep])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, isTyping, activeInput])

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

      if (step.completes?.length) {
        await animateDocs(step.completes)
      }

      if (step.id === "vesting" && patch.vestingUsesEarlierDate) {
        await pushBot(`Thanks for providing an earlier vesting start date of ${patch.vestingStartDate}.`)
      }

      if (step.input?.kind === "continue" && step.input.action === "compliance") {
        await pushBot("Now let's head to the Compliance Center to complete the regulatory filings required for your incorporation.")
        await delay(300)
        setView("compliance")
        return
      }

      await playStep(activeStepIndex + 1)
    },
    [activeStepIndex, animateDocs, playStep, pushBot],
  )

  const restartFormation = () => {
    startedRef.current = false
    idRef.current = 0
    setMessages([])
    setDocStatuses({})
    setAnswers(initialAnswers)
    setActiveInput(null)
    setActiveStepIndex(0)
    setIsTyping(false)
    setView("chat")
    requestAnimationFrame(() => {
      startedRef.current = true
      playStep(0)
    })
  }

  const handleRestart = () => {
    if (view === "chat") { restartFormation(); return }
    if (view === "home-chat") { setHomeChatSeed(undefined); setHomeChatKey((k) => k + 1); return }
    if (view === "landing") { setLandingKey((k) => k + 1); return }
    if (view === "compliance") { setComplianceKey((k) => k + 1); return }
    if (view === "transactions") { setTransactionsKey((k) => k + 1); return }
  }

  const hasDocs = Object.keys(docStatuses).length > 0

  const phase =
    view === "loading" || view === "landing" || view === "home-chat"
      ? "home"
      : view === "compliance"
      ? "compliance"
      : view === "transactions"
      ? "transactions"
      : "chat"

  return (
    <div className="flex h-dvh flex-col bg-background">
      <TopBar
        phase={phase}
        onReset={handleRestart}
        onPhaseClick={handlePhaseClick}
      />

      {view === "loading" ? null : view === "landing" ? (
        <Landing key={landingKey} onSelect={handleLandingSelect} />
      ) : view === "home-chat" ? (
        <HomeChat
          key={homeChatKey}
          initialMessage={homeChatSeed}
          onStartFormation={() => setView("chat")}
        />
      ) : view === "chat" ? (
        <div className="flex w-full flex-1 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col">
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
                  if (m.role === "widget" && m.widget === "name-check")
                    return <NameCheckCard key={m.id} companyName={m.companyName} />
                  if (m.role === "widget" && m.widget === "formed")
                    return <FormedCard key={m.id} answers={answers} />
                  return null
                })}
                {isTyping && <TypingIndicator />}
              </div>
            </div>

            {activeInput && (
              <div className="border-t border-border bg-white/80 backdrop-blur px-4 py-4 sm:px-8 lg:px-12">
                <div className="mx-auto max-w-2xl">
                  <ChatInput input={activeInput} answers={answers} onSubmit={handleSubmit} />
                </div>
              </div>
            )}
          </div>

          <aside className="hidden w-72 shrink-0 border-l border-border bg-card/40 xl:block 2xl:w-80">
            {hasDocs ? <DocumentTracker statuses={docStatuses} /> : <DocumentTrackerEmpty />}
          </aside>
        </div>
      ) : view === "compliance" ? (
        <ComplianceView key={complianceKey} answers={answers} />
      ) : (
        <TransactionsOnboarding key={transactionsKey} />
      )}
    </div>
  )
}
