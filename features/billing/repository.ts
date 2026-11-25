import "server-only"

import { eq } from "drizzle-orm"
import type { Locale } from "next-intl"

import type { OrganizationBilling, PlanId } from "@/features/billing/types"
import { getPathname } from "@/i18n/navigation"
import { db } from "@/lib/db"
import { organizationBilling } from "@/lib/db/generated/schema"
import { getStripe } from "@/lib/stripe"

// organization_billing is a copy of Stripe's state that only the NestJS
// webhook writes; checkout and the portal go straight to Stripe (see
// docs/billing.md)

// Each plan has a flat base price, a metered minute price and a metered SMS
// price. IDs differ between Stripe test and live mode, so they come from the
// environment
const PRICE_IDS: Record<
  PlanId,
  { base?: string; usage?: string; sms?: string }
> = {
  "voicia-120": {
    base: process.env.STRIPE_VOICIA_120_BASE_PRICE_ID,
    usage: process.env.STRIPE_VOICIA_120_USAGE_PRICE_ID,
    sms: process.env.STRIPE_VOICIA_120_SMS_PRICE_ID,
  },
  "voicia-500": {
    base: process.env.STRIPE_VOICIA_500_BASE_PRICE_ID,
    usage: process.env.STRIPE_VOICIA_500_USAGE_PRICE_ID,
    sms: process.env.STRIPE_VOICIA_500_SMS_PRICE_ID,
  },
}

// Every other status, unpaid and paused included, is a subscription that can
// still bill
const ENDED_STATUSES = ["canceled", "incomplete_expired"]

export async function getOrganizationBilling(
  organizationId: string
): Promise<OrganizationBilling | null> {
  const [row] = await db
    .select({
      stripeCustomerId: organizationBilling.stripeCustomerId,
      status: organizationBilling.status,
      cancelAt: organizationBilling.cancelAt,
    })
    .from(organizationBilling)
    .where(eq(organizationBilling.organizationId, organizationId))
  return row ?? null
}

// Old and new plans alike: they all report to one meter, so a second
// subscription would bill the same minutes twice
export function isSubscribed(billing: OrganizationBilling | null) {
  return billing !== null && !ENDED_STATUSES.includes(billing.status)
}

export async function createCheckoutSession(
  organizationId: string,
  planId: PlanId,
  billing: OrganizationBilling | null,
  locale: Locale
): Promise<string> {
  const { base, usage, sms } = PRICE_IDS[planId]
  if (!base || !usage || !sms)
    throw new Error(`Stripe prices for ${planId} are not set`)
  const plansUrl = getPlansUrl(locale)

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    // How the NestJS webhook links the subscription. Never set
    // metadata.organizationId: the old app's webhook falls back to it
    client_reference_id: organizationId,
    line_items: [
      { price: base, quantity: 1 },
      // Metered prices take no quantity: Stripe bills what the meter reports
      { price: usage },
      { price: sms },
    ],
    automatic_tax: { enabled: true },
    tax_id_collection: { enabled: true },
    allow_promotion_codes: true,
    subscription_data: { billing_mode: { type: "flexible" } },
    // Stripe's minimum is 30 minutes, with a minute spare for clock drift.
    // Shorter than the 24-hour default, so a forgotten tab can't add a second
    // subscription after the organization subscribed elsewhere
    expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
    // Checkout in the user's language, and back to the page in it
    locale,
    success_url: `${plansUrl}?checkout=success`,
    cancel_url: plansUrl,
    // A returning organization keeps its customer. Stripe only accepts
    // customer_update together with customer
    ...(billing && {
      customer: billing.stripeCustomerId,
      customer_update: { name: "auto", address: "auto" },
    }),
  })
  if (!session.url) throw new Error("Checkout Session has no URL")
  return session.url
}

export async function createPortalSession(
  stripeCustomerId: string,
  locale: Locale
): Promise<string> {
  const session = await getStripe().billingPortal.sessions.create({
    customer: stripeCustomerId,
    locale,
    return_url: getPlansUrl(locale),
  })
  return session.url
}

// Stripe sends the user back outside the router, so the URL needs its locale
function getPlansUrl(locale: Locale) {
  const appUrl = process.env.APP_URL
  if (!appUrl) throw new Error("APP_URL is not set")
  return appUrl + getPathname({ href: "/dashboard/plans", locale })
}
