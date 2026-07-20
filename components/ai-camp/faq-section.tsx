"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    q: "Who is the AI Camp for?",
    a: "Managers, executives, and innovators who want to apply AI to their business — not engineers. No technical background is required; we meet you where you are.",
  },
  {
    q: "Do I need to prepare anything?",
    a: "Yes. Each participant brings one real business challenge. Before the camp, our team works with you to frame it so partner sessions are immediately productive.",
  },
  {
    q: "Where does the program take place?",
    a: "In the San Francisco Bay Area, at partner offices and dedicated workshop spaces. We handle the logistics and curated company visits.",
  },
  {
    q: "How are partner companies selected?",
    a: "We curate the partner line-up for each cohort based on the industries and challenges represented, so the matches are relevant to your goals.",
  },
  {
    q: "What's included in the price?",
    a: "All sessions, partner workshops, materials, curated meals, and networking events. Travel and accommodation are arranged separately, with recommendations provided.",
  },
  {
    q: "Can my company send a team?",
    a: "Absolutely. Many organizations send 2-4 leaders together. Team and corporate rates are available — mention it in your application.",
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-foreground/15">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-medium text-foreground">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{a}</p>}
    </div>
  )
}

export function FaqSection() {
  return (
    <section id="faq" className="border-t border-foreground/15 bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">FAQ</span>
          <h2 className="mt-3 text-balance font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
            Frequently asked <span className="italic">questions</span>
          </h2>
        </div>
        <div className="mt-10 border-t border-foreground/15">
          {faqs.map((f) => (
            <FaqItem key={f.q} {...f} />
          ))}
        </div>
      </div>
    </section>
  )
}
