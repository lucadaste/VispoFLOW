import { ArrowRight, MapPin, CalendarDays, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-foreground text-background">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-sv.png"
          alt="Silicon Valley tech campus at golden hour"
          className="h-full w-full object-cover opacity-20 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/85 to-foreground" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 border border-background/30 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-background">
            <Sparkles className="h-3.5 w-3.5" />
            By Silicon Valley Experience
          </span>

          <h1 className="mt-6 text-balance font-serif text-4xl font-normal leading-[1.03] tracking-tight sm:text-5xl lg:text-7xl">
            Silicon Valley <span className="italic">AI Camp</span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-background/75">
            A 3, 4, or 5-day immersive program where managers and innovators partner directly with
            Silicon Valley AI companies and entrepreneurs — to learn how the latest AI solutions can
            transform your business, solve real challenges, and unlock new revenue.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#apply"
              className="inline-flex items-center justify-center gap-2 bg-background px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-background/90"
            >
              Apply for the next cohort
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#program"
              className="inline-flex items-center justify-center gap-2 border border-background/40 px-7 py-3.5 text-sm font-semibold text-background transition-colors hover:bg-background/10"
            >
              Explore the program
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-background/70">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              San Francisco Bay Area
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              3-5 day intensive cohorts
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Limited to 20 participants
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
