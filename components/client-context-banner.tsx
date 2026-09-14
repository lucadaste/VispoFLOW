"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@clerk/nextjs"
import { Building2 } from "lucide-react"

type Row = {
  id: string
  title: string
  mySource: string | null
  isOwnFiling: boolean
  subjectName: string | null
  deadlineDate: string | null
  daysToDeadline: number | null
}

/**
 * A firm's client filling in their own filing through the normal app shouldn't have to guess
 * *why* they're here — this makes it explicit, right at the top, without restricting where they
 * can otherwise go (the plan's stricter "scoped view, only the fields they need" is a larger
 * change; this is the lightweight version: clear framing, not a locked-down UI).
 */
export function ClientContextBanner() {
  const { isLoaded, isSignedIn } = useAuth()
  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    fetch("/api/documents")
      .then((r) => (r.ok ? r.json() : { documents: [] }))
      .then((data) => setRows((data.documents ?? []).filter((d: Row) => d.mySource === "client")))
      .catch(() => {})
  }, [isLoaded, isSignedIn])

  if (rows.length === 0) return null

  return (
    <div className="border-b border-border bg-primary/5 px-4 py-2 text-center text-xs text-foreground sm:px-8 lg:px-12">
      <Building2 className="mr-1.5 inline h-3.5 w-3.5 text-primary" />
      {rows.length === 1 ? (
        <>
          You&apos;re completing <span className="font-medium">{rows[0].title}</span> for your law firm
          {rows[0].daysToDeadline !== null && (
            <>
              {" "}
              — {rows[0].daysToDeadline < 0 ? "past due" : `${rows[0].daysToDeadline} day${rows[0].daysToDeadline === 1 ? "" : "s"} left`}
            </>
          )}
          . <Link href="/shared" className="font-medium text-primary hover:underline">Details</Link>
        </>
      ) : (
        <>
          You&apos;re completing {rows.length} filings requested by your law firm.{" "}
          <Link href="/shared" className="font-medium text-primary hover:underline">View them</Link>
        </>
      )}
    </div>
  )
}
