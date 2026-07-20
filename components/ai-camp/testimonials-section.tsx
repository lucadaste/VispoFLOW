import { Star } from "lucide-react"

const testimonials = [
  {
    quote:
      "I came in skeptical about the hype and left with three AI initiatives we shipped within the quarter. The access to real founders is unmatched.",
    name: "Elena Rossi",
    role: "COO, European logistics group",
  },
  {
    quote:
      "The program turned abstract AI concepts into a concrete roadmap my board immediately approved. Worth every day away from the office.",
    name: "Markus Weber",
    role: "VP Innovation, manufacturing",
  },
  {
    quote:
      "Partnering hands-on with a Silicon Valley startup on our actual data was the moment it all clicked for our team.",
    name: "Sofia Lindqvist",
    role: "Director of Strategy, retail",
  },
]

export function TestimonialsSection() {
  return (
    <section className="bg-foreground py-20 text-background sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-background/60">
            Testimonials
          </span>
          <h2 className="mt-3 text-balance font-serif text-3xl font-normal tracking-tight sm:text-4xl">
            Trusted by <span className="italic">managers and innovators</span> worldwide
          </h2>
        </div>

        <div className="mt-12 grid border-l border-t border-background/20 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col border-b border-r border-background/20 p-7"
            >
              <div className="flex gap-0.5 text-background">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-pretty leading-relaxed text-background/90">
                {t.quote}
              </blockquote>
              <figcaption className="mt-5 border-t border-background/20 pt-4">
                <span className="block text-sm font-semibold">{t.name}</span>
                <span className="block text-sm text-background/60">{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
