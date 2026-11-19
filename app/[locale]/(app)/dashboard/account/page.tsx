import type { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"
import { getTranslations } from "next-intl/server"

import { DashboardHeader } from "@/components/layout/dashboard-header"
import { AccountSettings } from "@/features/account/components/account-settings"
import { getContactEmail } from "@/features/account/repository"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Nav")
  return { title: t("account") }
}

// The user's own settings, so it works without an active organization
export default async function AccountPage() {
  const { userId } = await auth.protect()
  const [tNav, contactEmail] = await Promise.all([
    getTranslations("Nav"),
    getContactEmail(userId),
  ])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <DashboardHeader title={tNav("account")} />
      <AccountSettings contactEmail={contactEmail} />
    </div>
  )
}
