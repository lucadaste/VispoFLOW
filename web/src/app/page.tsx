const features = [
  {
    title: "Idea to flow mapping",
    description:
      "Turn rough concepts into clear visual paths with AI-assisted planning that surfaces the key steps, dependencies, and story beats.",
  },
  {
    title: "Storyboard and launch-ready assets",
    description:
      "Shape ideas into polished experiences with structured storyboards, content blocks, and ready-to-share outputs for teams and clients.",
  },
  {
    title: "Collaborative review loops",
    description:
      "Keep stakeholders aligned with lightweight approvals, shared updates, and a single place to iterate without losing momentum.",
  },
];

const steps = [
  {
    title: "Capture",
    text: "Drop in an idea, brief, or existing draft and let VispoFLOW map the core narrative and flow.",
  },
  {
    title: "Shape",
    text: "Turn that structure into a visual framework with content blocks, checkpoints, and clear next actions.",
  },
  {
    title: "Launch",
    text: "Share the finished flow with your team, gather feedback, and move from concept to delivery faster.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.25),_transparent_35%),linear-gradient(135deg,_#07111f_0%,_#101d31_48%,_#030712_100%)] text-slate-100">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-8 lg:px-10">
        <a href="#top" className="text-lg font-semibold tracking-[0.2em] text-slate-100 uppercase">
          VispoFLOW
        </a>
        <nav className="hidden gap-6 text-sm text-slate-300 md:flex">
          <a href="#what-is-it" className="transition hover:text-white">
            What it is
          </a>
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#how-it-works" className="transition hover:text-white">
            How it works
          </a>
        </nav>
      </header>

      <main id="top" className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 pb-20 sm:px-8 lg:px-10">
        <section className="grid items-center gap-10 rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-200">
              AI-powered creative workflow studio
            </span>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Turn ideas into polished visual flows without the usual friction.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                VispoFLOW is a modern way to go from raw concept to launch-ready storytelling. It helps teams map their ideas, shape compelling experiences, and move work forward with clarity.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:hello@vispoflow.com"
                className="rounded-full bg-cyan-400 px-6 py-3 text-center font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Book a demo
              </a>
              <a
                href="#features"
                className="rounded-full border border-white/20 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/10"
              >
                Explore the platform
              </a>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6 shadow-inner shadow-cyan-900/40">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Live flow</p>
                <p className="text-xl font-semibold text-white">Concept → Story → Delivery</p>
              </div>
              <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm text-emerald-300">
                4.9/5 from early teams
              </div>
            </div>
            <div className="space-y-4">
              {[
                "Capture the brief",
                "Shape the narrative",
                "Assign review checkpoints",
                "Share the final flow",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                  <span className="text-sm text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="what-is-it" className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">What is VispoFLOW?</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">
              It is an AI-native workspace for turning ideas into clean, visual execution plans.
            </h2>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-8 backdrop-blur">
            <p className="text-lg leading-8 text-slate-300">
              VispoFLOW helps founders, marketers, and product teams move from scattered notes to a structured flow that feels clear enough to build from. It combines creative thinking, story organization, and lightweight collaboration so every project can progress with less confusion and more momentum.
            </p>
          </div>
        </section>

        <section id="features" className="space-y-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Core capabilities</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Everything needed to turn an idea into a working story.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-6">
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-8 backdrop-blur lg:p-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">How it works</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">A simple path from concept to delivery.</h2>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-[1.25rem] border border-white/10 bg-slate-950/55 p-6">
                <div className="text-sm font-semibold text-cyan-300">0{index + 1}</div>
                <h3 className="mt-3 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{step.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-slate-400 sm:px-8 lg:px-10">
        VispoFLOW • Designed to make creative work clearer, faster, and more collaborative.
      </footer>
    </div>
  );
}
