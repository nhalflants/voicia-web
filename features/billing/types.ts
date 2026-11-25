export type PlanId = "voicia-120" | "voicia-500"

export interface Plan {
  id: PlanId
  name: string
  // In euros, excluding VAT, as Stripe charges it on top
  monthlyPrice: number
  includedMinutes: number
  extraMinutePrice: number
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
