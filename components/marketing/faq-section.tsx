"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const FAQS = [
  {
    q: "Is Vispo Labs a law firm?",
    a: "No. Vispo Labs is an AI-assisted guide that drafts and organizes standard startup documents. It doesn't provide legal advice, and for anything outside standard templates we'll point you toward a licensed startup attorney.",
  },
  {
    q: "Why incorporate as a Delaware C-Corp?",
    a: "Delaware C-Corps are the standard for venture-backed startups — Delaware has well-established corporate law and most VCs require it before investing. Vispo Labs' Formation flow is built around this structure.",
  },
  {
    q: "What does it cost to get started?",
    a: "Getting started and drafting your documents in Vispo Labs is free. You're still responsible for any government filing fees, like Delaware's ~$90 incorporation fee, which are separate from using the product.",
  },
  {
    q: "How long does incorporation take?",
    a: "Most founders finish the guided Formation chat in about 15 minutes. From there, actually filing your Certificate of Incorporation with Delaware typically takes 1–3 business days.",
  },
  {
    q: "What happens after I incorporate?",
    a: "Head to the Compliance Center for the filings that come next — your EIN, 83(b) elections, and registered agent setup — and the Transactions library whenever you need a SAFE, offer letter, or other agreement.",
  },
  {
    q: "Can my co-founders and directors sign too?",
    a: "Yes. Vispo Labs knows exactly who needs to sign each document — officers, directors, or individual founders — and can send a signature request by email to each of them, so you're not stuck forwarding PDFs around yourself.",
  },
  {
    q: "Is my information secure?",
    a: "Your account data is tied to your sign-in and stored so you can pick up exactly where you left off across devices. We don't share your company information with anyone outside of the filings you choose to send.",
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border py-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="text-sm font-semibold text-foreground sm:text-base">{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{a}</p>}
    </div>
  )
}

export function FaqSection() {
  return (
    <section id="faq" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Frequently asked questions
        </h2>
        <div className="mt-10">
          {FAQS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  )
}
