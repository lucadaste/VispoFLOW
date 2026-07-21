"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Send } from "lucide-react"
import { BotMessage, UserMessage } from "@/components/chat-message"
import { type FlowAnswers, initialAnswers } from "@/lib/flow"

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

type ChatMessage =
  | { id: number; role: "bot"; text: string }
  | { id: number; role: "user"; text: string }

type Phase = "start" | "company-name" | "incorporator" | "address" | "done"

const SUGGESTIONS = [
  "Walk me through everything",
  "I need to get an EIN",
  "I need to file an 83(b) election",
  "I need to qualify in my state",
  "I have questions",
]

const START_RESPONSES: Record<string, string> = {
  "Walk me through everything":
    "Perfect — let's get your compliance dashboard set up. I just need a few quick details. What is the legal name of your corporation?",
  "I need to get an EIN":
    "Getting your EIN is the first step. Let me pull up your dashboard so we can get that filed. What is the legal name of your corporation?",
  "I need to file an 83(b) election":
    "The 83(b) is time-sensitive, so let's move quickly. What is the legal name of your corporation?",
  "I need to qualify in my state":
    "State qualification is important if you're operating outside Delaware. Let me set up your dashboard first — what is the legal name of your corporation?",
  "I have questions":
    "Happy to help with any questions you have. Let me set up your compliance dashboard so I have your details on hand — what is the legal name of your corporation?",
}

const fieldClass =
  "flex-1 bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60"

export function ComplianceOnboarding({
  onComplete,
}: {
  onComplete: (answers: FlowAnswers) => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [phase, setPhase] = useState<Phase>("start")
  const [value, setValue] = useState("")
  const [answers, setAnswers] = useState<FlowAnswers>(initialAnswers)
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
    pushBot("Hi! I can help you manage your post-incorporation compliance. What would you like to work on?")
  }, [pushBot])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const handleStart = useCallback((text: string) => {
    pushUser(text)
    const response =
      START_RESPONSES[text] ??
      "I can help with that. First, let me set up your compliance dashboard. What is the legal name of your corporation?"
    pushBot(response)
    setPhase("company-name")
  }, [pushBot, pushUser])

  const handleSubmit = useCallback(async () => {
    const text = value.trim()
    if (!text) return
    setValue("")

    if (phase === "start") {
      handleStart(text)
      return
    }

    pushUser(text)

    if (phase === "company-name") {
      setAnswers((a) => ({ ...a, companyName: text }))
      pushBot("Got it. And what is your full legal name?")
      setPhase("incorporator")
    } else if (phase === "incorporator") {
      setAnswers((a) => ({ ...a, incorporatorName: text }))
      pushBot("Almost there — what is the corporation's principal address?")
      setPhase("address")
    } else if (phase === "address") {
      const finalAnswers = { ...answers, corpAddress: text }
      pushBot(`Got it — setting up your compliance dashboard for ${answers.companyName}.`)
      setPhase("done")
      await delay(600)
      onComplete(finalAnswers)
    }
  }, [value, phase, answers, handleStart, pushBot, pushUser, onComplete])

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

      <div className="border-t border-border bg-white/80 backdrop-blur px-4 py-4 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl space-y-2.5">
          {phase === "start" && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStart(s)}
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
              placeholder={phase === "start" ? "Type a message…" : "Type your answer…"}
              disabled={phase === "done"}
              autoFocus={phase !== "start"}
              className={`${fieldClass} disabled:opacity-60`}
            />
            <button
              onClick={handleSubmit}
              disabled={!value.trim() || phase === "done"}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
            >
              Send <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
