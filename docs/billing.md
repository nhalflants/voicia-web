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
| Voicia 500 | €120/month | 0–500 at €0, then €0.15                            |

Prices exclude VAT. Each plan has two prices: a usage-only price would bill the flat fee at the end of the month instead of up front.

## Frontend

The Next.js app handles checkout and the customer portal, on the server, because both need the Stripe secret key. Restrict both to organization admins.

**Checkout:** create a Checkout session in `subscription` mode with both of the plan's prices. Pass:

- `client_reference_id`: the Clerk organization ID. This is how the webhook links the subscription.
- `customer`: the existing `stripe_customer_id`, if the organization has a row.
- `automatic_tax`, `tax_id_collection`, `billing_mode: { type: 'flexible' }`, `allow_promotion_codes`, `customer_update`.

Refuse checkout if the organization's `status` is `active`, `trialing` or `past_due`. All plans share one meter, so two live subscriptions would bill the same minutes twice.

**Portal:** create a portal session with the row's `stripe_customer_id`.

**Billing page:** read `organization_billing`, and sum `ceil(duration_seconds / 60)` from `calls` for the current period. The plan name comes from the Stripe subscription.

## Changing plan

Stripe's customer portal can't update subscriptions with usage-based prices, only cancel them. Change the plan in the Stripe Dashboard, effective at renewal, replacing both the base and usage prices. The webhook picks up the change.

Never add a second subscription for a customer who already has one, for the same reason as above.
