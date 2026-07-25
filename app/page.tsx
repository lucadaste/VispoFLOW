import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/marketing/site-header"
import { Hero } from "@/components/marketing/hero"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { ProductPillars } from "@/components/marketing/product-pillars"
import { TrustSection } from "@/components/marketing/trust-section"
import { FaqSection } from "@/components/marketing/faq-section"
import { FinalCta } from "@/components/marketing/final-cta"
import { SiteFooter } from "@/components/marketing/site-footer"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { userId } = await auth()
  const params = await searchParams
  if (userId && params.site === undefined) redirect("/app")

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <Hero />
      <HowItWorks />
      <ProductPillars />
      <TrustSection />
      <FaqSection />
      <FinalCta />
      <SiteFooter />
    </main>
  )
}
