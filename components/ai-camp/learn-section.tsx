import { Workflow, TrendingUp, Lightbulb, Users2, ShieldCheck, Rocket } from "lucide-react"

const items = [
  {
    icon: Workflow,
    title: "Automate core processes",
    body: "Map your operations and identify exactly where AI agents and automation can remove friction, cut cost, and free up your team.",
  },
  {
    icon: TrendingUp,
    title: "Grow revenue & traction",
    body: "Learn how leading startups apply AI to acquisition, retention, and pricing — then translate it into a plan for your own business.",
  },
  {
    icon: Lightbulb,
    title: "Solve real challenges",
    body: "Bring a live business challenge. You'll workshop it directly with founders and engineers building at the frontier.",
  },
  {
    icon: Users2,
    title: "Build your network",
    body: "Form lasting relationships with Silicon Valley entrepreneurs, investors, and a hand-picked cohort of global peers.",
  },
  {
    icon: ShieldCheck,
    title: "Adopt AI responsibly",
    body: "Understand governance, data, and risk so you can deploy AI in your organization with confidence and credibility.",
  },
  {
    icon: Rocket,
    title: "Leave with a roadmap",
    body: "Walk away with a concrete, prioritized AI adoption roadmap tailored to your role, team, and industry.",
  },
]

export function LearnSection() {
  return (
    <section id="learn" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            What you&apos;ll learn
          </span>
          <h2 className="mt-3 text-balance font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
            From AI curiosity to a <span className="italic">concrete plan</span> for your business
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            This is not a lecture series. Every session is built around your real-world context, guided by
            people who ship AI products every day.
          </p>
        </div>

        <div className="mt-12 grid border-l border-t border-foreground/15 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="group border-b border-r border-foreground/15 p-7 transition-colors hover:bg-secondary"
            >
              <span className="flex h-11 w-11 items-center justify-center border border-foreground/20 text-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
