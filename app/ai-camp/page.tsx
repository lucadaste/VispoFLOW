import { SiteHeader } from "@/components/ai-camp/site-header"
import { Hero } from "@/components/ai-camp/hero"
import { StatsBar } from "@/components/ai-camp/stats-bar"
import { LearnSection } from "@/components/ai-camp/learn-section"
import { ProgramSection } from "@/components/ai-camp/program-section"
import { PartnersSection } from "@/components/ai-camp/partners-section"
import { TestimonialsSection } from "@/components/ai-camp/testimonials-section"
import { PricingSection } from "@/components/ai-camp/pricing-section"
import { FaqSection } from "@/components/ai-camp/faq-section"
import { ApplySection } from "@/components/ai-camp/apply-section"
import { SiteFooter } from "@/components/ai-camp/site-footer"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <Hero />
      <StatsBar />
      <LearnSection />
      <ProgramSection />
      <PartnersSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <ApplySection />
      <SiteFooter />
    </main>
  )
}
