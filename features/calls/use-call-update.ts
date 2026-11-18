"use client"

import { useOptimistic, useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"

import { toast } from "@/components/ui/toast"
import { updateCallAction } from "@/features/calls/actions"
import type {
  CallListItem,
  CallStatus,
  CallUpdate,
} from "@/features/calls/types"

// Shared by the list row and the detail panel so both save the same way
export function useCallUpdate(call: CallListItem, currentUserId: string) {
  const t = useTranslations("Calls")
  const locale = useLocale()
  const [pending, startTransition] = useTransition()
  // Shows the change right away; the refresh after saving replaces it, and it
  // reverts on its own if the save fails
  const [optimistic, applyOptimistic] = useOptimistic(
    {
      status: call.status,
      assigneeUserId: call.assigneeUserId,
      categoryId: call.categoryId,
    },
    (current, update: CallUpdate) => ({ ...current, ...update })
  )

  const save = (update: CallUpdate) => {
    startTransition(async () => {
      applyOptimistic(update)
      const result = await updateCallAction(call.id, update, locale)
      if (!result.ok) {
        toast.add({
          type: "error",
          title: t("updateFailed"),
          description: result.message,
        })
      }
    })
  }

  // Starting work on an unassigned call takes it, so the team sees who's on it
  const changeStatus = (status: CallStatus) =>
    save(
      status === "in_progress" && !optimistic.assigneeUserId
        ? { status, assigneeUserId: currentUserId }
        : { status }
    )

  return { optimistic, pending, save, changeStatus }
}
