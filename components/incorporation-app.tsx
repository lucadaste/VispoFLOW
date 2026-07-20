"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { TopBar } from "@/components/top-bar"
import { ComplianceOnboarding } from "@/components/compliance-onboarding"
import { Landing } from "@/components/landing"
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
import { ComplianceCenter } from "@/components/compliance-center"
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
  const [view, setView] = useState<"landing" | "chat" | "compliance" | "compliance-onboarding">("landing")
  const [formationComplete, setFormationComplete] = useState(false)

  const handlePhaseClick = (phase: "chat" | "compliance") => {
    if (phase === "chat") { setView("chat"); return }
    if (phase === "compliance") {
      setView(formationComplete ? "compliance" : "compliance-onboarding")
    }
  }

  const handleLandingSelect = (path: "formation" | "compliance" | "questions", message?: string) => {
    if (path === "compliance") { setView("compliance-onboarding"); return }
    setView("chat")
    if (path === "questions" && message) {
      requestAnimationFrame(() => {
        startedRef.current = false
      })
    }
  }

  const resolveMessage = useCallback((text: string) => {
    if (text === "__GREETING__") {
      return user?.firstName
        ? `Hello ${user.firstName}, how can I help you today?`
        : "Hello, how can I help you today?"
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
        setFormationComplete(true)
        setView("compliance")
        return
      }

      await playStep(activeStepIndex + 1)
    },
    [activeStepIndex, animateDocs, playStep, pushBot],
  )

  const reset = () => {
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

  const hasDocs = Object.keys(docStatuses).length > 0

  if (view === "landing") {
    return <Landing onSelect={handleLandingSelect} />
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      <TopBar
        phase={view === "compliance-onboarding" || view === "compliance" ? "compliance" : "chat"}
        onReset={() => { reset(); setView("landing") }}
        onPhaseClick={handlePhaseClick}
      />

      {view === "chat" ? (
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
      ) : view === "compliance-onboarding" ? (
        <ComplianceOnboarding onComplete={(a) => { setAnswers(a); setFormationComplete(true); setView("compliance") }} />
      ) : (
        <ComplianceCenter answers={answers} onBack={() => setView("chat")} />
      )}
    </div>
  )
}
