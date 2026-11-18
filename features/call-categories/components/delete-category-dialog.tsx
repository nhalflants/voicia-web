"use client"

import { useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { deleteCallCategoryAction } from "@/features/call-categories/actions"
import type { CallCategory } from "@/features/call-categories/types"

function DeleteCategoryDialog({
  category,
  open,
  onOpenChange,
  onDeleted,
}: {
  category: CallCategory | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}) {
  const t = useTranslations("CallCategories.delete")
  const tCommon = useTranslations("Common")
  const locale = useLocale()
  const [pending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!category) return
    startTransition(async () => {
      const result = await deleteCallCategoryAction(category.id, locale)
      if (!result.ok) {
        toast.add({
          type: "error",
          title: t("failed"),
          description: result.message,
        })
        return
      }
      toast.add({
        type: "success",
        title: t("deleted", { name: category.name }),
      })
      onOpenChange(false)
      onDeleted()
    })
  }

  const callCount = category?.callCount ?? 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("title", { name: category?.name ?? "" })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {callCount > 0
              ? t("descriptionWithCalls", { count: callCount })
              : t("description")}{" "}
            {t("irreversible")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>
            {tCommon("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending && <Spinner />}
            {t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { DeleteCategoryDialog }
