"use client"

import { useState } from "react"
import {
  Send,
  Building2,
  Lock,
  CreditCard,
  Loader2,
  CheckCircle2,
  Minus,
  Plus,
  ArrowRight,
  CalendarDays,
} from "lucide-react"
import type { StepInput } from "@/lib/steps"
import {
  type FlowAnswers,
  type Officer,
  type Allocation,
  AUTHORIZED_SHARES,
} from "@/lib/flow"
import { cn } from "@/lib/utils"

const KNOWN_FOUNDERS = ["Matteo Daste", "Filippo Murroni", "Daniel Scheiner"]

type SubmitFn = (displayText: string, patch: Partial<FlowAnswers>) => void

export function ChatInput({
  input,
  answers,
  onSubmit,
}: {
  input: StepInput
  answers: FlowAnswers
  onSubmit: SubmitFn
}) {
  switch (input.kind) {
    case "start":
      return <StartInput onSubmit={onSubmit} />
    case "text":
      return <TextInput input={input} onSubmit={onSubmit} />
    case "incorporator":
      return <IncorporatorInput onSubmit={onSubmit} />
    case "paywall":
      return <PaywallInput onSubmit={onSubmit} />
    case "corpAddress":
      return <CorpAddressInput onSubmit={onSubmit} />
    case "directorCount":
      return <DirectorCountInput onSubmit={onSubmit} />
    case "directorNames":
      return <DirectorNamesInput answers={answers} onSubmit={onSubmit} />
    case "officers":
      return <OfficersInput answers={answers} onSubmit={onSubmit} />
    case "allocations":
      return <AllocationsInput answers={answers} onSubmit={onSubmit} />
    case "vesting":
      return <VestingInput onSubmit={onSubmit} />
    case "continue":
      return <ContinueInput input={input} onSubmit={onSubmit} />
    default:
      return null
  }
}

/* ---------- shared bits ---------- */

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-card p-3 shadow-sm">{children}</div>
}

function SubmitButton({
  children = "Send",
  disabled,
  onClick,
}: {
  children?: React.ReactNode
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
      <Send className="h-3.5 w-3.5" />
    </button>
  )
}

const fieldClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20"

const labelClass = "mb-1 block text-xs font-medium text-muted-foreground"

/* ---------- start ---------- */

function StartInput({ onSubmit }: { onSubmit: SubmitFn }) {
  const [value, setValue] = useState("")
  const submit = (text: string) => {
    const t = text.trim()
    if (!t) return
    onSubmit(t, {})
  }
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-2">
        {["I'd like to do an incorporation", "I need to issue stock options"].map((s) => (
          <button
            key={s}
            onClick={() => submit(s)}
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit(value)}
          placeholder="Type a message…"
          className="flex-1 bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60"
        />
        <SubmitButton onClick={() => submit(value)} disabled={!value.trim()} />
      </div>
    </div>
  )
}

/* ---------- single text ---------- */

function TextInput({
  input,
  onSubmit,
}: {
  input: Extract<StepInput, { kind: "text" }>
  onSubmit: SubmitFn
}) {
  const [value, setValue] = useState(input.prefill ?? "")
  const submit = () => {
    const t = value.trim()
    if (!t) return
    onSubmit(t, { [input.field]: t } as Partial<FlowAnswers>)
  }
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder={input.placeholder}
        className="flex-1 bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60"
      />
      <SubmitButton onClick={submit} disabled={!value.trim()} />
    </div>
  )
}

/* ---------- incorporator ---------- */

function IncorporatorInput({ onSubmit }: { onSubmit: SubmitFn }) {
  const [name, setName] = useState("Matteo Daste")
  const [address, setAddress] = useState("25 Silk Oak Circle, San Rafael, CA 94901 USA")
  const submit = () => {
    if (!name.trim() || !address.trim()) return
    onSubmit(`${name}\n${address}`, {
      incorporatorName: name.trim(),
      incorporatorAddress: address.trim(),
    })
  }
  return (
    <Shell>
      <div className="space-y-3">
        <div>
          <label className={labelClass}>Your full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Mailing address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className={cn(fieldClass, "resize-none")}
          />
        </div>
        <div className="flex justify-end">
          <SubmitButton onClick={submit} disabled={!name.trim() || !address.trim()} />
        </div>
      </div>
    </Shell>
  )
}

/* ---------- corp address ---------- */

function CorpAddressInput({ onSubmit }: { onSubmit: SubmitFn }) {
  const [address, setAddress] = useState("25 Silk Oak Circle, San Rafael, CA 94901 USA")
  return (
    <Shell>
      <div className="space-y-3">
        <div>
          <label className={labelClass}>Corporation's principal address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className={cn(fieldClass, "resize-none")}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">No address yet? Buy one in the Compliance Center.</span>
          <SubmitButton
            onClick={() => address.trim() && onSubmit(address.trim(), { corpAddress: address.trim() })}
            disabled={!address.trim()}
          />
        </div>
      </div>
    </Shell>
  )
}

/* ---------- paywall ---------- */

function PaywallInput({ onSubmit }: { onSubmit: SubmitFn }) {
  const [state, setState] = useState<"idle" | "processing" | "done">("idle")
  const pay = () => {
    setState("processing")
    setTimeout(() => {
      setState("done")
      setTimeout(() => onSubmit("Payment completed · Delaware Formation Package ($499.00)", {}), 700)
    }, 1600)
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-4 py-2.5">
        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Secure checkout · Vispo Payments</span>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Delaware Formation Package</p>
            <p className="text-xs text-muted-foreground">COI filing + full document set</p>
          </div>
          <p className="text-lg font-semibold text-foreground">$499.00</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
          <CreditCard className="h-4 w-4" />
          <span>•••• •••• •••• 4242</span>
          <span className="ml-auto text-xs">12/28</span>
        </div>
        <button
          onClick={pay}
          disabled={state !== "idle"}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
            state === "done"
              ? "bg-success text-success-foreground"
              : "bg-primary text-primary-foreground hover:opacity-90",
            state !== "idle" && "cursor-not-allowed",
          )}
        >
          {state === "idle" && <>Pay $499.00</>}
          {state === "processing" && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Processing…
            </>
          )}
          {state === "done" && (
            <>
              <CheckCircle2 className="h-4 w-4" /> Payment confirmed
            </>
          )}
        </button>
      </div>
    </div>
  )
}

/* ---------- director count ---------- */

function DirectorCountInput({ onSubmit }: { onSubmit: SubmitFn }) {
  const [count, setCount] = useState(2)
  const submit = () => {
    const word = count === 1 ? "one" : count === 2 ? "two" : `${count}`
    onSubmit(`We'll have ${word}.`, { directorCount: count })
  }
  return (
    <Shell>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={cn(
                "h-9 w-9 rounded-lg text-sm font-medium transition-colors",
                count === n
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-foreground hover:bg-secondary",
              )}
            >
              {n}
            </button>
          ))}
          <div className="ml-1 flex items-center rounded-lg border border-border">
            <button
              onClick={() => setCount((c) => Math.max(1, c - 1))}
              className="px-2 py-2 text-muted-foreground hover:text-foreground"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-7 text-center text-sm font-medium">{count}</span>
            <button
              onClick={() => setCount((c) => Math.min(9, c + 1))}
              className="px-2 py-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <SubmitButton onClick={submit} />
      </div>
    </Shell>
  )
}

/* ---------- director names ---------- */

function DirectorNamesInput({ answers, onSubmit }: { answers: FlowAnswers; onSubmit: SubmitFn }) {
  const [names, setNames] = useState<string[]>(() =>
    Array.from({ length: answers.directorCount }, (_, i) => KNOWN_FOUNDERS[i] ?? ""),
  )
  const update = (i: number, v: string) => setNames((arr) => arr.map((n, idx) => (idx === i ? v : n)))
  const valid = names.every((n) => n.trim())
  const submit = () => {
    const clean = names.map((n) => n.trim())
    onSubmit(clean.join("\n"), { directors: clean, foundersList: clean.join(" & ") })
  }
  return (
    <Shell>
      <div className="space-y-2.5">
        {names.map((n, i) => (
          <div key={i}>
            <label className={labelClass}>Director {i + 1}</label>
            <input value={n} onChange={(e) => update(i, e.target.value)} className={fieldClass} />
          </div>
        ))}
        <div className="flex justify-end pt-1">
          <SubmitButton onClick={submit} disabled={!valid} />
        </div>
      </div>
    </Shell>
  )
}

/* ---------- officers ---------- */

function OfficersInput({ answers, onSubmit }: { answers: FlowAnswers; onSubmit: SubmitFn }) {
  const defaults: Record<string, string> = {
    CEO: answers.directors[1] ?? "Filippo Murroni",
    CFO: answers.directors[0] ?? "Matteo Daste",
    Secretary: "Daniel Scheiner",
  }
  const [officers, setOfficers] = useState<Officer[]>([
    { title: "CEO", name: defaults.CEO },
    { title: "CFO", name: defaults.CFO },
    { title: "Secretary", name: defaults.Secretary },
  ])
  const update = (i: number, v: string) =>
    setOfficers((arr) => arr.map((o, idx) => (idx === i ? { ...o, name: v } : o)))
  const valid = officers.every((o) => o.name.trim())
  const submit = () =>
    onSubmit(
      officers.map((o) => `${o.title} — ${o.name.trim()}`).join("\n"),
      { officers: officers.map((o) => ({ ...o, name: o.name.trim() })) },
    )
  return (
    <Shell>
      <div className="space-y-2">
        <div className="grid grid-cols-[90px_1fr] gap-x-3 gap-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Title</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Officer name</span>
          {officers.map((o, i) => (
            <FragmentRow key={o.title} title={o.title} value={o.name} onChange={(v) => update(i, v)} />
          ))}
        </div>
        <div className="flex justify-end pt-1">
          <SubmitButton onClick={submit} disabled={!valid} />
        </div>
      </div>
    </Shell>
  )
}

function FragmentRow({
  title,
  value,
  onChange,
}: {
  title: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <>
      <div className="flex items-center rounded-lg bg-secondary px-2.5 text-sm font-medium text-secondary-foreground">
        {title}
      </div>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass} />
    </>
  )
}

/* ---------- allocations ---------- */

function AllocationsInput({ answers, onSubmit }: { answers: FlowAnswers; onSubmit: SubmitFn }) {
  const founders = answers.directors.length ? answers.directors : ["Matteo Daste", "Filippo Murroni"]
  const founderDefault = Math.floor((AUTHORIZED_SHARES * 0.8) / founders.length)
  const [rows, setRows] = useState<Allocation[]>(() => {
    const f = founders.map((name) => ({ name, shares: founderDefault }))
    const used = founderDefault * founders.length
    return [...f, { name: "Option Pool", shares: AUTHORIZED_SHARES - used, isPool: true }]
  })
  const update = (i: number, v: number) =>
    setRows((arr) => arr.map((r, idx) => (idx === i ? { ...r, shares: v } : r)))

  const total = rows.reduce((s, r) => s + (r.shares || 0), 0)
  const remaining = AUTHORIZED_SHARES - total
  const valid = remaining === 0 && rows.every((r) => r.shares > 0)

  const submit = () => {
    const founderShares = rows.filter((r) => !r.isPool).reduce((s, r) => s + r.shares, 0)
    const pool = rows.find((r) => r.isPool)?.shares ?? 0
    onSubmit(
      rows
        .map((r) => `${r.name}: ${r.shares.toLocaleString()} (${pct(r.shares)}%)`)
        .join("\n"),
      {
        allocations: rows,
        founderShares: founderShares.toLocaleString(),
        poolShares: pool.toLocaleString(),
      },
    )
  }

  function pct(shares: number) {
    return ((shares / AUTHORIZED_SHARES) * 100).toFixed(1).replace(/\.0$/, "")
  }

  return (
    <Shell>
      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_120px_56px] items-center gap-x-3 gap-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Holder</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Shares</span>
          <span className="text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">%</span>
          {rows.map((r, i) => (
            <div key={r.name} className="contents">
              <div
                className={cn(
                  "flex items-center rounded-lg px-2.5 py-2 text-sm font-medium",
                  r.isPool ? "bg-accent/15 text-accent-foreground" : "bg-secondary text-secondary-foreground",
                )}
              >
                {r.name}
              </div>
              <input
                type="number"
                value={r.shares}
                onChange={(e) => update(i, Math.max(0, Number(e.target.value)))}
                className={cn(fieldClass, "tabular-nums")}
              />
              <span className="text-right text-sm tabular-nums text-muted-foreground">{pct(r.shares)}%</span>
            </div>
          ))}
        </div>

        <div
          className={cn(
            "flex items-center justify-between rounded-lg px-3 py-2 text-xs",
            valid ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
          )}
        >
          <span>{AUTHORIZED_SHARES.toLocaleString()} authorized shares</span>
          <span className="font-medium">
            {remaining === 0
              ? "Fully allocated"
              : remaining > 0
                ? `${remaining.toLocaleString()} unallocated`
                : `${Math.abs(remaining).toLocaleString()} over-allocated`}
          </span>
        </div>

        <div className="flex justify-end pt-1">
          <SubmitButton onClick={submit} disabled={!valid} />
        </div>
      </div>
    </Shell>
  )
}

/* ---------- vesting ---------- */

function VestingInput({ onSubmit }: { onSubmit: SubmitFn }) {
  const [choice, setChoice] = useState<"default" | "earlier">("earlier")
  const [date, setDate] = useState("2026-01-01")

  const submit = () => {
    if (choice === "default") {
      onSubmit("Use the incorporation date as the vesting start date.", {
        vestingStartDate: "Incorporation date",
        vestingUsesEarlierDate: false,
      })
    } else {
      const pretty = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      onSubmit(`Use an earlier vesting start date of ${pretty}.`, {
        vestingStartDate: pretty,
        vestingUsesEarlierDate: true,
      })
    }
  }

  return (
    <Shell>
      <div className="space-y-2.5">
        <button
          onClick={() => setChoice("default")}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
            choice === "default" ? "border-primary bg-primary/5" : "border-border hover:bg-secondary",
          )}
        >
          <Radio active={choice === "default"} />
          <div>
            <p className="text-sm font-medium text-foreground">Incorporation date</p>
            <p className="text-xs text-muted-foreground">Recommended default</p>
          </div>
        </button>

        <button
          onClick={() => setChoice("earlier")}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
            choice === "earlier" ? "border-primary bg-primary/5" : "border-border hover:bg-secondary",
          )}
        >
          <Radio active={choice === "earlier"} />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Earlier date</p>
            <p className="text-xs text-muted-foreground">If you were already working on the project</p>
          </div>
          {choice === "earlier" && (
            <div className="flex items-center gap-1.5 rounded-lg border border-input bg-background px-2 py-1">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="date"
                value={date}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  e.stopPropagation()
                  setDate(e.target.value)
                }}
                className="bg-transparent text-sm text-foreground outline-none"
              />
            </div>
          )}
        </button>

        <div className="flex justify-end pt-1">
          <SubmitButton onClick={submit}>Confirm</SubmitButton>
        </div>
      </div>
    </Shell>
  )
}

function Radio({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
        active ? "border-primary" : "border-muted-foreground/40",
      )}
    >
      {active && <span className="h-2 w-2 rounded-full bg-primary" />}
    </span>
  )
}

/* ---------- continue ---------- */

function ContinueInput({
  input,
  onSubmit,
}: {
  input: Extract<StepInput, { kind: "continue" }>
  onSubmit: SubmitFn
}) {
  return (
    <div className="flex justify-center">
      <button
        onClick={() => onSubmit("", {})}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
      >
        {input.label}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}
