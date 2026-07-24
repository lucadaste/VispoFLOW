import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function FinalCta() {
  return (
    <section className="border-t border-border bg-primary py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
          Ready to turn your startup into a company?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-primary-foreground/80">
          Start the guided Formation chat and have your incorporation documents drafted in minutes.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/app"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-background px-7 py-3.5 text-sm font-semibold text-foreground transition-opacity hover:opacity-90"
          >
            Start incorporating
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
