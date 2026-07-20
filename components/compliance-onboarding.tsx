"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { BotMessage, UserMessage, TypingIndicator } from "@/components/chat-message"
import { type FlowAnswers, initialAnswers } from "@/lib/flow"

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

type Step = {
  id: string
  message: string
  field: keyof FlowAnswers
  placeholder: string
  multiline?: boolean
}

const STEPS: Step[] = [
  {
    id: "company-name",
    message: "What is the legal name of your corporation?",
    field: "companyName",
    placeholder: "Full legal company name",
  },
  {
    id: "incorporator",
    message: "What is your full name?",
    field: "incorporatorName",
    placeholder: "Full legal name",
  },
  {
    id: "address",
    message: "What is the corporation's principal address?",
    field: "corpAddress",
    placeholder: "Full mailing address including city, state and zip",
    multiline: true,
  },
]

type ChatMessage =
  | { id: number; role: "bot"; text: string }
  | { id: number; role: "user"; text: string }

const fieldClass =
  "flex-1 bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60 resize-none"

export function ComplianceOnboarding({
  onComplete,
}: {
  onComplete: (answers: FlowAnswers) => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(true)
  const [stepIndex, setStepIndex] = useState(0)
  const [value, setValue] = useState("")
  const [answers, setAnswers] = useState<FlowAnswers>(initialAnswers)
  const scrollRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)
  const startedRef = useRef(false)

  const nextId = () => ++idRef.current

  const pushBot = useCallback(async (text: string) => {
    setIsTyping(true)
    await delay(800)
    setIsTyping(false)
    setMessages((m) => [...m, { id: nextId(), role: "bot", text }])
  }, [])

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    const run = async () => {
      await pushBot("Welcome! Let's get your existing corporation set up for compliance.")
      await delay(400)
      await pushBot(STEPS[0].message)
    }
    run()
  }, [pushBot])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, isTyping])

  const submit = useCallback(async () => {
    if (!value.trim()) return
    const step = STEPS[stepIndex]
    const text = value.trim()
    setValue("")

    setMessages((m) => [...m, { id: nextId(), role: "user", text }])
    const newAnswers = { ...answers, [step.field]: text }
    setAnswers(newAnswers)

    await delay(300)

    const next = stepIndex + 1
    if (next < STEPS.length) {
      await pushBot(STEPS[next].message)
      setStepIndex(next)
    } else {
      await pushBot(`Got it — setting up your compliance dashboard for ${newAnswers.companyName}.`)
      await delay(600)
      onComplete(newAnswers)
    }
  }, [value, stepIndex, answers, pushBot, onComplete])

  const currentStep = STEPS[stepIndex]
  const showInput = !isTyping && stepIndex < STEPS.length && messages.length > 0

  return (
    <div className="flex w-full flex-1 flex-col overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((m) =>
            m.role === "bot" ? (
              <BotMessage key={m.id}>{m.text}</BotMessage>
            ) : (
              <UserMessage key={m.id}>{m.text}</UserMessage>
            ),
          )}
          {isTyping && <TypingIndicator />}
        </div>
      </div>

      {showInput && (
        <div className="border-t border-border bg-white/80 backdrop-blur px-4 py-4 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm">
              {currentStep.multiline ? (
                <textarea
                  rows={2}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={currentStep.placeholder}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit() } }}
                  className={fieldClass}
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={currentStep.placeholder}
                  onKeyDown={(e) => { if (e.key === "Enter") submit() }}
                  className={fieldClass}
                  autoFocus
                />
              )}
              <button
                onClick={submit}
                disabled={!value.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors hover:bg-secondary/70 disabled:opacity-40"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
