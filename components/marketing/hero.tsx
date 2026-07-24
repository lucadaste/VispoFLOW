import Link from "next/link"
import { ArrowRight, FileCheck2, Send } from "lucide-react"

const CHECKLIST = [
  "Delaware C-Corp formation",
  "EIN & 83(b) filings",
  "SAFEs & 20+ deal documents",
  "E-signature built in",
]

const HEADER_OFFSET = 64

function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  e.preventDefault()
  const target = document.querySelector(href)
  if (!target) return
  const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
  window.scrollTo({ top, behavior: "smooth" })
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent-foreground">
              AI-guided startup legal studio
            </span>

            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
              Incorporate, stay compliant, and paper every deal — guided step by step.
            </h1>

            <p className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
              Vispo Labs turns the confusing parts of startup formation into a conversation. Answer a
              few questions and we draft, track, and organize every document your company needs —
              from your Certificate of Incorporation to your first SAFE.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Start incorporating
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                onClick={(e) => handleAnchorClick(e, "#how-it-works")}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                See how it works
              </a>
            </div>

            <ul className="mt-9 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm text-muted-foreground">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>

            <p className="mt-6 text-xs text-muted-foreground">
              Free to start. Vispo Labs is an AI-assisted guide, not a law firm — see{" "}
              <a
                href="#trust"
                onClick={(e) => handleAnchorClick(e, "#trust")}
                className="underline underline-offset-2 hover:text-foreground"
              >
                how we think about legal advice
              </a>
              .
            </p>
          </div>

          {/* Stylized preview of the guided chat product */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/10 via-transparent to-transparent blur-2xl" />
            <div className="rounded-2xl border border-border bg-card p-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
                <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/40" />
                <span className="ml-2 text-xs font-medium text-muted-foreground">Incorporation Center</span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/beaker.png" alt="" className="mt-0.5 h-7 w-7 shrink-0 object-contain" />
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-card-foreground shadow-sm ring-1 ring-border">
                    What would you like to name your company?
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-indigo-900 to-slate-900 px-3.5 py-2.5 text-[13px] leading-relaxed text-white shadow-sm">
                    Acme Technologies, Inc.
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-[11px] font-medium text-success ring-1 ring-success/20">
                    <FileCheck2 className="h-3 w-3" />
                    <span className="text-foreground/80">Drafted Certificate of Incorporation, Bylaws</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/beaker.png" alt="" className="mt-0.5 h-7 w-7 shrink-0 object-contain" />
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-card-foreground shadow-sm ring-1 ring-border">
                    Next, let's set up your founder equity split.
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-background/60 p-1.5">
                <span className="flex-1 px-2.5 py-1.5 text-[13px] text-muted-foreground/60">Ask a question…</span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground">
                  Send <Send className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
