"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useAuth, useOrganization, OrganizationSwitcher, CreateOrganization } from "@clerk/nextjs"
import { AlertTriangle, Check, Copy, Loader2, Plus, Users } from "lucide-react"
import { cn } from "@/lib/utils"

type FirmCtx = { firm: { accountId: string; name: string }; role: string; scope: string; canManage: boolean }
type ClientRow = {
  documentId: string
  title: string
  clientName: string | null
  clientEmail: string | null
  clientRegistered: boolean
  grantDate: string | null
  deadlineDate: string | null
  daysToDeadline: number | null
  urgency: "none" | "overdue" | "urgent" | "soon" | "ok"
  status: string
  assignedToName: string | null
}
type Member = { userId: string; name: string; email: string; role: string; scope: string; isSelf: boolean }
type PendingTeamInvite = { invitationId: string; email: string; role: string; scope: string | null }

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  awaiting_client_info: "Awaiting client info",
  awaiting_review: "Awaiting review",
  ready_to_sign: "Ready to sign",
  signed: "Signed",
  filed: "Filed",
}

const card = "rounded-xl border border-border bg-card p-4"
const primaryBtn =
  "inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
const inputCls =
  "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"

function DeadlinePill({ row }: { row: ClientRow }) {
  if (row.daysToDeadline === null) {
    return <span className="text-xs text-muted-foreground">—</span>
  }
  const tone =
    row.urgency === "overdue" || row.urgency === "urgent"
      ? "bg-destructive/10 text-destructive border-destructive/30"
      : row.urgency === "soon"
        ? "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400"
        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
  const label =
    row.daysToDeadline < 0
      ? `${Math.abs(row.daysToDeadline)}d overdue`
      : row.daysToDeadline === 0
        ? "due today"
        : `${row.daysToDeadline}d left`
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", tone)}>
      {label}
      {row.deadlineDate ? ` · ${new Date(row.deadlineDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}
    </span>
  )
}

export function FirmDashboard() {
  const { isLoaded, isSignedIn, orgId } = useAuth()
  const { organization } = useOrganization()
  const [ctx, setCtx] = useState<FirmCtx | null>(null)
  const [ctxError, setCtxError] = useState<string | null>(null)
  const [clients, setClients] = useState<ClientRow[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [pendingTeam, setPendingTeam] = useState<PendingTeamInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [settingUp, setSettingUp] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const firmRes = await fetch("/api/firm")
      if (!firmRes.ok) {
        setCtxError((await firmRes.json().catch(() => ({}))).error ?? "Couldn't load your firm")
        setCtx(null)
        return
      }
      setCtxError(null)
      setCtx(await firmRes.json())

      const [clientsRes, teamRes] = await Promise.all([fetch("/api/firm/clients"), fetch("/api/firm/team")])
      if (clientsRes.ok) setClients((await clientsRes.json()).clients ?? [])
      if (teamRes.ok) {
        const t = await teamRes.json()
        setMembers(t.members ?? [])
        setPendingTeam(t.pending ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && isSignedIn && orgId) loadAll()
    else if (isLoaded) setLoading(false)
  }, [isLoaded, isSignedIn, orgId, loadAll])

  const confirmSetup = async () => {
    setSettingUp(true)
    setSetupError(null)
    try {
      const res = await fetch("/api/firm/setup", { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSetupError(data.error ?? "Couldn't set up your firm")
        return
      }
      await loadAll()
    } finally {
      setSettingUp(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isSignedIn) {
    return <Centered>Sign in to view your firm dashboard.</Centered>
  }

  if (!orgId) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <h1 className="text-lg font-semibold text-foreground">Set up your firm</h1>
        <p className="text-sm text-muted-foreground">
          A firm workspace lets you manage every client&apos;s filing and deadline in one place — this is only for
          lawyers/firms managing clients, not for filing your own company&apos;s paperwork. Create one, or switch to an
          existing firm.
        </p>
        <div className="flex items-center gap-3">
          <OrganizationSwitcher hidePersonal afterCreateOrganizationUrl="/firm" afterSelectOrganizationUrl="/firm" />
        </div>
        <div className="mt-2">
          <CreateOrganization afterCreateOrganizationUrl="/firm" skipInvitationScreen />
        </div>
      </div>
    )
  }

  // Has an active Clerk organization, but it's never explicitly been set up as a firm workspace
  // here — require a deliberate confirmation rather than silently provisioning one. This is what
  // stops an unrelated organization someone happens to belong to from quietly turning into a
  // full firm dashboard.
  if (ctxError && !ctx) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <h1 className="text-lg font-semibold text-foreground">Use &ldquo;{organization?.name ?? "this organization"}&rdquo; as your firm?</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;re currently in an organization that hasn&apos;t been set up as a VispoFLOW firm workspace. Only
          confirm this if you&apos;re a lawyer or firm managing clients — an individual founder filing their own
          paperwork doesn&apos;t need this.
        </p>
        {setupError && <p className="text-xs text-destructive">{setupError}</p>}
        <div className="flex items-center gap-3">
          <button className={primaryBtn} onClick={confirmSetup} disabled={settingUp}>
            {settingUp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Yes, set up my firm here
          </button>
          <OrganizationSwitcher hidePersonal afterCreateOrganizationUrl="/firm" afterSelectOrganizationUrl="/firm" />
        </div>
        <Link href="/app" className="text-xs font-medium text-muted-foreground hover:text-foreground">
          Not a firm — take me back to the app
        </Link>
      </div>
    )
  }

  const overdueOrUrgent = clients.filter((c) => c.urgency === "overdue" || c.urgency === "urgent")

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{ctx?.firm.name ?? organization?.name}</h1>
          <p className="text-xs text-muted-foreground">
            {clients.length} filing{clients.length === 1 ? "" : "s"} · you&apos;re {ctx?.role}
            {ctx?.scope === "assigned_only" ? " (your assigned clients only)" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OrganizationSwitcher hidePersonal afterSelectOrganizationUrl="/firm" afterCreateOrganizationUrl="/firm" />
          <Link href="/app" className="text-xs font-medium text-muted-foreground hover:text-foreground">
            ← Back to app
          </Link>
        </div>
      </header>

      {overdueOrUrgent.length > 0 && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-xs text-destructive">
            {overdueOrUrgent.length} filing{overdueOrUrgent.length === 1 ? "" : "s"} due within 7 days or overdue —{" "}
            {overdueOrUrgent.map((c) => c.clientName || c.clientEmail).join(", ")}
          </p>
        </div>
      )}

      {ctx?.canManage && <AddClient members={members} onAdded={loadAll} />}

      <section className="mt-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Client roster</h2>
        <div className={cn(card, "overflow-x-auto p-0")}>
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Client</th>
                <th className="px-3 py-2 font-medium">Filing</th>
                <th className="px-3 py-2 font-medium">Grant date</th>
                <th className="px-3 py-2 font-medium">Deadline</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Assigned</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                    No clients yet. Add one above to start tracking a deadline.
                  </td>
                </tr>
              )}
              {clients.map((c) => (
                <tr key={c.documentId} className="border-b border-border last:border-0">
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-foreground">{c.clientName || c.clientEmail}</div>
                    {!c.clientRegistered && <div className="text-[11px] text-muted-foreground">invite pending</div>}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    <Link href={`/shared/${c.documentId}`} className="hover:text-primary hover:underline">
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {c.grantDate ? new Date(c.grantDate).toLocaleDateString("en-US", { dateStyle: "medium" }) : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <DeadlinePill row={c} />
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{STATUS_LABEL[c.status] ?? c.status}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{c.assignedToName ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <TeamSection
        members={members}
        pending={pendingTeam}
        canManage={ctx?.canManage ?? false}
        accountId={ctx?.firm.accountId ?? ""}
        onChange={loadAll}
      />
    </div>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  )
}

function ShareLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="mt-2 rounded-md border border-border bg-secondary/40 p-2">
      <p className="text-[11px] text-muted-foreground">Email delivery isn&apos;t set up yet — send them this link:</p>
      <div className="mt-1 flex items-center gap-1.5">
        <code className="min-w-0 flex-1 truncate rounded bg-background px-1.5 py-1 text-[11px]">{url}</code>
        <button
          className="rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-secondary"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url)
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            } catch {
              /* still shown for manual copy */
            }
          }}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  )
}

function AddClient({ members, onAdded }: { members: Member[]; onAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [grantDate, setGrantDate] = useState("")
  const [assignedToUserId, setAssignedToUserId] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [link, setLink] = useState<string | null>(null)

  const submit = async () => {
    setBusy(true)
    setError(null)
    setLink(null)
    try {
      const res = await fetch("/api/firm/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          grantDate: grantDate || undefined,
          assignedToUserId: assignedToUserId || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Couldn't add the client")
        return
      }
      setName("")
      setEmail("")
      setGrantDate("")
      if (!data.invite?.emailed) setLink(data.invite?.acceptUrl ?? null)
      onAdded()
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button className={primaryBtn} onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" /> Add client
      </button>
    )
  }

  return (
    <div className={card}>
      <p className="mb-2.5 text-xs font-semibold text-foreground">New client — 83(b) election</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <input className={inputCls} placeholder="Client name" value={name} onChange={(e) => setName(e.target.value)} />
        <input
          className={inputCls}
          type="email"
          placeholder="client@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="text-[11px] text-muted-foreground">
          Stock grant date
          <input className={inputCls} type="date" value={grantDate} onChange={(e) => setGrantDate(e.target.value)} />
        </label>
        <label className="text-[11px] text-muted-foreground">
          Assign to
          <select
            className={inputCls}
            value={assignedToUserId}
            onChange={(e) => setAssignedToUserId(e.target.value)}
          >
            <option value="">Me</option>
            {members
              .filter((m) => !m.isSelf)
              .map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.name}
                </option>
              ))}
          </select>
        </label>
      </div>
      {grantDate && (
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Deadline: {new Date(new Date(grantDate).getTime() + 30 * 864e5).toLocaleDateString("en-US", { dateStyle: "long" })} (30 days)
        </p>
      )}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {link && <ShareLink url={link} />}
      <div className="mt-3 flex gap-2">
        <button className={primaryBtn} onClick={submit} disabled={busy || !name.trim() || !email.trim()}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Add & invite
        </button>
        <button
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function TeamSection({
  members,
  pending,
  canManage,
  accountId,
  onChange,
}: {
  members: Member[]
  pending: PendingTeamInvite[]
  canManage: boolean
  accountId: string
  onChange: () => void
}) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"attorney" | "staff">("staff")
  const [scope, setScope] = useState<"all_clients" | "assigned_only">("all_clients")
  const [busy, setBusy] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const invite = async () => {
    setBusy(true)
    setError(null)
    setLink(null)
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, email: email.trim(), role, scope }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Couldn't send the invite")
        return
      }
      setEmail("")
      if (!data.emailed) setLink(data.acceptUrl)
      onChange()
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mt-6">
      <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Users className="h-3.5 w-3.5" /> Team
      </h2>
      <div className={card}>
        <ul className="space-y-1.5">
          {members.map((m) => (
            <li key={m.userId} className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate text-foreground">
                {m.name} <span className="text-muted-foreground">· {m.email}</span>
              </span>
              <span className="capitalize text-muted-foreground">
                {m.role}
                {m.scope === "assigned_only" ? " · assigned only" : ""}
              </span>
            </li>
          ))}
          {pending.map((p) => (
            <li key={p.invitationId} className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="truncate">{p.email} · invited</span>
              <span className="capitalize">{p.role}</span>
            </li>
          ))}
        </ul>

        {canManage && (
          <div className="mt-3 border-t border-border pt-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                className={inputCls}
                type="email"
                placeholder="colleague@firm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value as "attorney" | "staff")}>
                <option value="staff">Staff</option>
                <option value="attorney">Attorney</option>
              </select>
              <select
                className={inputCls}
                value={scope}
                onChange={(e) => setScope(e.target.value as "all_clients" | "assigned_only")}
              >
                <option value="all_clients">All clients</option>
                <option value="assigned_only">Assigned only</option>
              </select>
            </div>
            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
            {link && <ShareLink url={link} />}
            <button className={cn(primaryBtn, "mt-2")} onClick={invite} disabled={busy || !email.trim()}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Invite to firm
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
