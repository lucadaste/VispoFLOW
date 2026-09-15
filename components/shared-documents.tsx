"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@clerk/nextjs"
import { Loader2, Users } from "lucide-react"
import { cn } from "@/lib/utils"

type Row = {
  id: string
  title: string
  status: string
  subjectName: string | null
  myRole: string | null
  isOwnFiling: boolean
  mySource: string | null
  daysToDeadline: number | null
  urgency: "none" | "overdue" | "urgent" | "soon" | "ok"
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  awaiting_client_info: "Awaiting your info",
  awaiting_review: "Awaiting review",
  ready_to_sign: "Ready to sign",
  signed: "Signed",
  filed: "Filed",
}

/** `bare` drops the full-page chrome (min-height centering, page padding, the "Shared with me"
 *  heading) so this can be embedded in something else's container — e.g. a modal — instead of
 *  only ever being its own page. See app/shared/page.tsx for the standalone usage. */
export function SharedDocuments({ bare = false }: { bare?: boolean } = {}) {
  const { isLoaded, isSignedIn } = useAuth()
  const [rows, setRows] = useState<Row[] | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    fetch("/api/documents")
      .then((r) => (r.ok ? r.json() : { documents: [] }))
      .then((data) =>
        // Firm-wide matters (an attorney's own firm) live on the /firm roster instead — this page
        // is for the "someone invited me to their one filing" case, individual or as a client.
        setRows((data.documents ?? []).filter((d: Row) => !d.isOwnFiling && (d.mySource === "collaborator" || d.mySource === "client"))),
      )
      .catch(() => setRows([]))
  }, [isLoaded, isSignedIn])

  if (!isLoaded || (isSignedIn && rows === null)) {
    return (
      <div className={cn("flex items-center justify-center", bare ? "py-10" : "min-h-screen bg-background")}>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className={cn("flex items-center justify-center px-4", bare ? "py-10" : "min-h-screen bg-background")}>
        <p className="text-sm text-muted-foreground">Sign in to see filings shared with you.</p>
      </div>
    )
  }

  return (
    <div className={bare ? "" : "mx-auto max-w-2xl px-4 py-10"}>
      {!bare && (
        <>
          <h1 className="text-lg font-semibold text-foreground">Shared with me</h1>
          <p className="mt-1 text-sm text-muted-foreground">Filings someone invited you to view or work on.</p>
        </>
      )}

      {rows && rows.length === 0 && (
        <div className={cn("rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground", !bare && "mt-6")}>
          <Users className="mx-auto mb-2 h-5 w-5" />
          Nothing shared with you yet. When someone invites you to a filing, it'll show up here.
        </div>
      )}

      <ul className={cn("space-y-2", !bare && "mt-6")}>
        {rows?.map((r) => (
          <li key={r.id}>
            <Link
              href={`/shared/${r.id}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3.5 transition-colors hover:border-primary"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{r.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.subjectName ? `${r.subjectName}'s filing` : "Filing"} ·{" "}
                  {r.myRole ? `${r.myRole.charAt(0).toUpperCase()}${r.myRole.slice(1)} access` : "Shared"}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[11px] text-muted-foreground">{STATUS_LABEL[r.status] ?? r.status}</span>
                {r.daysToDeadline !== null && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-medium",
                      r.urgency === "overdue" || r.urgency === "urgent"
                        ? "bg-destructive/10 text-destructive"
                        : r.urgency === "soon"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    {r.daysToDeadline < 0 ? `${-r.daysToDeadline}d overdue` : `${r.daysToDeadline}d left`}
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
