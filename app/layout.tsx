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

export const metadata: Metadata = {
  title: "Silicon Valley AI Camp — Silicon Valley Experience",
  description:
    "A 3, 4, or 5-day immersive program where managers and innovators partner with Silicon Valley AI companies and entrepreneurs to transform their business, solve challenges, and grow revenue.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`bg-background ${geistSans.variable} ${geistMono.variable} ${fraunces.variable}`}
      >
        <body className="font-sans antialiased">{children}</body>
      </html>
    </ClerkProvider>
  )
}
