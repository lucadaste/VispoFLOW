"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@clerk/nextjs"
import { ArrowLeft, Check, Loader2, Lock } from "lucide-react"

type ContentResponse = {
  documentId: string
  title: string
  status: string
  deadlineDate: string | null
  subjectName: string | null
  role: string
  canEdit: boolean
  canViewSensitive: boolean
  started: boolean
  content: string | null
  values: Record<string, string>
  hiddenFieldLabels: string[]
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  awaiting_client_info: "Awaiting client info",
  awaiting_review: "Awaiting review",
  ready_to_sign: "Ready to sign",
  signed: "Signed",
  filed: "Filed",
}

export function SharedDocumentViewer({ documentId }: { documentId: string }) {
  const { isLoaded, isSignedIn } = useAuth()
  const [data, setData] = useState<ContentResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [requesting, setRequesting] = useState(false)
  const [requested, setRequested] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}/content?view=1`)
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? "Couldn't open this filing")
        return
      }
      setData(json)
    } catch {
      setError("Couldn't open this filing. Check your connection and try again.")
    }
  }, [documentId])

  useEffect(() => {
    if (isLoaded && isSignedIn) load()
  }, [isLoaded, isSignedIn, load])

  const requestHidden = async () => {
    if (!data?.hiddenFieldLabels.length) return
    setRequesting(true)
    try {
      const res = await fetch(`/api/documents/${documentId}/request-sensitive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldLabels: data.hiddenFieldLabels }),
      })
      if (res.ok) setRequested(true)
    } finally {
      setRequesting(false)
    }
  }

  if (!isLoaded || (isSignedIn && !data && !error)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">Sign in to view this filing.</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-sm font-medium text-foreground">Can&apos;t open this filing</p>
        <p className="text-sm text-muted-foreground">{error ?? "It may have been removed, or your access was revoked."}</p>
        <Link href="/shared" className="mt-3 text-xs font-medium text-primary hover:underline">
          ← Back to Shared with me
        </Link>
      </div>
    )
  }

  const roleLabel = data.role.charAt(0).toUpperCase() + data.role.slice(1)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/shared" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Shared with me
      </Link>

      <div className="mt-3 rounded-lg border border-border bg-secondary/30 px-4 py-3">
        <p className="text-sm text-foreground">
          Viewing {data.subjectName ? <span className="font-medium">{data.subjectName}&apos;s</span> : "a"}{" "}
          <span className="font-medium">{data.title}</span> —{" "}
          <span className="font-medium">{roleLabel} access</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {STATUS_LABEL[data.status] ?? data.status}
          {data.deadlineDate &&
            ` · deadline ${new Date(data.deadlineDate).toLocaleDateString("en-US", { dateStyle: "long" })}`}
        </p>
      </div>

      {data.hiddenFieldLabels.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
          <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Hidden from you: {data.hiddenFieldLabels.join(", ")}
          </p>
          {requested ? (
            <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5" /> Requested
            </span>
          ) : (
            <button
              onClick={requestHidden}
              disabled={requesting}
              className="ml-auto rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
            >
              {requesting ? "Requesting…" : "Request"}
            </button>
          )}
        </div>
      )}

      <div className="mt-4 rounded-lg border border-border bg-white px-6 py-6">
        {!data.started ? (
          <p className="text-sm text-neutral-500">
            {data.canEdit
              ? "This filing hasn't been started yet — open it from the app to begin."
              : "This filing hasn't been started yet."}
          </p>
        ) : data.content ? (
          <pre
            className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-900"
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            {data.content}
          </pre>
        ) : (
          <p className="text-sm text-neutral-500">No preview available for this filing yet.</p>
        )}
      </div>

      {data.canEdit && (
        <p className="mt-3 text-xs text-muted-foreground">
          You have edit access, but changes are made from the main app for now —{" "}
          <Link href="/app" className="font-medium text-primary hover:underline">
            open it there
          </Link>
          .
        </p>
      )}
    </div>
  )
}
