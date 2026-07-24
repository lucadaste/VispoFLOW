import type { Metadata } from "next"
import { Geist, Geist_Mono, Fraunces } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif-display",
})

const clerkLocalization = {
  userProfile: {
    navbar: { account: "Account" },
    start: { headerTitle__account: "Account" },
  },
}

export const metadata: Metadata = {
  title: "Vispo Labs — Startup Legal Studio",
  description:
    "Vispo Labs guides founders through Delaware C-Corp incorporation, post-formation compliance filings, and startup transaction documents — all through a simple, AI-guided chat.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={clerkLocalization}>
      <html
        lang="en"
        className={`bg-background ${geistSans.variable} ${geistMono.variable} ${fraunces.variable}`}
      >
        <body className="font-sans antialiased">{children}</body>
      </html>
    </ClerkProvider>
  )
}
