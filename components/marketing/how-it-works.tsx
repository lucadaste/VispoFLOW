import { MessageCircle, FileCog, PenTool } from "lucide-react"

const STEPS = [
  {
    icon: MessageCircle,
    title: "Tell us about your company",
    description:
      "Answer a short set of questions in a guided chat — your company name, founders, share split, and vesting. Ask questions any time; there's no legal jargon to decode alone.",
  },
  {
    icon: FileCog,
    title: "We draft your documents",
    description:
      "Your Certificate of Incorporation, bylaws, board and stockholder resolutions, founder stock agreements, and equity plan are generated automatically from your answers.",
  },
  {
    icon: PenTool,
    title: "Sign, file, and stay organized",
    description:
      "E-sign with a saved signature that autofills across every document. Everything lands in your Document Vault, ready whenever compliance or a new deal comes up.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border bg-secondary/40 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            No forms to hunt for, no templates to fill in blind. Just a conversation that turns into
            paperwork.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="h-5 w-5" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Step {i + 1}
              </p>
              <h3 className="mt-1.5 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
