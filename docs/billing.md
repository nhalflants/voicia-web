# Billing

This backend does one thing for billing: it reports call minutes to Stripe. Stripe holds the plans, prices and allowances, so no code here knows which plan an organization is on.

## How it fits

```
Vapi ──end-of-call-report──▶ POST /vapi/webhook ──meter event──▶ Stripe
Vercel Cron (daily) ───────▶ GET /billing/cron/report-usage ──▶ retries failed reports
Stripe ──subscription events──▶ POST /stripe/webhook ──▶ organization_billing
```

- **One meter for every plan.** Each call is reported to the `call_minute` meter, rounded up to a whole minute. Stripe prices it from the subscription, so old and new plans use the same code.
- **Empty calls are billed.** Every call with a duration counts.
- **`organization_billing` is a copy of Stripe's state.** Only the webhook writes it, apart from the migration import.

## Plans

| Product    | Base price | Usage price on the `call_minute` meter (graduated) |
| ---------- | ---------- | -------------------------------------------------- |
| Voicia 150 | €60/month  | 0–150 at €0, then €0.20                            |
| Voicia 500 | €120/month | 0–500 at €0, then €0.16                            |

Prices exclude VAT. Each plan has two prices: a usage-only price would bill the flat fee at the end of the month instead of up front.

## Frontend

The Next.js app handles checkout and the customer portal, on the server, because both need the Stripe secret key. Restrict both to organization admins.

**Checkout:** create a Checkout session in `subscription` mode with both of the plan's prices. Pass:

- `client_reference_id`: the Clerk organization ID. This is how the webhook links the subscription.
- `customer`: the existing `stripe_customer_id`, if the organization has a row.
- `automatic_tax`, `tax_id_collection`, `allow_promotion_codes`, and `subscription_data.billing_mode: { type: 'flexible' }`.
- `customer_update`, only together with `customer`: Stripe rejects it otherwise.

Never set `metadata.organizationId`: the old app's webhook falls back to it and would take the subscription for one of its own.

Refuse checkout unless the organization has no row, or its `status` is `canceled` or `incomplete_expired`. All plans share one meter, so two live subscriptions would bill the same minutes twice.

```bash
# .env.local of the Next.js app
STRIPE_SECRET_KEY=rk_...                 # restricted key: Checkout Sessions write, Customer portal write
STRIPE_VOICIA_150_BASE_PRICE_ID=price_...
STRIPE_VOICIA_150_USAGE_PRICE_ID=price_...
STRIPE_VOICIA_500_BASE_PRICE_ID=price_...
STRIPE_VOICIA_500_USAGE_PRICE_ID=price_...
APP_URL=https://...                      # where Stripe sends users back
```

The plan cards in `features/billing/constants.ts` repeat the prices for display. Change them with the Stripe prices.

**Portal:** create a portal session with the row's `stripe_customer_id`.

**Billing page:** read `organization_billing`, and sum `ceil(duration_seconds / 60)` from `calls` for the current period. The plan name comes from the Stripe subscription.

## Changing plan

Stripe's customer portal can't update subscriptions with usage-based prices, only cancel them. Change the plan in the Stripe Dashboard, effective at renewal, replacing both the base and usage prices. The webhook picks up the change.

Never add a second subscription for a customer who already has one, for the same reason as above.
