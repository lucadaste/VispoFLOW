import { Building2 } from "lucide-react"

const categories = [
  {
    title: "Applied AI startups",
    body: "Fast-growing companies building agents, copilots, and automation across sales, ops, and support.",
  },
  {
    title: "Foundation model labs",
    body: "Researchers and engineers from labs at the frontier of large language and multimodal models.",
  },
  {
    title: "Enterprise AI platforms",
    body: "Teams helping global companies deploy AI securely, at scale, and with measurable ROI.",
  },
  {
    title: "Founders & operators",
    body: "Serial entrepreneurs and operators who have scaled AI-native products from zero to millions.",
  },
]

export function PartnersSection() {
  return (
    <section id="partners" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Who you&apos;ll partner with
            </span>
            <h2 className="mt-3 text-balance font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
              Learn directly from the people <span className="italic">building AI</span>
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              We match every cohort with a curated set of Silicon Valley AI companies and entrepreneurs —
              chosen to fit the industries and challenges in the room. No generic case studies, just the
              real teams shaping what comes next.
            </p>

            <div className="mt-8 grid border-l border-t border-foreground/15 sm:grid-cols-2">
              {categories.map((c) => (
                <div key={c.title} className="border-b border-r border-foreground/15 p-5">
                  <span className="flex h-9 w-9 items-center justify-center border border-foreground/20 text-foreground">
                    <Building2 className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="mt-4 font-semibold text-foreground">{c.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <img
              src="/images/founder-talk.png"
              alt="An AI founder presenting to a small group of executives"
              className="aspect-[4/3] w-full border border-foreground/15 object-cover grayscale"
            />
            <div className="absolute -bottom-5 left-5 right-5 border border-foreground/15 bg-background p-5 sm:left-8 sm:right-auto sm:max-w-xs">
              <p className="text-sm font-medium leading-relaxed text-foreground">
                &ldquo;Sitting across the table from founders changed how I think about AI in my company.&rdquo;
              </p>
              <p className="mt-2 text-xs text-muted-foreground">— Cohort participant, Head of Operations</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
