import { Audiences } from "@/features/landing/components/audiences"
import { DemoLine } from "@/features/landing/components/demo-line"
import { Faq } from "@/features/landing/components/faq"
import { FinalCta } from "@/features/landing/components/final-cta"
import { Hero } from "@/features/landing/components/hero"
import { Integrations } from "@/features/landing/components/integrations"
import { LandingFooter } from "@/features/landing/components/landing-footer"
import { LandingMotion } from "@/features/landing/components/landing-motion"
import { LandingNav } from "@/features/landing/components/landing-nav"
import { Numbers } from "@/features/landing/components/numbers"
import { Pricing } from "@/features/landing/components/pricing"
import { Problem } from "@/features/landing/components/problem"
import { Product } from "@/features/landing/components/product"

export default function Page() {
  return (
    <LandingMotion>
      <LandingNav />
      <main>
        <Hero />
        <Problem />
        <Product />
        <Numbers />
        <Audiences />
        <DemoLine />
        <Integrations />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
    </LandingMotion>
  )
}
