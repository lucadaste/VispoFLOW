"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { BotMessage, UserMessage, TypingIndicator } from "@/components/chat-message"
import { type FlowAnswers, initialAnswers } from "@/lib/flow"
import { cn } from "@/lib/utils"

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const fieldClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20"

const labelClass = "mb-1 block text-xs font-medium text-muted-foreground"

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
    placeholder: "Acme Inc.",
  },
  {
    id: "incorporator",
    message: "What is your full name?",
    field: "incorporatorName",
    placeholder: "Jane Smith",
  },
  {
    id: "address",
    message: "What is the corporation's principal address?",
    field: "corpAddress",
    placeholder: "123 Main St, San Francisco, CA 94105",
    multiline: true,
  },
]

type ChatMessage =
  | { id: number; role: "bot"; text: string }
  | { id: number; role: "user"; text: string }

export function ComplianceOnboarding({
  onComplete,
}: {
  onComplete: (answers: FlowAnswers) => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
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

      {!isTyping && stepIndex < STEPS.length && messages.length > 0 && (
        <div className="border-t border-border bg-white/80 backdrop-blur px-4 py-4 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-xl border border-border bg-card p-3 shadow-sm space-y-3">
              <div>
                <label className={labelClass}>{currentStep.placeholder}</label>
                {currentStep.multiline ? (
                  <textarea
                    rows={2}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={currentStep.placeholder}
                    className={cn(fieldClass, "resize-none")}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit() } }}
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={currentStep.placeholder}
                    className={fieldClass}
                    onKeyDown={(e) => { if (e.key === "Enter") submit() }}
                  />
                )}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={submit}
                  disabled={!value.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
