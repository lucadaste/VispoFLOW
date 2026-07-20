"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send } from "lucide-react"
import { cn } from "@/lib/utils"

type Message = { role: "bot" | "user"; text: string }

const FAQS: { q: string; a: string }[] = [
  {
    q: "Where do I start?",
    a: "Start with the EIN — it's your company's federal tax ID and you'll need it for almost everything else, including opening a bank account. It's free and takes about 10 minutes on the IRS website.",
  },
  {
    q: "What is an EIN?",
    a: "An EIN (Employer Identification Number) is like a Social Security number for your company. The IRS uses it to identify your business for tax purposes. You need one to open a business bank account, hire employees, and file taxes.",
  },
  {
    q: "What is an 83(b) election?",
    a: "An 83(b) election is a form you file with the IRS within 30 days of receiving founder stock. It lets you pay taxes now on the current (low) value of the stock rather than later when it's worth more. Missing this deadline is one of the most common and costly founder mistakes — don't skip it.",
  },
  {
    q: "What is California Qualification?",
    a: "If your Delaware corporation does business in California (e.g. your office or employees are here), you must register as a 'foreign corporation' with the California Secretary of State. This is separate from your Delaware incorporation.",
  },
  {
    q: "What is a registered agent?",
    a: "A registered agent is a person or company with a physical California address who accepts legal documents on behalf of your corporation. You're required to have one if you're doing business in California. Many founders use a registered agent service (~$50–150/yr).",
  },
  {
    q: "What are securities filings?",
    a: "When you issue stock to founders or employees, that's technically selling a security. Federal and state law require you to file notices (called exemptions) so you don't need to do a full public offering registration. These are usually simple one-page forms.",
  },
  {
    q: "How long does all this take?",
    a: "Most filings can be completed in a few days to a few weeks. The EIN is immediate online. The 83(b) election must be done within 30 days of stock issuance. California qualification takes 1–3 weeks. Securities notices are usually filed within 15 days of the stock issuance.",
  },
]

function getBotResponse(input: string): string {
  const lower = input.toLowerCase()
  for (const faq of FAQS) {
    const keywords = faq.q.toLowerCase().split(" ").filter((w) => w.length > 3)
    if (keywords.some((k) => lower.includes(k))) return faq.a
  }
  return "That's a great question. For anything specific to your situation, we'd recommend consulting with a startup attorney — but feel free to ask more and I'll help with what I can."
}

export function ComplianceChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi! I can help explain what you're looking at. What would you like to know?" },
  ])
  const [value, setValue] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, open])

  const send = (text: string) => {
    const t = text.trim()
    if (!t) return
    setValue("")
    const userMsg: Message = { role: "user", text: t }
    const botMsg: Message = { role: "bot", text: getBotResponse(t) }
    setMessages((m) => [...m, userMsg, botMsg])
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex h-13 w-13 items-center justify-center rounded-full shadow-lg transition-all",
          open ? "bg-foreground text-background" : "bg-primary text-primary-foreground hover:opacity-90",
        )}
        style={{ height: 52, width: 52 }}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 flex w-80 flex-col rounded-2xl border border-border bg-card shadow-xl sm:w-96" style={{ height: 480 }}>
          {/* Header */}
          <div className="flex items-center gap-2.5 rounded-t-2xl border-b border-border bg-primary px-4 py-3">
            <MessageCircle className="h-4 w-4 text-primary-foreground" />
            <p className="text-sm font-semibold text-primary-foreground">Compliance Help</p>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "bot"
                      ? "bg-secondary text-foreground rounded-tl-sm"
                      : "bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-tr-sm",
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* FAQ chips */}
          <div className="border-t border-border px-3 pt-3 pb-1 flex flex-wrap gap-1.5">
            {FAQS.slice(0, 4).map((faq) => (
              <button
                key={faq.q}
                onClick={() => send(faq.q)}
                className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {faq.q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(value)}
              placeholder="Ask a question…"
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
            <button
              onClick={() => send(value)}
              disabled={!value.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors hover:bg-secondary/70 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
