import type { Plan } from "@/features/billing/types"

// Display copy only: Stripe holds the real prices and Checkout shows them
// before payment, so keep these in step when a price changes
export const PLANS: Plan[] = [
  {
    id: "voicia-150",
    name: "Voicia 150",
    monthlyPrice: 60,
    includedMinutes: 150,
    extraMinutePrice: 0.2,
  },
  {
    id: "voicia-500",
    name: "Voicia 500",
    monthlyPrice: 120,
    includedMinutes: 500,
    extraMinutePrice: 0.16,
  },
]
