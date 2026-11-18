"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { PLANS } from "@/features/billing/constants"
import {
  createCheckoutSession,
  createPortalSession,
  getOrganizationBilling,
  isSubscribed,
} from "@/features/billing/repository"
import type { PlanId } from "@/features/billing/types"
import { isOrganizationAdmin } from "@/features/org/auth"
import { actionLocale } from "@/i18n/action-locale"

// Success redirects to Stripe, so only failures come back
export type ActionResult = { ok: false; message: string }

export async function startCheckoutAction(
  planId: PlanId,
  requestedLocale: string
): Promise<ActionResult> {
  const locale = actionLocale(requestedLocale)
  const t = await getTranslations({ locale })
  const forbidden: ActionResult = {
    ok: false,
    message: t("Billing.errors.forbidden"),
  }
  if (!(await isOrganizationAdmin())) return forbidden
  const { orgId } = await auth()
  if (!orgId) return forbidden
  // Server Functions can be called with any argument
  if (!PLANS.some((plan) => plan.id === planId)) {
    return { ok: false, message: t("Billing.errors.unknownPlan") }
  }

  let url: string
  try {
    // Checked here as well as on the page, which may be out of date
    const billing = await getOrganizationBilling(orgId)
    if (isSubscribed(billing)) {
      return { ok: false, message: t("Billing.errors.alreadySubscribed") }
    }
    url = await createCheckoutSession(orgId, planId, billing, locale)
  } catch (error) {
    console.error("Checkout Session creation failed", error)
    return { ok: false, message: t("Common.somethingWentWrong") }
  }
  // redirect throws, so it stays outside the try. Stripe is external, so this
  // is Next's redirect, not the locale-aware one
  redirect(url)
}

export async function openPortalAction(
  requestedLocale: string
): Promise<ActionResult> {
  const locale = actionLocale(requestedLocale)
  const t = await getTranslations({ locale })
  const forbidden: ActionResult = {
    ok: false,
    message: t("Billing.errors.forbidden"),
  }
  if (!(await isOrganizationAdmin())) return forbidden
  const { orgId } = await auth()
  if (!orgId) return forbidden

  let url: string
  try {
    const billing = await getOrganizationBilling(orgId)
    if (!billing) {
      return { ok: false, message: t("Billing.errors.noSubscription") }
    }
    url = await createPortalSession(billing.stripeCustomerId, locale)
  } catch (error) {
    console.error("Portal session creation failed", error)
    return { ok: false, message: t("Common.somethingWentWrong") }
  }
  redirect(url)
}
