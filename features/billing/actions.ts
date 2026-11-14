"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { PLANS } from "@/features/billing/constants"
import {
  createCheckoutSession,
  createPortalSession,
  getOrganizationBilling,
  isSubscribed,
} from "@/features/billing/repository"
import type { PlanId } from "@/features/billing/types"
import { isOrganizationAdmin } from "@/features/org/auth"

// Success redirects to Stripe, so only failures come back
export type ActionResult = { ok: false; message: string }

const FORBIDDEN: ActionResult = {
  ok: false,
  message: "Only organization admins can manage the subscription.",
}
const FAILED: ActionResult = {
  ok: false,
  message: "Something went wrong. Please try again.",
}

export async function startCheckoutAction(
  planId: PlanId
): Promise<ActionResult> {
  if (!(await isOrganizationAdmin())) return FORBIDDEN
  const { orgId } = await auth()
  if (!orgId) return FORBIDDEN
  // Server Functions can be called with any argument
  if (!PLANS.some((plan) => plan.id === planId)) {
    return { ok: false, message: "This plan doesn't exist." }
  }

  let url: string
  try {
    // Checked here as well as on the page, which may be out of date
    const billing = await getOrganizationBilling(orgId)
    if (isSubscribed(billing)) {
      return {
        ok: false,
        message: "This organization already has an active subscription.",
      }
    }
    url = await createCheckoutSession(orgId, planId, billing)
  } catch (error) {
    console.error("Checkout Session creation failed", error)
    return FAILED
  }
  // redirect throws, so it stays outside the try
  redirect(url)
}

export async function openPortalAction(): Promise<ActionResult> {
  if (!(await isOrganizationAdmin())) return FORBIDDEN
  const { orgId } = await auth()
  if (!orgId) return FORBIDDEN

  let url: string
  try {
    const billing = await getOrganizationBilling(orgId)
    if (!billing) {
      return { ok: false, message: "This organization has no subscription." }
    }
    url = await createPortalSession(billing.stripeCustomerId)
  } catch (error) {
    console.error("Portal session creation failed", error)
    return FAILED
  }
  redirect(url)
}
