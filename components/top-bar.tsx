"use client"

import { Scale, RotateCcw } from "lucide-react"
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs"

function AuthControls() {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded) return <div className="h-8 w-8" />
  if (isSignedIn) {
    return (
      <UserButton
        appearance={{
          elements: { avatarBox: "h-8 w-8" },
        }}
      />
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

export function TopBar({
  phase,
  onReset,
  onPhaseClick,
}: {
  phase: "home" | "chat" | "compliance"
  onReset: () => void
  onPhaseClick: (phase: "home" | "chat" | "compliance") => void
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur shadow-sm">
      <div className="flex h-14 w-full items-center justify-between px-4 sm:px-8 lg:px-12">
        <button
          onClick={() => onPhaseClick("home")}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Scale className="h-4.5 w-4.5" strokeWidth={2} />
          </div>
          <div className="leading-tight text-left">
            <p className="text-sm font-semibold tracking-tight">Vispo</p>
            <p className="text-[11px] text-muted-foreground">Incorporation Studio</p>
          </div>
        </button>

        <div className="hidden items-center gap-2 sm:flex">
          <PhasePill active={phase === "home"} label="Home" onClick={() => onPhaseClick("home")} />
          <div className="h-px w-6 bg-border" />
          <PhasePill active={phase === "chat"} label="Incorporation" onClick={() => onPhaseClick("chat")} />
          <div className="h-px w-6 bg-border" />
          <PhasePill active={phase === "compliance"} label="Compliance" onClick={() => onPhaseClick("compliance")} />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restart
          </button>

          <AuthControls />
        </div>
      </div>
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
