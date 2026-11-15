import type { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"
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

export const metadata: Metadata = {
  title: "Calls",
}

export default async function CallsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { orgId, userId } = await auth.protect()

  if (!orgId) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <DashboardHeader title="Calls" />
        <div className="flex flex-1 flex-col items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No organization selected</EmptyTitle>
              <EmptyDescription>
                Pick an organization in the sidebar to see its calls.
              </EmptyDescription>
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
      <DashboardHeader title="Calls" />

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
                {isDefaultView ? "You're all caught up" : "No matching calls"}
              </EmptyTitle>
              <EmptyDescription>
                {isDefaultView
                  ? "New calls that need follow-up will show up here."
                  : "Try another status or clear the filters."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      />
    </div>
  )
}
