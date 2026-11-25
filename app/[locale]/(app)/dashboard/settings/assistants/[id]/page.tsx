import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { ChevronLeftIcon, LockIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { AssistantForm } from "@/features/assistants/components/assistant-form"
import { getAssistant } from "@/features/assistants/repository"
import { Link } from "@/i18n/navigation"

type Params = Promise<{ id: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const [{ id }, { orgId }, t] = await Promise.all([
    params,
    auth(),
    getTranslations("Nav"),
  ])
  const assistant = orgId ? await getAssistant(orgId, id) : null
  return { title: assistant?.name ?? t("assistants") }
}

export default async function AssistantPage({ params }: { params: Params }) {
  const { orgId, has } = await auth.protect()
  // Without an organization there is no assistant to show
  if (!orgId) notFound()

  const [{ id }, t] = await Promise.all([params, getTranslations("Assistants")])
  const assistant = await getAssistant(orgId, id)
  if (!assistant) notFound()

  const canManage = has({ role: "org:admin" })

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          nativeButton={false}
          render={<Link href="/dashboard/settings/assistants" />}
        >
          <ChevronLeftIcon />
          {t("page.back")}
        </Button>
      </div>

      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold">{assistant.name}</h1>
        <p className="text-sm text-muted-foreground">{t("page.description")}</p>
      </header>

      {!canManage && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <LockIcon className="size-4 shrink-0" />
          {t("adminsOnly")}
        </p>
      )}

      <AssistantForm
        // Starts again from the saved values whenever they change, e.g. after
        // a save, so the form shows what the API stored
        key={JSON.stringify([
          assistant.name,
          assistant.firstMessage,
          assistant.smsTemplates,
        ])}
        assistant={assistant}
        canManage={canManage}
      />
    </div>
  )
}
