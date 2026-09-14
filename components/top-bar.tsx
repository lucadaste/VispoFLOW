"use client"

import { useEffect, useState } from "react"
import { Menu, X, Settings, Building2, Users } from "lucide-react"
import { SignInButton, UserButton, useAuth, useOrganizationList } from "@clerk/nextjs"
import type { UserProfile } from "@/lib/profile"
import { ProfileForm } from "@/components/profile-form"
import { ThemeToggle } from "@/components/theme-toggle"

const navIconLink =
  "relative inline-flex items-center justify-center rounded-md border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"

/** Link to /shared (filings someone invited this user to) — only reachable otherwise via a
 *  fresh invite link or direct URL. Badge count is fetched once on sign-in, not polled. */
function SharedWithMeLink() {
  const { isSignedIn } = useAuth()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isSignedIn) return
    fetch("/api/documents")
      .then((r) => (r.ok ? r.json() : { documents: [] }))
      .then((data) => {
        type Row = { isOwnFiling: boolean; mySource: string | null }
        const rows: Row[] = data.documents ?? []
        setCount(rows.filter((d) => !d.isOwnFiling && (d.mySource === "collaborator" || d.mySource === "client")).length)
      })
      .catch(() => {})
  }, [isSignedIn])

  if (!isSignedIn) return null
  return (
    <a href="/shared" title="Shared with me" className={navIconLink}>
      <Users className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
          {count}
        </span>
      )}
    </a>
  )
}

/** Link to /firm — shown only to users who belong to at least one firm (Clerk organization). */
function FirmDashboardLink() {
  const { isLoaded, userMemberships } = useOrganizationList({ userMemberships: true })
  if (!isLoaded || !userMemberships?.data?.length) return null
  return (
    <a href="/firm" title="Firm Dashboard" className={navIconLink}>
      <Building2 className="h-4 w-4" />
    </a>
  )
}

function AuthControls({ profile, onSaveProfile }: { profile: UserProfile; onSaveProfile: (profile: UserProfile) => void }) {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded) return <div className="h-8 w-8" />
  if (isSignedIn) {
    return (
      <UserButton
        appearance={{
          elements: { avatarBox: "h-8 w-8" },
        }}
      >
        <UserButton.UserProfilePage label="account" />
        <UserButton.UserProfilePage
          label="Company Profile"
          url="company-profile"
          labelIcon={<Building2 className="h-4 w-4" />}
        >
          <div className="px-1 py-2">
            <h2 className="mb-1 text-base font-semibold text-foreground">Company Profile</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Save this once and reuse it across every document flow.
            </p>
            <ProfileForm profile={profile} onSave={onSaveProfile} saveLabel="Save" />
          </div>
        </UserButton.UserProfilePage>
        <UserButton.UserProfilePage label="security" />
      </UserButton>
    )
  }
  return (
    <SignInButton mode="modal">
      <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90">
        Sign in
      </button>
    </SignInButton>
  )
}

const PHASES = [
  { key: "home", label: "Home" },
  { key: "chat", label: "Incorporation" },
  { key: "compliance", label: "Compliance" },
  { key: "transactions", label: "Transactions" },
  { key: "documents", label: "My Docs" },
] as const

export function TopBar({
  phase,
  onPhaseClick,
  onOpenSettings,
  profile,
  onSaveProfile,
}: {
  phase: "home" | "chat" | "compliance" | "transactions" | "documents"
  onPhaseClick: (phase: "home" | "chat" | "compliance" | "transactions" | "documents") => void
  onOpenSettings: () => void
  profile: UserProfile
  onSaveProfile: (profile: UserProfile) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  // Signed-in users reach the same profile form via the avatar's "Company Profile" tab —
  // the gear is only needed as a fallback while there's no avatar/account menu to hold it.
  const { isSignedIn, isLoaded } = useAuth()
  const showSettingsGear = isLoaded && !isSignedIn

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur shadow-sm">
      <div className="flex h-14 w-full items-center justify-between px-4 sm:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-12">
        <a
          href="/site"
          className="flex shrink-0 items-center gap-2.5 whitespace-nowrap transition-opacity hover:opacity-80 lg:justify-self-start"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/beaker.png" alt="" className="h-9 w-9 shrink-0 object-contain" />
          <div className="leading-tight text-left">
            <p className="font-serif text-sm font-semibold tracking-tight">Vispo Labs</p>
            <p className="text-[11px] text-muted-foreground">Startup Legal Studio</p>
          </div>
        </a>

        <div className="hidden items-center gap-2 lg:flex lg:justify-self-center">
          <PhasePill active={phase === "home"} label="Home" onClick={() => onPhaseClick("home")} />
          <div className="h-px w-6 bg-border" />
          <PhasePill active={phase === "chat"} label="Incorporation" onClick={() => onPhaseClick("chat")} />
          <div className="h-px w-6 bg-border" />
          <PhasePill active={phase === "compliance"} label="Compliance" onClick={() => onPhaseClick("compliance")} />
          <div className="h-px w-6 bg-border" />
          <PhasePill active={phase === "transactions"} label="Transactions" onClick={() => onPhaseClick("transactions")} />
          <div className="h-px w-6 bg-border" />
          <PhasePill active={phase === "documents"} label="My Docs" onClick={() => onPhaseClick("documents")} />
        </div>

        <div className="flex shrink-0 items-center gap-3 lg:justify-self-end">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex items-center justify-center rounded-md border border-border bg-secondary p-2 text-foreground transition-colors hover:bg-secondary/80 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="h-4 w-4" strokeWidth={2.5} /> : <Menu className="h-4 w-4" strokeWidth={2.5} />}
          </button>

          {showSettingsGear && (
            <button
              type="button"
              onClick={onOpenSettings}
              title="Your profile"
              className="inline-flex items-center justify-center rounded-md border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}

          <FirmDashboardLink />
          <SharedWithMeLink />
          <ThemeToggle />

          <AuthControls profile={profile} onSaveProfile={onSaveProfile} />
        </div>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-30 lg:hidden" onClick={() => setMenuOpen(false)} />
          <div className="relative z-40 border-t border-border bg-card px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1.5">
              {PHASES.map((p) => (
                <button
                  key={p.key}
                  onClick={() => {
                    onPhaseClick(p.key)
                    setMenuOpen(false)
                  }}
                  className={
                    "rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors " +
                    (phase === p.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground")
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </header>
  )
}

function PhasePill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full px-2.5 py-1 text-xs font-medium transition-colors " +
        (active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-muted-foreground hover:bg-secondary/80")
      }
    >
      {label}
    </button>
  )
}
