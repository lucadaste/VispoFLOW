"use client"

import { useState } from "react"
import { Scale, RotateCcw, Menu, X } from "lucide-react"
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

const PHASES = [
  { key: "home", label: "Home" },
  { key: "chat", label: "Incorporation" },
  { key: "compliance", label: "Compliance" },
  { key: "transactions", label: "Transactions" },
  { key: "documents", label: "My Docs" },
] as const

export function TopBar({
  phase,
  onReset,
  onPhaseClick,
}: {
  phase: "home" | "chat" | "compliance" | "transactions" | "documents"
  onReset: () => void
  onPhaseClick: (phase: "home" | "chat" | "compliance" | "transactions" | "documents") => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur shadow-sm">
      <div className="flex h-14 w-full items-center justify-between px-4 sm:px-8 lg:px-12">
        <button
          onClick={() => onPhaseClick("home")}
          className="flex shrink-0 items-center gap-2.5 whitespace-nowrap transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Scale className="h-4.5 w-4.5" strokeWidth={2} />
          </div>
          <div className="leading-tight text-left">
            <p className="text-sm font-semibold tracking-tight">Vispo Labs</p>
            <p className="text-[11px] text-muted-foreground">Startup Legal Studio</p>
          </div>
        </button>

        <div className="hidden items-center gap-2 lg:flex">
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

        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex items-center justify-center rounded-md border border-border bg-secondary p-2 text-foreground transition-colors hover:bg-secondary/80 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="h-4 w-4" strokeWidth={2.5} /> : <Menu className="h-4 w-4" strokeWidth={2.5} />}
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Restart</span>
          </button>

          <AuthControls />
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
