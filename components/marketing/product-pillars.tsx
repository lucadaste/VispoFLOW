import { Building2, ShieldCheck, Handshake, FolderOpen } from "lucide-react"

const PILLARS = [
  {
    icon: Building2,
    name: "Formation",
    tagline: "Incorporate as a Delaware C-Corp",
    description:
      "A guided chat checks your company name, splits founder equity, and sets vesting terms — then drafts everything you need to legally form your company.",
    items: [
      "Certificate of Incorporation",
      "Bylaws & organizational resolutions",
      "Founder stock purchase agreements",
      "Equity incentive plan & option pool",
    ],
  },
  {
    icon: ShieldCheck,
    name: "Compliance Center",
    tagline: "Stay compliant after you incorporate",
    description:
      "Post-formation filings, annual state filings, and ongoing corporate governance — organized by category so you always know what's due next.",
    items: [
      "EIN application & 83(b) elections",
      "Delaware & California registered agent filings",
      "Annual reports & franchise tax filings",
      "Board & stockholder consents",
    ],
  },
  {
    icon: Handshake,
    name: "Transactions",
    tagline: "Paper every deal as it comes up",
    description:
      "A growing library of startup agreements — pick a category and fill in the blanks. Covers financing, hiring, customers, and commercial deals.",
    items: [
      "SAFEs, term sheets & founder loans",
      "Offer, consulting & advisor agreements",
      "NDAs, IP licenses & privacy policies",
      "Sales, reseller & SaaS agreements",
    ],
  },
  {
    icon: FolderOpen,
    name: "Document Library",
    tagline: "Every document, organized and signed",
    description:
      "Every document you generate — across formation, compliance, and transactions — lives in one place, ready to review, e-sign, or download.",
    items: [
      "One saved signature autofills every document",
      "Track what's drafted, filed, or pending",
      "Organized by company, not by flow",
      "Pick up exactly where you left off",
    ],
  },
]

export function ProductPillars() {
  return (
    <section id="product" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            One studio, four stages of your company's life
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Vispo Labs follows your company from its first filing through its first term sheet.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.name}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <pillar.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{pillar.name}</h3>
                  <p className="text-xs font-medium text-muted-foreground">{pillar.tagline}</p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>

              <ul className="mt-1 grid gap-2 border-t border-border pt-4 text-sm text-foreground/90 sm:grid-cols-2">
                {pillar.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
