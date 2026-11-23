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
import { deleteContactAction } from "@/features/contacts/actions"
import { useRouter } from "@/i18n/navigation"

function DeleteContactDialog({
  contactId,
  open,
  onOpenChange,
}: {
  contactId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations("Contacts.delete")
  const tCommon = useTranslations("Common")
  const locale = useLocale()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteContactAction(contactId, locale)
      if (!result.ok) {
        toast.add({ type: "error", title: result.message })
        return
      }
      toast.add({ type: "success", title: t("deleted") })
      onOpenChange(false)
      router.push("/dashboard/contacts")
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
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

export { DeleteContactDialog }
