"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SignInButton, useAuth } from "@clerk/nextjs"
import { updateServerValue } from "@/lib/persist"
import { STORAGE_KEYS } from "@/lib/storage-keys"

const FIRM_ROLES = new Set(["attorney", "staff"])

type Details = {
  email: string
  status: "pending" | "accepted" | "declined" | "expired" | "revoked"
  target: "document" | "account"
  role: string
  subjectTitle: string
  invitedByName: string
  expiresAt: string
  expired: boolean
  signedIn: boolean
  signedInEmail: string | null
  emailMismatch: boolean
}

const primaryBtn =
  "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
const secondaryBtn =
  "rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"

export function InviteClient({ token }: { token: string }) {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useAuth()
  const [details, setDetails] = useState<Details | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<"accepted" | "declined" | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/invitations/accept/${token}`)
      const data = await res.json()
      if (!res.ok) {
        setLoadError(data.error ?? "This invite link is invalid")
        return
      }
      setDetails(data)
    } catch {
      setLoadError("Couldn't load this invite. Check your connection and try again.")
    }
  }, [token])

  // Re-fetch once Clerk finishes loading so the signed-in state is reflected (e.g. right after
  // the sign-in modal closes).
  useEffect(() => {
    if (isLoaded) load()
  }, [isLoaded, isSignedIn, load])

  const accept = async () => {
    setBusy(true)
    try {
      const res = await fetch(`/api/invitations/accept/${token}`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setLoadError(data.error ?? "Couldn't accept this invite")
        return
      }
      setDone("accepted")

      // Accepting an invite already tells us which side of the product this person is on — an
      // account-scoped attorney/staff invite means "firm", anything else (a document
      // collaborator, or a firm's client completing their own filing) means "founder". Backfill
      // it so they never hit the /app onboarding chooser redundantly, but only if they haven't
      // already answered it themselves (never override an explicit choice).
      const kind = data.target === "account" && FIRM_ROLES.has(details?.role ?? "") ? "firm" : "founder"
      updateServerValue<{ kind: string }>(STORAGE_KEYS.accountKind, (current) => (current ? null : { kind }))

      // A client accepting their own filing goes straight into that filing's flow (currently only
      // wired for the Compliance Center — see incorporation-app.tsx's initialComplianceItemId).
      // Any other document invite (a plain collaborator reviewing someone else's filing) still
      // goes to the read-only shared viewer.
      const destination =
        data.role === "client" && data.surface === "compliance" && data.catalogId
          ? `/app?open=${encodeURIComponent(data.catalogId)}`
          : data.target === "document" && data.documentId
            ? `/shared/${data.documentId}`
            : "/firm"
      setTimeout(() => router.push(destination), 1500)
    } finally {
      setBusy(false)
    }
  }

  const decline = async () => {
    setBusy(true)
    try {
      await fetch(`/api/invitations/decline/${token}`, { method: "POST" })
      setDone("declined")
    } finally {
      setBusy(false)
    }
  }

  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">{children}</div>
  )

  if (loadError) {
    return (
      <Card>
        <h1 className="text-base font-semibold text-foreground">Invitation unavailable</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{loadError}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          Ask whoever invited you to send a new link.
        </p>
      </Card>
    )
  }

  if (!details) {
    return <p className="text-sm text-muted-foreground">Loading invitation…</p>
  }

  if (done === "accepted") {
    return (
      <Card>
        <h1 className="text-base font-semibold text-foreground">You're in</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Taking you to {details.target === "document" ? `"${details.subjectTitle}"` : details.subjectTitle}…
        </p>
      </Card>
    )
  }

  if (done === "declined") {
    return (
      <Card>
        <h1 className="text-base font-semibold text-foreground">Invitation declined</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          No problem — you can close this page.
        </p>
      </Card>
    )
  }

  if (details.status !== "pending") {
    const msg: Record<string, string> = {
      accepted: "This invite has already been accepted.",
      declined: "This invite was declined.",
      revoked: "The sender revoked this invite.",
      expired: "This invite link has expired.",
    }
    return (
      <Card>
        <h1 className="text-base font-semibold text-foreground">Invitation {details.status}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {msg[details.status] ?? "This invite is no longer valid."} Ask{" "}
          {details.invitedByName} for a new link.
        </p>
      </Card>
    )
  }

  const roleLabel = details.role.charAt(0).toUpperCase() + details.role.slice(1)

  return (
    <Card>
      <h1 className="text-base font-semibold text-foreground">
        {details.invitedByName} invited you
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {details.target === "document" ? (
          <>
            To collaborate on <span className="font-medium text-foreground">{details.subjectTitle}</span> as{" "}
            <span className="font-medium text-foreground">{roleLabel}</span>.
          </>
        ) : (
          <>
            To join the <span className="font-medium text-foreground">{details.subjectTitle}</span> workspace as{" "}
            <span className="font-medium text-foreground">{roleLabel}</span>.
          </>
        )}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Sent to {details.email} · expires {new Date(details.expiresAt).toLocaleDateString("en-US", { dateStyle: "long" })}
      </p>

      {!details.signedIn ? (
        <div className="mt-5">
          <SignInButton mode="modal" forceRedirectUrl={`/invite/${token}`} signUpForceRedirectUrl={`/invite/${token}`}>
            <button className={primaryBtn}>Sign in to accept</button>
          </SignInButton>
          <p className="mt-2 text-xs text-muted-foreground">
            Use {details.email} if you can, so your access is linked to the right person.
          </p>
        </div>
      ) : (
        <>
          {details.emailMismatch && (
            <p className="mt-4 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
              This invite was sent to {details.email}, but you're signed in as {details.signedInEmail}. You can still
              accept — access will be linked to your current account.
            </p>
          )}
          <div className="mt-5 flex gap-2">
            <button className={primaryBtn} onClick={accept} disabled={busy}>
              Accept
            </button>
            <button className={secondaryBtn} onClick={decline} disabled={busy}>
              Decline
            </button>
          </div>
        </>
      )}
    </Card>
  )
}
