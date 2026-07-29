"use client"

import { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { SignaturePad } from "@/components/signature-pad"
import { formatSignedDate } from "@/lib/signature"

export function SignRequestClient({
  token,
  docTitle,
  docContent,
  recipientName,
  slotLabel,
  lockedName,
  alreadySigned,
  signerName,
  signedAt,
}: {
  token: string
  docTitle: string
  docContent: string
  recipientName: string | null
  slotLabel: string | null
  lockedName: string | null
  alreadySigned: boolean
  signerName: string | null
  signedAt: string | null
}) {
  const [signed, setSigned] = useState(alreadySigned)
  const [signedByName, setSignedByName] = useState(signerName ?? "")
  const [consented, setConsented] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCapture = async (dataUrl: string, _method: "typed" | "drawn", name: string) => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/sign/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signerName: name, signatureDataUrl: dataUrl }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Something went wrong")
      }
      setSignedByName(name)
      setSigned(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-10 sm:px-8">
      <div className="mb-6">
        <h1 className="text-lg font-bold tracking-tight text-foreground">{docTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {recipientName ? `${recipientName}, y` : "Y"}ou've been asked to review and sign this document
          {slotLabel ? ` as ${slotLabel}` : ""}.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-background p-6 sm:p-8">
        <pre className="whitespace-pre-wrap break-words font-serif text-sm leading-relaxed text-foreground">
          {docContent}
        </pre>
      </div>

      <div className="mt-6">
        {signed ? (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
            <span>
              Signed by {signedByName}
              {signedAt ? ` on ${formatSignedDate(signedAt)}` : ""}. You're all set.
            </span>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-background p-4">
            <label className="mb-3 flex items-start gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={consented}
                onChange={(e) => setConsented(e.target.checked)}
                className="mt-0.5"
              />
              I agree that typing or drawing my name below constitutes my electronic signature on this document.
            </label>
            {consented ? (
              <SignaturePad
                defaultName={recipientName ?? ""}
                lockedName={lockedName ?? undefined}
                confirmLabel="Sign"
                onCapture={handleCapture}
              />
            ) : (
              <p className="text-xs text-muted-foreground">Check the box above to sign.</p>
            )}
            {submitting && <p className="mt-2 text-xs text-muted-foreground">Signing…</p>}
            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
