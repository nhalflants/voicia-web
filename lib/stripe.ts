import "server-only"

import Stripe from "stripe"

let stripe: Stripe | undefined

// Stripe's constructor throws without a key, so it's created on first use,
// like API_URL in lib/api.ts
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set")
  return (stripe ??= new Stripe(key))
}
