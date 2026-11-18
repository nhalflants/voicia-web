import { Hero } from "@/features/landing/components/hero"
import { LandingMotion } from "@/features/landing/components/landing-motion"
import { LandingNav } from "@/features/landing/components/landing-nav"
import { Numbers } from "@/features/landing/components/numbers"
import { Problem } from "@/features/landing/components/problem"

export default function Page() {
  return (
    <LandingMotion>
      <LandingNav />
      <main>
        <Hero />
        <Problem />
        <Numbers />
      </main>
    </LandingMotion>
  )
}
