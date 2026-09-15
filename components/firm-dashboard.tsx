"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useAuth, useOrganization, OrganizationSwitcher, CreateOrganization, UserButton } from "@clerk/nextjs"
import { AlertTriangle, Check, Copy, Loader2, Plus, Users, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ConfirmModal } from "@/components/confirm-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { COMPLIANCE_CATEGORIES } from "@/lib/flow"

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
  nextStatuses: string[]
  assignedToUserId: string | null
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

/** The status column: a plain label for anyone without manage access, or a select offering
 *  exactly the transitions the server allows (see lib/documents.ts's nextStatusOptions) for
 *  attorneys/owners. Never lets the client invent a transition the server wouldn't accept. */
function StatusCell({ row, canManage, onChanged }: { row: ClientRow; canManage: boolean; onChanged: () => void }) {
  const [busy, setBusy] = useState(false)

  if (!canManage || row.nextStatuses.length === 0) {
    return <span className="text-muted-foreground">{STATUS_LABEL[row.status] ?? row.status}</span>
  }

  const change = async (status: string) => {
    if (status === row.status) return
    setBusy(true)
    try {
      const res = await fetch(`/api/documents/${row.documentId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) onChanged()
    } finally {
      setBusy(false)
    }
  }

  return (
    <select
      value={row.status}
      disabled={busy}
      onChange={(e) => change(e.target.value)}
      className="rounded-md border border-border bg-background px-1.5 py-1 text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
    >
      <option value={row.status}>{STATUS_LABEL[row.status] ?? row.status}</option>
      {row.nextStatuses.map((s) => (
        <option key={s} value={s}>
          → {STATUS_LABEL[s] ?? s}
        </option>
      ))}
    </select>
  )
}

/** Removes a client from the roster (with a confirmation, since it's not undoable from the UI).
 *  Doesn't touch the client's own filing data — see lib/documents.ts's removeClientDocument. */
function RemoveClientButton({ row, onRemoved }: { row: ClientRow; onRemoved: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  const remove = async () => {
    setBusy(true)
    try {
      const res = await fetch(`/api/firm/clients/${row.documentId}`, { method: "DELETE" })
      if (res.ok) onRemoved()
    } finally {
      setBusy(false)
      setConfirming(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        title="Remove from roster"
        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      {confirming && (
        <ConfirmModal
          title={`Remove ${row.clientName || row.clientEmail} from your roster?`}
          description="This stops the firm from tracking this filing and its deadline. If they've already started filling it in, their work isn't deleted — you just won't see it here anymore."
          confirmLabel={busy ? "Removing…" : "Remove"}
          danger
          onConfirm={remove}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
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
  const [addFilingFor, setAddFilingFor] = useState<{ name: string; email: string; assignedToUserId: string | null } | null>(
    null,
  )
  const [inviteOpen, setInviteOpen] = useState(false)

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
      <>
        <BrandHeader />
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  if (!isSignedIn) {
    return (
      <>
        <BrandHeader />
        <Centered>Sign in to view your firm dashboard.</Centered>
      </>
    )
  }

  if (!orgId) {
    return (
      <>
        <BrandHeader />
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-4 py-12 text-center">
          <h1 className="text-lg font-semibold text-foreground">Set up your firm</h1>
          <p className="text-sm text-muted-foreground">
            A firm workspace lets you manage every client&apos;s filing and deadline in one place — this is only for
            lawyers/firms managing clients, not for filing your own company&apos;s paperwork. Create one, or switch to
            an existing firm.
          </p>
          <div className="flex items-center gap-3">
            <OrganizationSwitcher hidePersonal afterCreateOrganizationUrl="/firm" afterSelectOrganizationUrl="/firm" />
          </div>
          <div className="mt-2">
            <CreateOrganization afterCreateOrganizationUrl="/firm" skipInvitationScreen />
          </div>
        </div>
      </>
    )
  }

  // Has an active Clerk organization, but it's never explicitly been set up as a firm workspace
  // here — require a deliberate confirmation rather than silently provisioning one. This is what
  // stops an unrelated organization someone happens to belong to from quietly turning into a
  // full firm dashboard.
  if (ctxError && !ctx) {
    return (
      <>
        <BrandHeader />
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-4 py-12 text-center">
          <h1 className="text-lg font-semibold text-foreground">
            Set up &ldquo;{organization?.name ?? "this organization"}&rdquo; as a firm workspace?
          </h1>
          <p className="text-sm text-muted-foreground">
            This turns &ldquo;{organization?.name ?? "this organization"}&rdquo; into a VispoFLOW firm workspace — a
            client roster, deadline tracking, and client invitations. It&apos;s for lawyers and firms managing
            multiple clients, not for filing your own company&apos;s paperwork under this organization.
          </p>
          {setupError && <p className="text-xs text-destructive">{setupError}</p>}
          <button className={primaryBtn} onClick={confirmSetup} disabled={settingUp}>
            {settingUp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Yes, set up this workspace
          </button>
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-[11px] text-muted-foreground">Wrong organization?</p>
            <OrganizationSwitcher hidePersonal afterCreateOrganizationUrl="/firm" afterSelectOrganizationUrl="/firm" />
          </div>
        </div>
      </>
    )
  }

  const overdueOrUrgent = clients.filter((c) => c.urgency === "overdue" || c.urgency === "urgent")

  // One client can have several filings (documents rows); group rows sharing a client email so
  // the roster shows one entry per person with their filings nested underneath, instead of a
  // duplicate "client" row per filing.
  const clientGroups: { key: string; rows: ClientRow[] }[] = []
  const groupIndex = new Map<string, number>()
  for (const c of clients) {
    const key = c.clientEmail ?? c.documentId
    const idx = groupIndex.get(key)
    if (idx === undefined) {
      groupIndex.set(key, clientGroups.length)
      clientGroups.push({ key, rows: [c] })
    } else {
      clientGroups[idx].rows.push(c)
    }
  }

  return (
    <>
      <BrandHeader />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{ctx?.firm.name ?? organization?.name}</h1>
            <p className="text-xs text-muted-foreground">
              {clientGroups.length} client{clientGroups.length === 1 ? "" : "s"} · {clients.length} filing
              {clients.length === 1 ? "" : "s"} · you&apos;re {ctx?.role}
              {ctx?.scope === "assigned_only" ? " (your assigned clients only)" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {ctx?.canManage && (
              <button className={primaryBtn} onClick={() => setInviteOpen((o) => !o)}>
                <Plus className="h-3.5 w-3.5" /> Invite to firm
              </button>
            )}
            <OrganizationSwitcher hidePersonal afterSelectOrganizationUrl="/firm" afterCreateOrganizationUrl="/firm" />
          </div>
        </header>

        {inviteOpen && ctx?.canManage && (
          <InviteTeamMember
            accountId={ctx.firm.accountId}
            onInvited={loadAll}
            onClose={() => setInviteOpen(false)}
          />
        )}

        {overdueOrUrgent.length > 0 && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-xs text-destructive">
            {overdueOrUrgent.length} filing{overdueOrUrgent.length === 1 ? "" : "s"} due within 7 days or overdue —{" "}
            {overdueOrUrgent.map((c) => c.clientName || c.clientEmail).join(", ")}
          </p>
        </div>
      )}

      {ctx?.canManage && (
        <AddClient
          members={members}
          onAdded={() => {
            loadAll()
          }}
          prefill={addFilingFor}
          onClose={() => setAddFilingFor(null)}
        />
      )}

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
                {ctx?.canManage && <th className="px-3 py-2 font-medium" />}
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 && (
                <tr>
                  <td colSpan={ctx?.canManage ? 7 : 6} className="px-3 py-6 text-center text-muted-foreground">
                    No clients yet. Add one above to start tracking a deadline.
                  </td>
                </tr>
              )}
              {clientGroups.flatMap((group) =>
                group.rows.map((c, i) => (
                  <tr key={c.documentId} className="border-b border-border last:border-0">
                    {i === 0 && (
                      <td className="px-3 py-2.5 align-top" rowSpan={group.rows.length}>
                        <div className="font-medium text-foreground">{c.clientName || c.clientEmail}</div>
                        {!c.clientRegistered && <div className="text-[11px] text-muted-foreground">invite pending</div>}
                        {ctx?.canManage && (
                          <button
                            className="mt-1 text-[11px] font-medium text-primary hover:underline"
                            onClick={() =>
                              setAddFilingFor({
                                name: c.clientName ?? "",
                                email: c.clientEmail ?? "",
                                assignedToUserId: c.assignedToUserId,
                              })
                            }
                          >
                            + Add filing
                          </button>
                        )}
                      </td>
                    )}
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
                    <td className="px-3 py-2.5">
                      <StatusCell row={c} canManage={ctx?.canManage ?? false} onChanged={loadAll} />
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{c.assignedToName ?? "—"}</td>
                    {ctx?.canManage && (
                      <td className="px-3 py-2.5 text-right">
                        <RemoveClientButton row={c} onRemoved={loadAll} />
                      </td>
                    )}
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </section>

        <TeamSection members={members} pending={pendingTeam} />
      </div>
    </>
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

function AddClient({
  members,
  onAdded,
  prefill,
  onClose,
}: {
  members: Member[]
  onAdded: () => void
  /** Set when "+ Add filing" is clicked on an existing roster entry — locks the identity fields
   *  so the new document attaches to that same client instead of creating a new one. */
  prefill: { name: string; email: string; assignedToUserId: string | null } | null
  onClose: () => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [catalogId, setCatalogId] = useState("")
  const [grantDate, setGrantDate] = useState("")
  const [assignedToUserId, setAssignedToUserId] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [link, setLink] = useState<string | null>(null)
  const locked = !!prefill

  useEffect(() => {
    if (!prefill) return
    setOpen(true)
    setName(prefill.name)
    setEmail(prefill.email)
    setAssignedToUserId(prefill.assignedToUserId ?? "")
    setCatalogId("")
    setGrantDate("")
    setError(null)
    setLink(null)
  }, [prefill])

  const reset = () => {
    setOpen(false)
    setName("")
    setEmail("")
    setCatalogId("")
    setGrantDate("")
    setAssignedToUserId("")
    setError(null)
    setLink(null)
    onClose()
  }

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
          catalogId,
          grantDate: grantDate || undefined,
          assignedToUserId: assignedToUserId || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Couldn't add the filing")
        return
      }
      // Adding a filing for an existing client: keep their identity filled in so another filing
      // can be added right after. A brand-new client: clear everything for the next entry.
      if (!locked) {
        setName("")
        setEmail("")
      }
      setCatalogId("")
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
      <p className="mb-2.5 text-xs font-semibold text-foreground">
        {locked ? `Add a filing for ${name || email}` : "New client"}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          className={inputCls}
          placeholder="Client name"
          value={name}
          disabled={locked}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={inputCls}
          type="email"
          placeholder="client@email.com"
          value={email}
          disabled={locked}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="text-[11px] text-muted-foreground sm:col-span-2">
          Filing
          <select className={inputCls} value={catalogId} onChange={(e) => setCatalogId(e.target.value)}>
            <option value="" disabled>
              Select desired filing
            </option>
            {COMPLIANCE_CATEGORIES.map((category) => (
              <optgroup key={category.id} label={category.label}>
                {category.groups.flatMap((group) =>
                  group.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  )),
                )}
              </optgroup>
            ))}
          </select>
        </label>
        {catalogId === "83b" && (
          <label className="text-[11px] text-muted-foreground">
            Stock grant date
            <input className={inputCls} type="date" value={grantDate} onChange={(e) => setGrantDate(e.target.value)} />
          </label>
        )}
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
      {catalogId === "83b" && grantDate && (
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Deadline: {new Date(new Date(grantDate).getTime() + 30 * 864e5).toLocaleDateString("en-US", { dateStyle: "long" })} (30 days)
        </p>
      )}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {link && <ShareLink url={link} />}
      <div className="mt-3 flex gap-2">
        <button className={primaryBtn} onClick={submit} disabled={busy || !name.trim() || !email.trim() || !catalogId}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Add & invite
        </button>
        <button
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          onClick={reset}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function TeamSection({ members, pending }: { members: Member[]; pending: PendingTeamInvite[] }) {
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
          {members.length === 0 && pending.length === 0 && (
            <li className="py-1 text-xs text-muted-foreground">No team members yet.</li>
          )}
        </ul>
      </div>
    </section>
  )
}

/** Opened from the "Invite to firm" button in the dashboard header (kept next to the firm name,
 *  not buried in the Team section below) — adds an attorney/staff member to the firm account. */
function InviteTeamMember({
  accountId,
  onInvited,
  onClose,
}: {
  accountId: string
  onInvited: () => void
  onClose: () => void
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
      onInvited()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={cn(card, "mb-5")}>
      <p className="mb-2.5 text-xs font-semibold text-foreground">Invite to firm</p>
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
      <div className="mt-3 flex gap-2">
        <button className={primaryBtn} onClick={invite} disabled={busy || !email.trim()}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Send invite
        </button>
        <button
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

/** Shared chrome so the firm dashboard doesn't feel like a walled-off tool with no way back to
 *  the rest of the product — same brand mark as the founder-side TopBar (components/top-bar.tsx),
 *  trimmed to what applies here (no founder-only phase nav, since those routes redirect a
 *  firm-kind account straight back to /firm anyway — see components/account-kind-gate.tsx). */
function BrandHeader() {
  const { isSignedIn } = useAuth()
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <a href="/site" className="flex shrink-0 items-center gap-2.5 whitespace-nowrap transition-opacity hover:opacity-80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/beaker.png" alt="" className="h-8 w-8 shrink-0 object-contain" />
          <div className="text-left leading-tight">
            <p className="font-serif text-sm font-semibold tracking-tight">Vispo Labs</p>
            <p className="text-[11px] text-muted-foreground">Startup Legal Studio</p>
          </div>
        </a>
        <div className="flex shrink-0 items-center gap-2">
          {isSignedIn && (
            <a
              href="/shared"
              title="Shared with me"
              className="inline-flex items-center justify-center rounded-md border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Users className="h-4 w-4" />
            </a>
          )}
          <ThemeToggle />
          {isSignedIn && <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />}
        </div>
      </div>
    </header>
  )
}
