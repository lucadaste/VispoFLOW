"use client"

import { PartyPopper, MapPin, Users, Layers } from "lucide-react"
import type { FlowAnswers } from "@/lib/flow"
import { AUTHORIZED_SHARES } from "@/lib/flow"

export function FormedCard({ answers }: { answers: FlowAnswers }) {
  return (
    <div className="flex animate-message-in items-start gap-3 pl-11">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-success/30 bg-card shadow-sm">
        <div className="flex items-center gap-2.5 bg-success/10 px-4 py-3">
          <PartyPopper className="h-5 w-5 text-success" />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">{answers.companyName}</p>
            <p className="text-xs text-success">Delaware C-Corporation · Validly formed</p>
          </div>
        </div>
        <dl className="divide-y divide-border text-sm">
          <Row icon={<MapPin className="h-4 w-4" />} label="Principal address" value={answers.corpAddress} />
          <Row
            icon={<Users className="h-4 w-4" />}
            label="Directors"
            value={answers.directors.join(", ")}
          />
          <Row
            icon={<Layers className="h-4 w-4" />}
            label="Authorized shares"
            value={`${AUTHORIZED_SHARES.toLocaleString()} common`}
          />
        </dl>
      </div>
    </div>
  )
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-2.5">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm text-foreground">{value}</dd>
      </div>
    </div>
  )
}
