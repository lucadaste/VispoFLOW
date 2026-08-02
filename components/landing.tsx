"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ArrowRight, Building2, ShieldCheck, ArrowLeftRight, FileText, UserRoundPen, Send, CheckCircle2 } from "lucide-react"
import { BotMessage, UserMessage, TypingIndicator } from "@/components/chat-message"
import { cn } from "@/lib/utils"

type Path = "formation" | "compliance" | "transactions" | "documents" | "questions"
type Message = { role: "user" | "assistant"; content: string }

const FAQS: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["incorporate", "incorporation", "form a company", "start a company", "create a company", "set up a company"],
    answer: "To incorporate a Delaware C-Corp, you file a Certificate of Incorporation with the Delaware Secretary of State (~$90 fee), appoint a registered agent, adopt bylaws, issue founder stock, and hold an organizational board meeting. Vispo Labs walks you through all of these steps in the Formation flow.",
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
    answer: "Bylaws are your corporation's internal rulebook — they cover how meetings are run, how directors are elected, officer roles, and voting procedures. Delaware law gives you a lot of flexibility. Standard startup bylaws are fairly templated.",
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
    answer: "When you issue stock to founders or raise money, you're technically selling securities. You file an exemption (like Regulation D / Rule 506(b)) with the SEC within 15 days of the first sale. States may have their own notice filings too.",
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
    answer: "For simple standard incorporations, many founders use self-service platforms (Stripe Atlas, Clerky, Vispo Labs). Once you're raising a priced round or dealing with complex equity arrangements, a startup attorney — especially one who knows Delaware corporate law — is worth the cost.",
  },
]

function getLocalResponse(input: string): string {
  const lower = input.toLowerCase()
  for (const faq of FAQS) {
    if (faq.keywords.some((k) => lower.includes(k))) return faq.answer
  }
  return "That's a great question. For specifics on your situation, we'd recommend consulting a startup attorney — but feel free to keep asking and I'll help with what I can. When you're ready, pick one of the sections above."
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`

export function Landing({
  onSelect,
  onOpenProfile,
  profileComplete,
  incorporationStatus,
  complianceCount,
  complianceSignedCount,
  transactionCount,
  docsCount,
}: {
  onSelect: (path: Path, message?: string) => void
  onOpenProfile: () => void
  profileComplete: boolean
  incorporationStatus: { started: boolean; completed: number; total: number; signed: number }
  complianceCount: number
  complianceSignedCount: number
  transactionCount: number
  docsCount: number
}) {
  const incorporationDone = incorporationStatus.started && incorporationStatus.completed >= incorporationStatus.total
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [value, setValue] = useState("")
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Skip on initial mount so the full welcome message is visible from the top;
    // only snap to bottom once the conversation actually has something new in it.
    if (messages.length === 0 && !isTyping) return
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" })
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

  const handleSubmit = () => {
    const t = value.trim()
    if (!t || isTyping) return
    setValue("")
    sendMessage(t)
  }

  const incorporationLabel = !incorporationStatus.started
    ? "Not started"
    : incorporationStatus.signed >= incorporationStatus.total
    ? `All ${plural(incorporationStatus.total, "document")} complete`
    : `${incorporationStatus.completed} of ${incorporationStatus.total} documents drafted`

  return (
    <div className="relative flex flex-1 flex-col items-center bg-background px-4 pt-6 sm:px-6 overflow-hidden">
      {/* Soft ambient color wash behind the whole page */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-400/25 via-indigo-300/15 to-transparent blur-3xl" />
        <div className="absolute -top-20 left-[8%] h-64 w-64 rounded-full bg-amber-300/15 blur-3xl" />
        <div className="absolute -top-10 right-[10%] h-64 w-64 rounded-full bg-sky-300/15 blur-3xl" />
      </div>

      <div className="w-full max-w-xl shrink-0 space-y-1 text-center">
        <p className="text-[11px] font-medium uppercase tracking-wider text-primary/70">Your startup, on rails</p>
        <h1 className="font-serif text-xl font-semibold tracking-tight text-foreground sm:text-2xl">What would you like to take care of?</h1>
      </div>

      {/* Quick-access utility, pulled out of the main journey below */}
      <button
        type="button"
        onClick={onOpenProfile}
        className="group mt-3 inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <UserRoundPen className={cn("h-3.5 w-3.5", profileComplete ? "text-success" : "text-primary")} />
        {profileComplete ? "Company info & signature saved" : "Save your company info and signature"}
        <ArrowRight className="h-3 w-3 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* The guided path through the 4 core sections of the product */}
      <div className="mt-4 w-full max-w-xl shrink-0">
        {[
          {
            path: "formation" as const,
            accent: "violet" as const,
            icon: <Building2 className="h-5 w-5" />,
            title: "Incorporation",
            description: "Turn your startup into a legally incorporated Delaware C-Corp through a guided flow.",
            status: incorporationLabel,
            done: incorporationDone,
          },
          {
            path: "compliance" as const,
            accent: "emerald" as const,
            icon: <ShieldCheck className="h-5 w-5" />,
            title: "Compliance",
            description: "Complete your required post-formation filings — EIN, 83(b), state registrations.",
            status:
              complianceCount === 0
                ? "Not started"
                : complianceSignedCount >= complianceCount
                ? `All ${plural(complianceCount, "filing")} complete`
                : `${plural(complianceCount, "filing")} drafted`,
            done: complianceCount > 0,
          },
          {
            path: "transactions" as const,
            accent: "amber" as const,
            icon: <ArrowLeftRight className="h-5 w-5" />,
            title: "Transactions",
            description: "Prepare documents for fundraising, equity grants, and other company transactions.",
            status: transactionCount === 0 ? "No documents yet" : `${plural(transactionCount, "document")} prepared`,
            done: transactionCount > 0,
          },
          {
            path: "documents" as const,
            accent: "sky" as const,
            icon: <FileText className="h-5 w-5" />,
            title: "My Docs",
            description: "Every document you've generated, in one place — view, sign, and download.",
            status: docsCount === 0 ? "No documents saved yet" : `${plural(docsCount, "document")} saved`,
            done: docsCount > 0,
          },
        ].map((step, i, arr) => (
          <StepRow key={step.path} {...step} isLast={i === arr.length - 1} onClick={() => onSelect(step.path)} />
        ))}
      </div>

      {/* Divider — fixed */}
      <div className="w-full max-w-2xl flex items-center gap-3 mt-3 shrink-0">
        <div className="flex-1 border-t border-border/60" />
        <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">or ask a question</span>
        <div className="flex-1 border-t border-border/60" />
      </div>

      {/* Chat area — scrollable, grows with messages */}
      <div ref={chatRef} className="flex-1 overflow-y-auto w-full max-w-2xl py-5 space-y-4">
        {(() => {
          const lastAssistantIndex = messages.reduce((last, mm, idx) => (mm.role === "assistant" ? idx : last), -1)
          return (
            <>
              <BotMessage showIcon={lastAssistantIndex === -1 && !isTyping}>
                Hi there — think of me as your legal co-pilot for getting a startup off the ground. I can help you incorporate as a Delaware C-Corp, stay on top of what comes after (EIN, 83(b), state filings), put together documents when you're raising money or granting equity, and keep everything signed and organized once it's done. Pick a section above, or just ask me a question to get your bearings.
              </BotMessage>

              {messages.map((m, i) =>
                m.role === "assistant"
                  ? (
                    <BotMessage key={i} showIcon={i === lastAssistantIndex && !isTyping}>
                      {m.content}
                    </BotMessage>
                  )
                  : <UserMessage key={i}>{m.content}</UserMessage>
              )}
            </>
          )
        })()}

        {isTyping && <TypingIndicator />}
      </div>

      {/* Input — fixed at bottom */}
      <div className="w-full max-w-2xl pb-8 shrink-0">
        <div className="relative rounded-[0.875rem] bg-border p-[2px]">
          <div className="relative z-10 flex items-center gap-2 rounded-xl bg-card p-1.5 shadow-sm">
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Ask a question…"
              disabled={isTyping}
              className="flex-1 bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60 disabled:opacity-60"
            />
            <button
              onClick={handleSubmit}
              disabled={!value.trim() || isTyping}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
            >
              Send <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Vispo Labs is an AI-assisted guide. Always consult a licensed attorney for legal advice.
        </p>
      </div>
    </div>
  )
}

const ACCENTS = {
  violet: {
    ring: "bg-violet-500/10 text-violet-600 group-hover:bg-violet-500/15",
    line: "bg-violet-400",
    status: "text-violet-600",
    glow: "group-hover:shadow-violet-500/20",
  },
  emerald: {
    ring: "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500/15",
    line: "bg-emerald-400",
    status: "text-emerald-600",
    glow: "group-hover:shadow-emerald-500/20",
  },
  amber: {
    ring: "bg-amber-500/10 text-amber-600 group-hover:bg-amber-500/15",
    line: "bg-amber-400",
    status: "text-amber-600",
    glow: "group-hover:shadow-amber-500/20",
  },
  sky: {
    ring: "bg-sky-500/10 text-sky-600 group-hover:bg-sky-500/15",
    line: "bg-sky-400",
    status: "text-sky-600",
    glow: "group-hover:shadow-sky-500/20",
  },
} as const

function StepRow({
  icon,
  title,
  description,
  status,
  accent,
  done,
  isLast,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  status: string
  accent: keyof typeof ACCENTS
  done: boolean
  isLast: boolean
  onClick: () => void
}) {
  const colors = ACCENTS[accent]
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-stretch gap-3.5 rounded-xl border border-transparent px-2 py-1.5 text-left transition-colors hover:border-border"
    >
      {/* Node + connecting rail */}
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm ring-4 ring-background transition-all group-hover:scale-105 group-hover:shadow-lg",
            colors.ring,
            colors.glow,
          )}
        >
          {icon}
        </span>
        {!isLast && (
          <span className={cn("mt-1 w-0.5 flex-1 rounded-full transition-colors", done ? colors.line : "bg-border")} />
        )}
      </div>

      <div className="min-w-0 flex-1 pb-2 pt-1">
        <div className="flex items-center justify-between gap-2">
          <p className="font-serif text-sm font-semibold text-foreground">{title}</p>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
        <p className={cn("mt-1 flex items-center gap-1 text-[11px] font-medium", done ? colors.status : "text-muted-foreground")}>
          {done && <CheckCircle2 className="h-3 w-3" />}
          {status}
        </p>
      </div>
    </button>
  )
}
