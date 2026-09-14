"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Copy, Loader2, UserPlus, X } from "lucide-react"
import { ConfirmModal } from "@/components/confirm-modal"

/**
 * Self-contained "Collaborators" section for a document. Drop it into the document viewer with
 * just a `documentId`. Talks to /api/documents/:id/collaborators and /api/invitations. Shows the
 * invite link inline whenever email delivery isn't available yet, so it's usable before a Resend
 * domain is verified.
 */

type Collaborator = { userId: string; name: string; email: string; role: string; status: string }
type PendingInvite = { invitationId: string; email: string; role: string; expiresAt: string }

const inputCls =
  "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
const primaryBtn =
  "inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
const ghostBtn =
  "rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"

function RoleBadge({ role }: { role: string }) {
  return (
    <span className="rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[11px] font-medium capitalize text-muted-foreground">
      {role}
    </span>
  )
}

export function CollaboratorsPanel({ documentId, bare = false }: { documentId: string; bare?: boolean }) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [pending, setPending] = useState<PendingInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)

  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"editor" | "viewer">("viewer")
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [removing, setRemoving] = useState<Collaborator | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/documents/${documentId}/collaborators`)
      if (res.status === 403) {
        setForbidden(true)
        return
      }
      if (!res.ok) return
      const data = await res.json()
      setCollaborators(data.collaborators ?? [])
      setPending(data.pending ?? [])
    } finally {
      setLoading(false)
    }
  }, [documentId])

  useEffect(() => {
    load()
  }, [load])

  const invite = async () => {
    if (!email.trim()) return
    setInviting(true)
    setInviteError(null)
    setShareLink(null)
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, email: email.trim(), role }),
      })
      const data = await res.json()
      if (!res.ok) {
        setInviteError(data.error ?? "Couldn't send the invite")
        return
      }
      setEmail("")
      if (!data.emailed) setShareLink(data.acceptUrl)
      await load()
    } finally {
      setInviting(false)
    }
  }

  const resend = async (invitationId: string) => {
    const res = await fetch(`/api/invitations/${invitationId}/resend`, { method: "POST" })
    const data = await res.json().catch(() => ({}))
    if (res.ok && !data.emailed && data.acceptUrl) setShareLink(data.acceptUrl)
    await load()
  }

  const revokeInvite = async (invitationId: string) => {
    await fetch(`/api/invitations/${invitationId}/revoke`, { method: "POST" })
    await load()
  }

  const removeCollaborator = async (c: Collaborator) => {
    await fetch(`/api/documents/${documentId}/collaborators/${c.userId}`, { method: "DELETE" })
    setRemoving(null)
    await load()
  }

  const copyLink = async () => {
    if (!shareLink) return
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked — the link is still shown for manual copy */
    }
  }

  if (forbidden) return null

  const activeCount = collaborators.length + pending.length

  return (
    <div className={bare ? "" : "rounded-lg border border-border bg-card p-3.5"}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground">
          {bare ? "Manage access" : `Collaborators${activeCount > 0 ? ` (${activeCount})` : ""}`}
        </p>
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      </div>

      {activeCount === 0 && !loading && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          No one else can see this filing. Invite someone to view or edit it.
        </p>
      )}

      {(collaborators.length > 0 || pending.length > 0) && (
        <ul className="mt-2.5 space-y-1.5">
          {collaborators.map((c) => (
            <li key={c.userId} className="flex items-center justify-between gap-2 text-xs">
              <span className="min-w-0 flex-1 truncate text-foreground">
                {c.name} <span className="text-muted-foreground">· {c.email}</span>
              </span>
              <RoleBadge role={c.role} />
              <button className={ghostBtn} onClick={() => setRemoving(c)}>
                Remove
              </button>
            </li>
          ))}
          {pending.map((p) => (
            <li key={p.invitationId} className="flex items-center justify-between gap-2 text-xs">
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                {p.email} · invited
              </span>
              <RoleBadge role={p.role} />
              <button className={ghostBtn} onClick={() => resend(p.invitationId)}>
                Resend
              </button>
              <button className={ghostBtn} onClick={() => revokeInvite(p.invitationId)}>
                Revoke
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 space-y-2 border-t border-border pt-3">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className={inputCls}
            onKeyDown={(e) => e.key === "Enter" && invite()}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
            className="rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
        </div>
        <button className={primaryBtn} onClick={invite} disabled={inviting || !email.trim()}>
          {inviting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
          Invite
        </button>
        {inviteError && <p className="text-xs text-destructive">{inviteError}</p>}
        {shareLink && (
          <div className="rounded-md border border-border bg-secondary/40 p-2">
            <p className="text-[11px] text-muted-foreground">
              Email delivery isn&apos;t set up yet — send them this link:
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <code className="min-w-0 flex-1 truncate rounded bg-background px-1.5 py-1 text-[11px] text-foreground">
                {shareLink}
              </code>
              <button className={ghostBtn} onClick={copyLink}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {removing && (
        <ConfirmModal
          title={`Remove ${removing.name}?`}
          description="They'll lose access to this filing immediately."
          confirmLabel="Remove"
          danger
          onConfirm={() => removeCollaborator(removing)}
          onCancel={() => setRemoving(null)}
        />
      )}
    </div>
  )
}
