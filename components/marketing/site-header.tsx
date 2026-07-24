"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ArrowRight } from "lucide-react"
import { SignInButton, useAuth } from "@clerk/nextjs"

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Product", href: "#product" },
  { label: "FAQ", href: "#faq" },
]

function AuthCta() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) return <div className="h-9 w-32" />

  if (isSignedIn) {
    return (
      <Link
        href="/app"
        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Go to your workspace
        <ArrowRight className="h-4 w-4" />
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <SignInButton mode="modal">
        <button className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          Sign in
        </button>
      </SignInButton>
      <Link
        href="/app"
        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Get started
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/beaker.png" alt="" className="h-9 w-9 shrink-0 object-contain" />
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight text-foreground">Vispo Labs</span>
            <span className="block text-[11px] text-muted-foreground">Startup Legal Studio</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <AuthCta />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              <AuthCta />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
