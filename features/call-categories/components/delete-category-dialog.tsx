"use client"

import { useTransition } from "react"

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
  const [pending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!category) return
    startTransition(async () => {
      const result = await deleteCallCategoryAction(category.id)
      if (!result.ok) {
        toast.add({
          type: "error",
          title: "Couldn't delete the category",
          description: result.message,
        })
        return
      }
      toast.add({ type: "success", title: `“${category.name}” deleted` })
      onOpenChange(false)
      onDeleted()
    })
  }

  const callCount = category?.callCount ?? 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{category?.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            {callCount > 0
              ? `${callCount} past ${callCount === 1 ? "call" : "calls"} will become uncategorized and its recap routing will be removed.`
              : "Its recap routing will be removed and new calls won't be sorted into it."}{" "}
            This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending && <Spinner />}
            Delete category
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { DeleteCategoryDialog }
