import type { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"

import { DashboardHeader } from "@/components/layout/dashboard-header"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { CallCategoriesSettings } from "@/features/call-categories/components/call-categories-settings"
import { getCallCategories } from "@/features/call-categories/repository"
import { getOrganizationMembers } from "@/features/org/repository"

export const metadata: Metadata = {
  title: "Call categories",
}

export default async function CallCategoriesPage() {
  const { orgId, userId, has } = await auth.protect()

  if (!orgId) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <DashboardHeader title="Call categories" />
        <div className="flex flex-1 flex-col items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No organization selected</EmptyTitle>
              <EmptyDescription>
                Pick an organization in the sidebar to manage its call
                categories.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </div>
    )
  }

  const [categories, members] = await Promise.all([
    getCallCategories(orgId),
    getOrganizationMembers(orgId),
  ])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <DashboardHeader title="Call categories" />

      <CallCategoriesSettings
        categories={categories}
        members={members}
        currentUserId={userId}
        canManage={has({ role: "org:admin" })}
      />
    </div>
  )
}
