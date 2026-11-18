"use client"

import { MotionConfig } from "motion/react"

// Turns off movement for visitors who ask their device for less motion
function LandingMotion({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}

export { LandingMotion }
