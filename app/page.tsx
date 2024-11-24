import HeroSection from "@/components/layout/hero-section"
import FeaturesSection from "@/components/home/features-section"
import AboutSection from "@/components/home/about-section"
import PricingSection from "@/components/home/pricing-section"
import CTASection from "@/components/home/cta-section"

export default function Home() {
  return (
    <main className="flex-1 pt-20">
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <PricingSection />
      <CTASection />
    </main>
  )
}