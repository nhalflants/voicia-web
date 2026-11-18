import type { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"
import { getTranslations } from "next-intl/server"

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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Nav")
  return { title: t("plans") }
}

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { orgId, has } = await auth.protect()
  const [tNav, tCommon, t] = await Promise.all([
    getTranslations("Nav"),
    getTranslations("Common"),
    getTranslations("Billing"),
  ])

  if (!orgId) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <DashboardHeader title={tNav("plans")} />
        <div className="flex flex-1 flex-col items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{tCommon("noOrganization")}</EmptyTitle>
              <EmptyDescription>{t("noOrganization")}</EmptyDescription>
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
      <DashboardHeader title={tNav("plans")} />

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
