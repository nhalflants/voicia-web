import type { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { AssistantsSettings } from "@/features/assistants/components/assistants-settings"
import { getAssistants } from "@/features/assistants/repository"

export const metadata: Metadata = {
  title: "Assistants",
}

export default async function AssistantsPage() {
  const { orgId, has } = await auth.protect()

  if (!orgId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No organization selected</EmptyTitle>
            <EmptyDescription>
              Pick an organization in the sidebar to see its assistants.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  const assistants = await getAssistants(orgId)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <AssistantsSettings
        assistants={assistants}
        canManage={has({ role: "org:admin" })}
      />
    </div>
  )
}
