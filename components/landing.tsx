"use client"

import { useState } from "react"
import { Scale, ArrowRight, Building2, ShieldCheck, MessageCircle } from "lucide-react"

type Path = "formation" | "compliance" | "questions"

export function Landing({ onSelect }: { onSelect: (path: Path, message?: string) => void }) {
  const [value, setValue] = useState("")

  const submit = () => {
    const t = value.trim()
    if (!t) return
    onSelect("questions", t)
  }

  return (
    <div className="flex h-dvh flex-col items-center justify-between bg-background px-4 py-10 sm:px-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
          <Scale className="h-7 w-7" strokeWidth={1.8} />
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold tracking-tight text-foreground">Vispo</p>
          <p className="text-sm text-muted-foreground">Incorporation Studio</p>
        </div>
      </div>

      {/* Center content */}
      <div className="w-full max-w-2xl space-y-8">
        {/* Bot greeting */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-sm">
            <Scale className="h-4 w-4" />
          </div>
          <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm ring-1 ring-border">
            Hello! I'm your Vispo assistant. I guide companies through every step of building a legally sound business — starting with incorporation and continuing through ongoing compliance. What would you like to do?
          </div>
        </div>

        {/* Formation → Compliance progression */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
          <div className="flex flex-1 flex-col items-center gap-1 text-center">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
            <p className="text-xs font-semibold text-foreground">Formation</p>
            <p className="text-[11px] text-muted-foreground">Incorporate · File · Document</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="flex flex-1 flex-col items-center gap-1 text-center">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary text-xs font-bold text-primary">2</span>
            <p className="text-xs font-semibold text-foreground">Compliance</p>
            <p className="text-[11px] text-muted-foreground">EIN · 83(b) · State filings</p>
          </div>
        </div>

        {/* Path options */}
        <div className="grid gap-3 sm:grid-cols-3">
          <PathCard
            icon={<Building2 className="h-5 w-5" />}
            title="Start a new incorporation"
            description="I need to incorporate my Delaware corporation from scratch."
            onClick={() => onSelect("formation")}
          />
          <PathCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Manage compliance"
            description="My company is already incorporated and I need to handle filings."
            onClick={() => onSelect("compliance")}
          />
          <PathCard
            icon={<MessageCircle className="h-5 w-5" />}
            title="I have questions"
            description="I'm not sure where to start and want to learn more first."
            onClick={() => onSelect("questions")}
          />
        </div>
      </div>

      {/* Text input */}
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Or type your question…"
            className="flex-1 bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60"
          />
          <button
            onClick={submit}
            disabled={!value.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Vispo is an AI-assisted guide. Always consult a licensed attorney for legal advice.
        </p>
      </div>
    </div>
  )
}

function PathCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}
