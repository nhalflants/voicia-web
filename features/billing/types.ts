export type PlanId = "voicia-150" | "voicia-500"

export interface Plan {
  id: PlanId
  name: string
  // Excluding VAT, as Stripe charges it on top
  monthlyPrice: string
  includedMinutes: number
  extraMinutePrice: string
}

export interface OrganizationBilling {
  stripeCustomerId: string
  // Stripe subscription status, copied by the NestJS webhook
  status: string
  // Set once the subscription is cancelled; it stays active until then
  cancelAt: string | null
}

// "activating": back from Checkout, before the webhook has written the row
export type SubscriptionState = "none" | "activating" | "active"
