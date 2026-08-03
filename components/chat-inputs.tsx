"use client"

import { useState } from "react"
import {
  Send,
  Lock,
  Loader2,
  CheckCircle2,
  Minus,
  Plus,
  ArrowRight,
  CalendarDays,
  ExternalLink,
} from "lucide-react"
import type { StepInput } from "@/lib/steps"
import { type FlowAnswers, AUTHORIZED_SHARES } from "@/lib/flow"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { cn } from "@/lib/utils"
import { formatNumberInput, parseNumberInput } from "@/lib/number-format"
import { assembleChatAnswers } from "@/lib/incorporation-chat-fields"

type SubmitFn = (displayText: string, patch: Partial<FlowAnswers>) => void

/** Only "text" (a single required field, answered exactly like Chat mode's one-field-at-a-time
 *  FieldComposer) stays in the footer bar. Every other kind — choices, multi-field forms, rich
 *  cards — belongs inline in the chat flow like FilingFormCard/TransactionFormCard on the other
 *  two pages, leaving the footer free for asking a question. */
export function isInlineCardInput(input: StepInput): boolean {
  return input.kind !== "text"
}

/** Shared step-in-progress values for the 4 step kinds that also decompose into one-at-a-time
 *  chat questions (see lib/incorporation-chat-fields.ts's getChatFields) — keeping both modes'
 *  widgets controlled off the same values, keyed the same way, is what lets switching modes
 *  mid-step resume instead of losing progress. Every other kind ignores these two props. */
type SharedValuesProps = {
  values?: Record<string, string>
  onValuesChange?: (values: Record<string, string>) => void
}

export function ChatInput({
  input,
  answers,
  onSubmit,
  values,
  onValuesChange,
}: {
  input: StepInput
  answers: FlowAnswers
  onSubmit: SubmitFn
} & SharedValuesProps) {
  switch (input.kind) {
    case "start":
      return <StartInput onSubmit={onSubmit} />
    case "questions":
      return <QuestionsInput onSubmit={onSubmit} />
    case "text":
      return <TextInput input={input} answers={answers} onSubmit={onSubmit} />
    case "incorporator":
      return (
        <IncorporatorInput input={input} answers={answers} values={values ?? {}} onValuesChange={onValuesChange!} onSubmit={onSubmit} />
      )
    case "paywall":
      return <PaywallInput onSubmit={onSubmit} />
    case "corpAddress":
      return <CorpAddressInput answers={answers} onSubmit={onSubmit} />
    case "directorCount":
      return <DirectorCountInput onSubmit={onSubmit} />
    case "directorNames":
      return (
        <DirectorNamesInput input={input} answers={answers} values={values ?? {}} onValuesChange={onValuesChange!} onSubmit={onSubmit} />
      )
    case "officers":
      return (
        <OfficersInput input={input} answers={answers} values={values ?? {}} onValuesChange={onValuesChange!} onSubmit={onSubmit} />
      )
    case "allocations":
      return (
        <AllocationsInput input={input} answers={answers} values={values ?? {}} onValuesChange={onValuesChange!} onSubmit={onSubmit} />
      )
    case "vesting":
      return <VestingInput onSubmit={onSubmit} />
    case "continue":
      return <ContinueInput input={input} onSubmit={onSubmit} />
    case "nameCheck":
      return <NameCheckInput answers={answers} onSubmit={onSubmit} />
    default:
      return null
  }
}

/** The footer's persistent stand-in when the current step's widget is inline in the chat flow —
 *  purely for asking a tangential question, since the step itself is answered via the card above. */
export function AskQuestionBar({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [value, setValue] = useState("")
  const submit = () => {
    const t = value.trim()
    if (!t) return
    onSubmit(t)
    setValue("")
  }
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Ask a question…"
        className="flex-1 bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60"
      />
      <SubmitButton onClick={submit} disabled={!value.trim()} />
    </div>
  )
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
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20"

/** Matches the Questionnaire-mode card look used in Transactions/Compliance (see
 *  TransactionFormCard / FilingFormCard) — header with title/description, fields body, and a
 *  footer bar with a status line plus the submit action. */
function StepFormCard({
  title,
  description,
  status,
  action,
  children,
}: {
  title: string
  description?: string
  status?: React.ReactNode
  action: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="border-b border-border bg-secondary/30 px-5 py-4">
        <h3 className="text-xl font-bold tracking-tight text-foreground">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-4 px-5 py-5">{children}</div>
      <div className="flex items-center justify-between border-t border-border bg-secondary/20 px-5 py-3.5">
        <p className="text-sm text-muted-foreground">{status}</p>
        {action}
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-foreground">
        {label}
        <span className="text-destructive">*</span>
      </label>
      {children}
    </div>
  )
}

function CardSubmitButton({
  children = "Continue",
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
      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </button>
  )
}

/* ---------- questions ---------- */

function QuestionsInput({ onSubmit }: { onSubmit: SubmitFn }) {
  const [value, setValue] = useState("")
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && value.trim() && onSubmit(value.trim(), {})}
          placeholder="Ask me anything…"
          className="flex-1 bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60"
        />
        <SubmitButton onClick={() => onSubmit(value.trim(), {})} disabled={!value.trim()} />
      </div>
      <button
        onClick={() => onSubmit("I'm ready to begin my incorporation", {})}
        className="w-full rounded-lg border border-primary/30 bg-primary/5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
      >
        I'm ready to begin my incorporation →
      </button>
    </div>
  )
}

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
      <div className="flex gap-2">
        <button
          onClick={() => submit("I'd like to do an incorporation")}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Let's begin <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => submit("I have questions")}
          className="inline-flex items-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          I have a question
        </button>
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
  answers,
  onSubmit,
}: {
  input: Extract<StepInput, { kind: "text" }>
  answers: FlowAnswers
  onSubmit: SubmitFn
}) {
  const answerValue = answers[input.field as keyof FlowAnswers]
  const [value, setValue] = useState(input.prefill ?? (typeof answerValue === "string" ? answerValue : "") ?? "")
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

function IncorporatorInput({
  input,
  answers,
  values,
  onValuesChange,
  onSubmit,
}: {
  input: Extract<StepInput, { kind: "incorporator" }>
  answers: FlowAnswers
  values: Record<string, string>
  onValuesChange: (values: Record<string, string>) => void
  onSubmit: SubmitFn
}) {
  const name = values.incorporatorName ?? ""
  const address = values.incorporatorAddress ?? ""
  const remaining = [name, address].filter((v) => !v.trim()).length
  const valid = remaining === 0
  const submit = () => {
    if (!valid) return
    onSubmit(`${name}\n${address}`, assembleChatAnswers(input, values, answers).patch)
  }
  return (
    <StepFormCard
      title="Incorporator"
      description="You'll be the incorporator who signs the initial filing."
      status={valid ? "All fields complete." : `${remaining} required field${remaining === 1 ? "" : "s"} remaining.`}
      action={<CardSubmitButton onClick={submit} disabled={!valid} />}
    >
      <FormField label="Your full name">
        <input value={name} onChange={(e) => onValuesChange({ ...values, incorporatorName: e.target.value })} className={fieldClass} />
      </FormField>
      <FormField label="Mailing address">
        <AddressAutocomplete value={address} onChange={(v) => onValuesChange({ ...values, incorporatorAddress: v })} className={fieldClass} />
      </FormField>
    </StepFormCard>
  )
}

/* ---------- corp address ---------- */

function CorpAddressInput({ answers, onSubmit }: { answers: FlowAnswers; onSubmit: SubmitFn }) {
  const [address, setAddress] = useState(answers.corpAddress)
  const valid = !!address.trim()
  return (
    <StepFormCard
      title="Corporate Address"
      description="The corporation's principal address. No address yet? Buy one in the Compliance Center."
      status={valid ? "All fields complete." : "1 required field remaining."}
      action={
        <CardSubmitButton
          onClick={() => valid && onSubmit(address.trim(), { corpAddress: address.trim() })}
          disabled={!valid}
        />
      }
    >
      <FormField label="Principal address">
        <AddressAutocomplete value={address} onChange={setAddress} className={fieldClass} />
      </FormField>
    </StepFormCard>
  )
}

/* ---------- paywall ---------- */

function PaywallInput({ onSubmit }: { onSubmit: SubmitFn }) {
  const [state, setState] = useState<"idle" | "processing" | "done">("idle")
  const pay = () => {
    setState("processing")
    setTimeout(() => {
      setState("done")
      setTimeout(() => onSubmit("Confirmed · Delaware Formation Package (Free)", {}), 700)
    }, 1600)
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-4 py-2.5">
        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Secure checkout · Vispo Labs Payments</span>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Delaware Formation Package</p>
            <p className="text-xs text-muted-foreground">COI filing + full document set</p>
          </div>
          <p className="text-lg font-semibold text-foreground">Free</p>
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
          {state === "idle" && <>Continue for Free</>}
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
        <CardSubmitButton onClick={submit} />
      </div>
    </Shell>
  )
}

/* ---------- director names ---------- */

function DirectorNamesInput({
  input,
  answers,
  values,
  onValuesChange,
  onSubmit,
}: {
  input: Extract<StepInput, { kind: "directorNames" }>
  answers: FlowAnswers
  values: Record<string, string>
  onValuesChange: (values: Record<string, string>) => void
  onSubmit: SubmitFn
}) {
  const names = Array.from({ length: answers.directorCount }, (_, i) => values[`director_${i}`] ?? "")
  const update = (i: number, v: string) => onValuesChange({ ...values, [`director_${i}`]: v })
  const remaining = names.filter((n) => !n.trim()).length
  const valid = remaining === 0
  const submit = () => {
    const clean = names.map((n) => n.trim())
    onSubmit(clean.join("\n"), assembleChatAnswers(input, values, answers).patch)
  }
  return (
    <StepFormCard
      title="Director Names"
      description="One name per director."
      status={valid ? "All fields complete." : `${remaining} required field${remaining === 1 ? "" : "s"} remaining.`}
      action={<CardSubmitButton onClick={submit} disabled={!valid} />}
    >
      {names.map((n, i) => (
        <FormField key={i} label={`Director ${i + 1}`}>
          <input value={n} onChange={(e) => update(i, e.target.value)} className={fieldClass} />
        </FormField>
      ))}
    </StepFormCard>
  )
}

/* ---------- officers ---------- */

function OfficersInput({
  input,
  answers,
  values,
  onValuesChange,
  onSubmit,
}: {
  input: Extract<StepInput, { kind: "officers" }>
  answers: FlowAnswers
  values: Record<string, string>
  onValuesChange: (values: Record<string, string>) => void
  onSubmit: SubmitFn
}) {
  const titles = ["CEO", "CFO", "Secretary"]
  const names = titles.map((title) => values[title] ?? "")
  const update = (i: number, v: string) => onValuesChange({ ...values, [titles[i]]: v })
  const remaining = names.filter((n) => !n.trim()).length
  const valid = remaining === 0
  const submit = () =>
    onSubmit(
      titles.map((title, i) => `${title} — ${names[i].trim()}`).join("\n"),
      assembleChatAnswers(input, values, answers).patch,
    )
  return (
    <StepFormCard
      title="Company Officers"
      description="Typically a CEO, CFO, and Secretary — one person can hold all roles."
      status={valid ? "All fields complete." : `${remaining} required field${remaining === 1 ? "" : "s"} remaining.`}
      action={<CardSubmitButton onClick={submit} disabled={!valid} />}
    >
      {titles.map((title, i) => (
        <FormField key={title} label={title}>
          <input value={names[i]} onChange={(e) => update(i, e.target.value)} className={fieldClass} />
        </FormField>
      ))}
    </StepFormCard>
  )
}

/* ---------- allocations ---------- */

function AllocationsInput({
  input,
  answers,
  values,
  onValuesChange,
  onSubmit,
}: {
  input: Extract<StepInput, { kind: "allocations" }>
  answers: FlowAnswers
  values: Record<string, string>
  onValuesChange: (values: Record<string, string>) => void
  onSubmit: SubmitFn
}) {
  const founders = answers.directors.length ? answers.directors : ["Founder"]
  const founderDefault = Math.floor((AUTHORIZED_SHARES * 0.8) / founders.length)
  const founderShares = founders.map((_, i) => Math.max(0, Math.floor(parseNumberInput(values[`alloc_${i}`] ?? ""))))
  // The option pool isn't one of getChatFields's chat questions (chat mode always derives it as
  // the remainder), so — unlike the founder rows — it has no shared-values counterpart to resume
  // from across a mode switch; it stays local here, same as it always has.
  const [poolShares, setPoolShares] = useState(() => AUTHORIZED_SHARES - founderDefault * founders.length)
  const update = (i: number, v: number) => onValuesChange({ ...values, [`alloc_${i}`]: String(v) })

  const total = founderShares.reduce((s, n) => s + n, 0) + poolShares
  const remaining = AUTHORIZED_SHARES - total
  const valid = remaining === 0 && founderShares.every((s) => s > 0)

  function pct(shares: number) {
    return ((shares / AUTHORIZED_SHARES) * 100).toFixed(1).replace(/\.0$/, "")
  }

  const submit = () => {
    if (!valid) return
    onSubmit(
      [
        ...founders.map((name, i) => `${name}: ${founderShares[i].toLocaleString()} (${pct(founderShares[i])}%)`),
        `Option Pool: ${poolShares.toLocaleString()} (${pct(poolShares)}%)`,
      ].join("\n"),
      assembleChatAnswers(input, values, answers).patch,
    )
  }

  const statusText =
    remaining === 0
      ? "Fully allocated."
      : remaining > 0
        ? `${remaining.toLocaleString()} shares unallocated.`
        : `${Math.abs(remaining).toLocaleString()} shares over-allocated.`

  return (
    <StepFormCard
      title="Stock Allocations"
      description={`Set founder and option pool shares out of ${AUTHORIZED_SHARES.toLocaleString()} authorized.`}
      status={statusText}
      action={<CardSubmitButton onClick={submit} disabled={!valid} />}
    >
      <div className="grid grid-cols-[1fr_120px_56px] items-center gap-x-3 gap-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Holder</span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Shares</span>
        <span className="text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">%</span>
        {founders.map((name, i) => (
          <div key={name} className="contents">
            <div className="flex items-center rounded-lg bg-secondary px-2.5 py-2 text-sm font-medium text-secondary-foreground">
              {name}
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={founderShares[i].toLocaleString()}
              onChange={(e) => update(i, Math.max(0, Math.floor(parseNumberInput(formatNumberInput(e.target.value)))))}
              className={cn(fieldClass, "tabular-nums")}
            />
            <span className="text-right text-sm tabular-nums text-muted-foreground">{pct(founderShares[i])}%</span>
          </div>
        ))}
        <div className="contents">
          <div className="flex items-center rounded-lg bg-accent/15 px-2.5 py-2 text-sm font-medium text-accent-foreground">
            Option Pool
          </div>
          <input
            type="text"
            inputMode="numeric"
            value={poolShares.toLocaleString()}
            onChange={(e) => setPoolShares(Math.max(0, Math.floor(parseNumberInput(formatNumberInput(e.target.value)))))}
            className={cn(fieldClass, "tabular-nums")}
          />
          <span className="text-right text-sm tabular-nums text-muted-foreground">{pct(poolShares)}%</span>
        </div>
      </div>
    </StepFormCard>
  )
}

/* ---------- vesting ---------- */

function VestingInput({ onSubmit }: { onSubmit: SubmitFn }) {
  const [choice, setChoice] = useState<"default" | "earlier">("default")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))

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
    <StepFormCard
      title="Vesting Start Date"
      description="4-year vesting with a 1-year cliff, starting when a founder began contributing."
      action={<CardSubmitButton onClick={submit}>Confirm</CardSubmitButton>}
    >
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
    </StepFormCard>
  )
}

/* ---------- name check ---------- */

const DELAWARE_NAME_SEARCH_URL = "https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx"

function NameCheckInput({ answers, onSubmit }: { answers: FlowAnswers; onSubmit: SubmitFn }) {
  return (
    <Shell>
      <div className="space-y-3">
        <p className="text-sm text-foreground">
          Type <strong className="font-semibold">"{answers.companyName}"</strong> into the "Entity Name" field:
        </p>
        <a
          href={DELAWARE_NAME_SEARCH_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
        >
          Search on Delaware.gov
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <p className="text-center text-xs text-muted-foreground">
          "No Records Found" = <strong className="font-semibold text-success">Available!</strong>
          <span className="mx-1.5 text-muted-foreground/40">·</span>
          Anything else = <strong className="font-semibold text-destructive">Taken :/</strong>
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onSubmit("It's available — I checked Delaware's search.", {})}
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            It's available
          </button>
          <button
            onClick={() => onSubmit("It's already taken — let me pick a different name.", {})}
            className="inline-flex items-center justify-center rounded-full border border-border px-4 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            It's taken
          </button>
        </div>
        <button
          onClick={() => onSubmit("I'm not sure how to check — I'll skip it for now.", {})}
          className="w-full text-center text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Not sure how to check? Skip this step
        </button>
        <p className="text-center text-[11px] text-muted-foreground/70">
          Preliminary only — Delaware has final say at filing.
        </p>
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
  // Asking a question before continuing is handled by the footer's Ask-a-question box now that
  // this renders inline (see isInlineCardInput) — this card only needs its own CTA.
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
