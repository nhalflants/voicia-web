import type { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"

import { DashboardHeader } from "@/components/layout/dashboard-header"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { PlansSettings } from "@/features/billing/components/plans-settings"
import {
  getOrganizationBilling,
  isSubscribed,
} from "@/features/billing/repository"

export const metadata: Metadata = {
  title: "Plans",
}

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { orgId, has } = await auth.protect()

  if (!orgId) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <DashboardHeader title="Plans" />
        <div className="flex flex-1 flex-col items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No organization selected</EmptyTitle>
              <EmptyDescription>
                Pick an organization in the sidebar to see its plans.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </div>
    )
  }

  const [billing, { checkout }] = await Promise.all([
    getOrganizationBilling(orgId),
    searchParams,
  ])
  // Stripe sends the user back before its webhook may have written the row
  const subscription = isSubscribed(billing)
    ? "active"
    : checkout === "success"
      ? "activating"
      : "none"

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <DashboardHeader title="Plans" />

      <PlansSettings
        subscription={subscription}
        cancelAt={
          subscription === "active" ? (billing?.cancelAt ?? null) : null
        }
        canManage={has({ role: "org:admin" })}
      />
    </div>
  )
}
