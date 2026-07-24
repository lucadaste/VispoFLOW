import { Scale, Compass } from "lucide-react"

const ROADMAP = [
  "Direct e-filing with the Delaware Secretary of State and other agencies",
  "A vetted attorney network for questions beyond standard templates",
  "Live cap table syncing as new equity documents are signed",
]

export function TrustSection() {
  return (
    <section id="trust" className="border-t border-border bg-secondary/40 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Scale className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Built to guide you, not replace your lawyer
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              Vispo Labs is an AI-assisted guide that automates the paperwork founders redo for every
              company — it isn't a law firm and doesn't provide legal advice. For complex equity
              structures, unusual fundraising terms, or disputes, we'll always point you toward a
              licensed startup attorney.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">What we're building next</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              Today, Vispo Labs drafts and organizes your documents and walks you through where each
              one gets filed or sent. Here's what's still on the roadmap:
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-foreground/90">
              {ROADMAP.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
