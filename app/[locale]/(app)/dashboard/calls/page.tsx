import type { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"
import { getTranslations } from "next-intl/server"
import { PhoneIcon } from "lucide-react"

import { DashboardHeader } from "@/components/layout/dashboard-header"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { getCallCategories } from "@/features/call-categories/repository"
import { CallsList } from "@/features/calls/components/calls-list"
import { CallsToolbar } from "@/features/calls/components/calls-toolbar"
import { parseCallFilters, parseCallId } from "@/features/calls/filters"
import { getCall, getCalls } from "@/features/calls/repository"
import { getOrganizationMembers } from "@/features/org/repository"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Nav")
  return { title: t("calls") }
}

export default async function CallsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { orgId, userId } = await auth.protect()
  const [tNav, tCommon, t] = await Promise.all([
    getTranslations("Nav"),
    getTranslations("Common"),
    getTranslations("Calls"),
  ])

  if (!orgId) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <DashboardHeader title={tNav("calls")} />
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

  const params = await searchParams
  const filters = parseCallFilters(params)
  const selectedCallId = parseCallId(params)
  const [calls, categories, members, selectedCall] = await Promise.all([
    getCalls(orgId, filters, userId),
    getCallCategories(orgId),
    getOrganizationMembers(orgId),
    selectedCallId ? getCall(orgId, selectedCallId) : null,
  ])
  const isDefaultView =
    filters.status === "open" && !filters.assignee && !filters.categoryId

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <DashboardHeader title={tNav("calls")} />

      <CallsToolbar
        filters={filters}
        categories={categories}
        members={members}
        currentUserId={userId}
      />

      <CallsList
        calls={calls}
        categories={categories}
        members={members}
        currentUserId={userId}
        selectedCallId={selectedCallId}
        selectedCall={selectedCall}
        empty={
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PhoneIcon />
              </EmptyMedia>
              <EmptyTitle>
                {isDefaultView ? t("caughtUp.title") : t("noMatch.title")}
              </EmptyTitle>
              <EmptyDescription>
                {isDefaultView
                  ? t("caughtUp.description")
                  : t("noMatch.description")}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      />
    </div>
  )
}
