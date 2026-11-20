import type { Plan } from "@/features/billing/types"

// Display copy only: Stripe holds the real prices and Checkout shows them
// before payment, so keep these in step when a price changes
export const PLANS: Plan[] = [
  {
    id: "voicia-120",
    name: "Voicia 120",
    monthlyPrice: 60,
    includedMinutes: 120,
    extraMinutePrice: 0.25,
  },
  {
    id: "voicia-500",
    name: "Voicia 500",
    monthlyPrice: 150,
    includedMinutes: 500,
    extraMinutePrice: 0.2,
  },
]
