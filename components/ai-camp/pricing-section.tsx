import { Check, ArrowRight } from "lucide-react"

const tiers = [
  {
    name: "Essentials",
    days: "3 days",
    price: "€4,900",
    description: "A focused introduction to applied AI for your business.",
    features: [
      "3 days of immersive sessions",
      "2-3 partner AI company workshops",
      "90-day adoption roadmap",
      "Cohort networking dinner",
    ],
    featured: false,
  },
  {
    name: "Accelerator",
    days: "4 days",
    price: "€6,400",
    description: "Deeper partner time plus the investor & ecosystem day.",
    features: [
      "Everything in Essentials",
      "Extended partner working sessions",
      "Investor & ecosystem day",
      "1:1 founder mentorship hour",
    ],
    featured: true,
  },
  {
    name: "Executive Intensive",
    days: "5 days",
    price: "€8,900",
    description: "The complete experience with a hands-on build sprint.",
    features: [
      "Everything in Accelerator",
      "Proof-of-concept build sprint",
      "Panel presentation & feedback",
      "Lifetime alumni network access",
    ],
    featured: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Investment
          </span>
          <h2 className="mt-3 text-balance font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
            Choose your <span className="italic">track</span>
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Per participant, excluding travel and accommodation. Team and corporate rates available on request.
          </p>
        </div>

        <div className="mt-12 grid border-l border-t border-foreground/15 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col border-b border-r border-foreground/15 p-8 ${
                tier.featured ? "bg-foreground text-background" : "bg-background"
              }`}
            >
              {tier.featured && (
                <span className="absolute right-8 top-8 border border-background/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-background">
                  Popular
                </span>
              )}
              <div className="flex items-baseline justify-between">
                <h3 className={`text-lg font-semibold ${tier.featured ? "text-background" : "text-foreground"}`}>
                  {tier.name}
                </h3>
                <span
                  className={`text-xs font-medium uppercase tracking-wide ${
                    tier.featured ? "text-background/60" : "text-muted-foreground"
                  }`}
                >
                  {tier.days}
                </span>
              </div>
              <p className={`mt-2 text-sm leading-relaxed ${tier.featured ? "text-background/70" : "text-muted-foreground"}`}>
                {tier.description}
              </p>
              <p className={`mt-5 font-serif text-4xl font-semibold ${tier.featured ? "text-background" : "text-foreground"}`}>
                {tier.price}
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className={`flex items-start gap-2.5 text-sm ${tier.featured ? "text-background" : "text-foreground"}`}
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#apply"
                className={`mt-7 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold transition-colors ${
                  tier.featured
                    ? "bg-background text-foreground hover:bg-background/90"
                    : "border border-foreground text-foreground hover:bg-foreground hover:text-background"
                }`}
              >
                Apply for this track
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
