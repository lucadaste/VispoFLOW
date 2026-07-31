"use client"

import { useState } from "react"
import { CheckCircle2, ShieldCheck } from "lucide-react"

const FIELD_CLASS =
  "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-primary"

export function ProvideInfoClient({
  token,
  docTitle,
  fieldLabel,
  recipientName,
  alreadySubmitted,
}: {
  token: string
  docTitle: string
  fieldLabel: string
  recipientName: string | null
  alreadySubmitted: boolean
}) {
  const [submitted, setSubmitted] = useState(alreadySubmitted)
  const [value, setValue] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!value.trim()) {
      setError(`Please enter your ${fieldLabel.toLowerCase()}.`)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/info-requests/fulfill/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Something went wrong")
      }
      setValue("")
      setSubmitted(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6">
        <h1 className="text-lg font-bold tracking-tight text-foreground">
          {recipientName ? `${recipientName}, y` : "Y"}ou've been asked for your {fieldLabel}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">For completing &ldquo;{docTitle}&rdquo;.</p>
      </div>

      {submitted ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
          <span>Thanks — you're all set. You can close this page.</span>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-background p-4">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{fieldLabel}</label>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="XXX-XX-XXXX"
            className={FIELD_CLASS}
          />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-3 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          <p className="mt-4 flex items-start gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            This value is sent directly and privately — it's never shown to whoever asked you for it,
            and isn't stored in any chat.
          </p>
        </div>
      )}
    </div>
  )
}
