import { Hero } from "@/features/landing/components/hero"
import { LandingMotion } from "@/features/landing/components/landing-motion"
import { LandingNav } from "@/features/landing/components/landing-nav"

export default function Page() {
  return (
    <LandingMotion>
      <LandingNav />
      <main>
        <Hero />
      </main>
    </LandingMotion>
  )
}
