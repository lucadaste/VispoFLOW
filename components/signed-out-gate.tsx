"use client"

import { SignInButton, useAuth } from "@clerk/nextjs"

/**
 * Wraps a flow (Incorporation / Compliance / Transactions) so it's fully visible but not
 * usable while signed out — any click anywhere in it opens sign-in instead of the underlying
 * action. Browsing (Landing, My Docs) is intentionally left ungated.
 */
export function SignedOutGate({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded || isSignedIn) return <>{children}</>

  return (
    <div className="relative flex min-h-0 flex-1">
      {children}
      <SignInButton mode="modal">
        <div
          role="button"
          tabIndex={0}
          aria-label="Sign in to get started"
          className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center"
        >
          <span className="pointer-events-none rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg">
            Sign in to get started — it's free
          </span>
        </div>
      </SignInButton>
    </div>
  )
}
