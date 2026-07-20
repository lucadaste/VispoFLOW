"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Send } from "lucide-react"
import { BotMessage, UserMessage, TypingIndicator } from "@/components/chat-message"

type Message = { role: "user" | "assistant"; content: string }

const FAQS: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["incorporate", "incorporation", "form a company", "start a company", "create a company", "set up a company"],
    answer: "To incorporate a Delaware C-Corp, you file a Certificate of Incorporation with the Delaware Secretary of State (~$90 fee), appoint a registered agent, adopt bylaws, issue founder stock, and hold an organizational board meeting. Vispo walks you through all of these steps in the Formation flow.",
  },
  {
    keywords: ["why delaware", "delaware c-corp", "why c corp", "why not llc"],
    answer: "Delaware C-Corps are the gold standard for venture-backed startups. Delaware has well-established corporate law, a dedicated Court of Chancery, and most VCs specifically require a Delaware C-Corp before investing. LLCs are simpler but can't issue preferred stock and complicate fundraising.",
  },
  {
    keywords: ["ein", "employer identification number", "tax id", "federal tax"],
    answer: "An EIN (Employer Identification Number) is your company's federal tax ID — like a Social Security number for the business. You need one to open a bank account, hire employees, and file taxes. You can apply free at IRS.gov and get it immediately online.",
  },
  {
    keywords: ["83b", "83(b)", "vesting", "founder stock", "early exercise"],
    answer: "An 83(b) election is a form you file with the IRS within 30 days of receiving restricted founder stock. It lets you pay taxes now on the stock's current low value rather than later when it's worth more. Missing the 30-day window is one of the costliest founder mistakes — it can't be undone.",
  },
  {
    keywords: ["cap table", "capitalization", "shares", "equity", "ownership"],
    answer: "A cap table tracks who owns what percentage of your company. At incorporation, founders typically receive common stock. Later rounds add preferred stock for investors. Tools like Carta or Pulley help manage it, but your cap table starts with the shares you issue at incorporation.",
  },
  {
    keywords: ["registered agent", "resident agent"],
    answer: "A registered agent is a person or service with a physical address in Delaware that accepts legal documents on your behalf. You're required to have one. Many founders use a service like Registered Agents Inc. or Northwest (~$50–150/yr) rather than listing a personal address.",
  },
  {
    keywords: ["bylaws", "bylaw"],
    answer: "Bylaws are your corporation's internal rulebook — they cover how meetings are run, how directors are elected, officer roles, and voting procedures. Delaware law gives you a lot of flexibility. Standard startup bylaws are fairly templated; your attorney or a service like Clerky provides them.",
  },
  {
    keywords: ["board", "directors", "board of directors"],
    answer: "A Delaware C-Corp is governed by a board of directors. At formation, founders typically constitute the initial board. As you raise money, investors will often require board seats. The board approves major decisions like equity grants, fundraising, and officer appointments.",
  },
  {
    keywords: ["fundraise", "fundraising", "raise money", "seed round", "series a", "investor", "vc", "venture capital"],
    answer: "Before you raise money, you need to be incorporated (Delaware C-Corp), have a clean cap table, and complete your founder equity grants with 83(b) elections filed. Most seed rounds use a SAFE note or convertible note — both delay pricing until a priced round.",
  },
  {
    keywords: ["safe", "simple agreement", "convertible note", "priced round"],
    answer: "A SAFE (Simple Agreement for Future Equity) is the most common way to raise pre-seed and seed money. Investors give you cash now in exchange for the right to convert into equity at a future priced round. Y Combinator publishes the standard SAFE templates for free.",
  },
  {
    keywords: ["california", "qualification", "foreign qualification", "foreign corporation", "state filing"],
    answer: "If your Delaware corporation operates in California (office, employees, or doing business there), you must register as a foreign corporation with the California Secretary of State. This costs ~$100 and requires a California registered agent. Similar rules apply in other states.",
  },
  {
    keywords: ["securities", "securities filing", "regulation d", "rule 506", "form d"],
    answer: "When you issue stock to founders or raise money, you're technically selling securities. You file an exemption (like Regulation D / Rule 506(b)) with the SEC within 15 days of the first sale. States may have their own notice filings too. Vispo's Compliance Center covers these.",
  },
  {
    keywords: ["cost", "how much", "price", "fee", "expensive"],
    answer: "Basic Delaware incorporation costs ~$90 in state fees. If you use a service like Stripe Atlas or Clerky, expect $500–2,000. An attorney runs $2,000–8,000+. Ongoing costs: ~$300/yr Delaware franchise tax (minimum), registered agent fees, and state filing fees in states where you operate.",
  },
  {
    keywords: ["how long", "timeline", "time", "fast", "quickly"],
    answer: "Delaware incorporation can be done in 1–3 business days (or same-day for an extra fee). EIN is immediate online. Bylaws and organizational minutes can be done the same day. An 83(b) election must be filed within 30 days of stock issuance. Full setup typically takes 1–2 weeks.",
  },
  {
    keywords: ["attorney", "lawyer", "legal advice", "counsel"],
    answer: "For simple standard incorporations, many founders use self-service platforms (Stripe Atlas, Clerky, Vispo). Once you're raising a priced round or dealing with complex equity arrangements, a startup attorney — especially one who knows Delaware corporate law — is worth the cost.",
  },
]

const GREETING = "Hi! I'm your Vispo assistant. Ask me anything about incorporating your company, equity structures, compliance filings, or founder agreements."

function getLocalResponse(input: string): string {
  const lower = input.toLowerCase()
  for (const faq of FAQS) {
    if (faq.keywords.some((k) => lower.includes(k))) return faq.answer
  }
  return "That's a great question. For specifics on your situation, we'd recommend consulting a startup attorney — but feel free to keep asking and I'll help with what I can. When you're ready to start incorporating, click \"Start formation\" below."
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function HomeChat({
  initialMessage,
  onStartFormation,
}: {
  initialMessage?: string
  onStartFormation: () => void
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentInitial = useRef(false)

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return

    setMessages((m) => [...m, { role: "user", content: trimmed }])
    setIsTyping(true)

    const answer = getLocalResponse(trimmed)
    await delay(Math.min(1400, Math.max(600, answer.length * 14)))

    setIsTyping(false)
    setMessages((m) => [...m, { role: "assistant", content: answer }])
  }, [isTyping])

  useEffect(() => {
    if (sentInitial.current) return
    sentInitial.current = true

    if (initialMessage) {
      sendMessage(initialMessage)
    } else {
      setMessages([{ role: "assistant", content: GREETING }])
    }
  }, [initialMessage, sendMessage])

  const handleSubmit = () => {
    const t = input.trim()
    if (!t || isTyping) return
    setInput("")
    sendMessage(t)
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((m, i) =>
            m.role === "assistant" ? (
              <BotMessage key={i}>{m.content}</BotMessage>
            ) : (
              <UserMessage key={i}>{m.content}</UserMessage>
            ),
          )}

          {isTyping && <TypingIndicator />}

          {messages.some((m) => m.role === "assistant") && !isTyping && (
            <div className="flex justify-center pt-2">
              <button
                onClick={onStartFormation}
                className="rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                Ready to incorporate → Start formation
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-white/80 backdrop-blur px-4 py-4 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
              placeholder="Ask a question…"
              disabled={isTyping}
              className="flex-1 bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60 disabled:opacity-60"
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isTyping}
              className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 disabled:opacity-40"
            >
              Send <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Vispo is an AI-assisted guide. Always consult a licensed attorney for legal advice.
          </p>
        </div>
      </div>
    </div>
  )
}
