"use client"

import { useState } from "react"
import { Check } from "lucide-react"

type Track = {
  id: string
  days: string
  name: string
  tagline: string
  agenda: { day: string; title: string; detail: string }[]
}

const tracks: Track[] = [
  {
    id: "3day",
    days: "3 Days",
    name: "Essentials",
    tagline: "A focused immersion into AI for business leaders.",
    agenda: [
      {
        day: "Day 1",
        title: "Foundations & landscape",
        detail: "The state of applied AI, live demos from Bay Area startups, and mapping opportunities in your business.",
      },
      {
        day: "Day 2",
        title: "Hands-on with AI companies",
        detail: "Working sessions with 2-3 partner companies applying their tools to your challenge.",
      },
      {
        day: "Day 3",
        title: "Roadmap & pitch",
        detail: "Build and present your 90-day AI adoption roadmap with feedback from founders.",
      },
    ],
  },
  {
    id: "4day",
    days: "4 Days",
    name: "Accelerator",
    tagline: "Deeper partner time plus an investor & ecosystem day.",
    agenda: [
      {
        day: "Day 1",
        title: "Foundations & landscape",
        detail: "The state of applied AI, live demos, and opportunity mapping for your organization.",
      },
      {
        day: "Day 2",
        title: "Hands-on with AI companies",
        detail: "Deep working sessions with partner companies applying their solutions to your use cases.",
      },
      {
        day: "Day 3",
        title: "Ecosystem & investors",
        detail: "Meet VCs and operators. Understand how capital and AI strategy intersect.",
      },
      {
        day: "Day 4",
        title: "Roadmap & pitch",
        detail: "Refine and present your adoption roadmap with structured founder feedback.",
      },
    ],
  },
  {
    id: "5day",
    days: "5 Days",
    name: "Executive Intensive",
    tagline: "The complete experience with a guided implementation sprint.",
    agenda: [
      {
        day: "Day 1",
        title: "Foundations & landscape",
        detail: "Applied AI landscape, live demos, and detailed opportunity mapping.",
      },
      {
        day: "Day 2",
        title: "Hands-on with AI companies",
        detail: "Working sessions with multiple partner companies on your real challenges.",
      },
      {
        day: "Day 3",
        title: "Ecosystem & investors",
        detail: "Meet VCs, operators, and researchers shaping the frontier.",
      },
      {
        day: "Day 4",
        title: "Implementation sprint",
        detail: "Build a working proof-of-concept with engineers from partner companies.",
      },
      {
        day: "Day 5",
        title: "Roadmap, pitch & alumni",
        detail: "Present to a panel, join the alumni network, and lock in next steps.",
      },
    ],
  },
]

export function ProgramSection() {
  const [active, setActive] = useState(tracks[2].id)
  const track = tracks.find((t) => t.id === active)!

  return (
    <section id="program" className="border-y border-foreground/15 bg-secondary py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            The program
          </span>
          <h2 className="mt-3 text-balance font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
            Choose the <span className="italic">format</span> that fits your schedule
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Three immersive tracks, all built on partnership with real Silicon Valley AI companies. Pick the
            depth that works for you.
          </p>
        </div>

        {/* Track selector */}
        <div className="mt-10 flex flex-wrap gap-px border border-foreground/15 bg-foreground/15 sm:inline-flex">
          {tracks.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={`flex flex-col items-start px-6 py-3 text-left transition-colors ${
                active === t.id
                  ? "bg-foreground text-background"
                  : "bg-background text-foreground hover:bg-secondary"
              }`}
            >
              <span className="text-base font-semibold">{t.days}</span>
              <span className={`text-xs ${active === t.id ? "text-background/70" : "text-muted-foreground"}`}>
                {t.name}
              </span>
            </button>
          ))}
        </div>

        {/* Agenda */}
        <div className="mt-8 border border-foreground/15 bg-background p-6 sm:p-8">
          <p className="text-lg font-medium text-foreground">{track.tagline}</p>
          <div className="mt-6 grid border-l border-t border-foreground/15 md:grid-cols-2 lg:grid-cols-3">
            {track.agenda.map((a) => (
              <div key={a.day} className="border-b border-r border-foreground/15 p-5">
                <span className="inline-flex items-center border border-foreground px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-foreground">
                  {a.day}
                </span>
                <h3 className="mt-3 font-semibold text-foreground">{a.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{a.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-foreground/15 pt-6">
            {["Curated partner matching", "1:1 founder mentorship", "Alumni network access", "Concierge logistics"].map(
              (perk) => (
                <span key={perk} className="inline-flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4" />
                  {perk}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
