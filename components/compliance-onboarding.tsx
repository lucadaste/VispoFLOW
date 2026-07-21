"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Send } from "lucide-react"
import { BotMessage, UserMessage } from "@/components/chat-message"
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
  const [stepIndex, setStepIndex] = useState(0)
  const [value, setValue] = useState("")
  const [answers, setAnswers] = useState<FlowAnswers>(initialAnswers)
  const scrollRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)
  const startedRef = useRef(false)

  const pushBot = useCallback((text: string) => {
    setMessages((m) => [...m, { id: ++idRef.current, role: "bot", text }])
  }, [])

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    pushBot("Welcome! Let's get your existing corporation set up for compliance.")
    pushBot(STEPS[0].message)
  }, [pushBot])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const submit = useCallback(async () => {
    if (!value.trim()) return
    const step = STEPS[stepIndex]
    const text = value.trim()
    setValue("")

    setMessages((m) => [...m, { id: ++idRef.current, role: "user", text }])
    const newAnswers = { ...answers, [step.field]: text }
    setAnswers(newAnswers)

    const next = stepIndex + 1
    if (next < STEPS.length) {
      pushBot(STEPS[next].message)
      setStepIndex(next)
    } else {
      pushBot(`Got it — setting up your compliance dashboard for ${newAnswers.companyName}.`)
      await delay(600)
      onComplete(newAnswers)
    }
  }, [value, stepIndex, answers, pushBot, onComplete])

  const currentStep = STEPS[stepIndex]
  const showInput = stepIndex < STEPS.length && messages.length > 0

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
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
              >
                Send <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
