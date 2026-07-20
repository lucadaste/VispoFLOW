"use client"

import { useEffect, useState } from "react"
import { Loader2, CheckCircle2, Building2 } from "lucide-react"

export function NameCheckCard({
  companyName,
  onDone,
}: {
  companyName: string
  onDone?: () => void
}) {
  const [done, setDone] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setDone(true)
      onDone?.()
    }, 2400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex animate-message-in items-start gap-3 pl-11">
      <div className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-3.5 py-2">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Delaware Division of Corporations
          </span>
        </div>
        <div className="flex items-center gap-3 px-3.5 py-3.5">
          {done ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
          ) : (
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
          )}
          <div className="leading-tight">
            <p className="text-sm font-medium text-foreground">{companyName}</p>
            <p className="text-xs text-muted-foreground">
              {done ? "Name available for registration" : "Checking entity name availability…"}
            </p>
          </div>
          {done && (
            <span className="ml-auto rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success ring-1 ring-success/20">
              Available
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
