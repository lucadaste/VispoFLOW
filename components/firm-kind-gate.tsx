"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Loader2 } from "lucide-react"
import { useAccountKind } from "@/lib/use-account-kind"
import { AccountKindChooser } from "@/components/account-kind-chooser"

/**
 * Guards /firm: the mirror of account-kind-gate.tsx. A "founder" account is redirected to /app
 * and never shown any of the firm setup/dashboard UI — a founder can't create or fall into a firm
 * workspace through the product at all. A brand-new user who lands here first (e.g. a bookmark)
 * sees the same one-time chooser; picking "founder" sends them to /app instead of rendering.
 */
export function FirmKindGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const { kind, loading, choose } = useAccountKind()

  useEffect(() => {
    if (kind === "founder") router.replace("/app")
  }, [kind, router])

  if (!isLoaded || !isSignedIn) return <>{children}</>
  if (loading || kind === "founder") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (kind === null) {
    return (
      <AccountKindChooser
        onChoose={(k) => {
          choose(k)
          if (k === "founder") router.replace("/app")
        }}
      />
    )
  }
  return <>{children}</>
}
