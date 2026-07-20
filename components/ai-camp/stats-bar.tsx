const stats = [
  { value: "20+", label: "AI companies & founders in our network" },
  { value: "150+", label: "Managers & innovators trained" },
  { value: "3-5", label: "Days of hands-on immersion" },
  { value: "92%", label: "Would recommend to a colleague" },
]

export function StatsBar() {
  return (
    <section className="border-b border-foreground/15 bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`flex flex-col items-center gap-1 px-4 py-10 text-center ${
              i !== 0 ? "border-foreground/15 sm:border-l" : ""
            } ${i === 2 ? "border-foreground/15 lg:border-l" : ""}`}
          >
            <span className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">{s.value}</span>
            <span className="text-sm leading-snug text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
