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
import { AssistantsSettings } from "@/features/assistants/components/assistants-settings"
import { getAssistants } from "@/features/assistants/repository"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Nav")
  return { title: t("assistants") }
}

export default async function AssistantsPage() {
  const { orgId, has } = await auth.protect()
  const [tNav, tCommon, t] = await Promise.all([
    getTranslations("Nav"),
    getTranslations("Common"),
    getTranslations("Assistants"),
  ])

  if (!orgId) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <DashboardHeader title={tNav("assistants")} />
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

  const assistants = await getAssistants(orgId)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <DashboardHeader title={tNav("assistants")} />

      <AssistantsSettings
        assistants={assistants}
        canManage={has({ role: "org:admin" })}
      />
    </div>
  )
}
