"use client"

import { useState, useTransition } from "react"
import { cn } from "cn"
import {
  CheckIcon,
  EllipsisIcon,
  PencilIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react"
import { useFormatter, useLocale, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { updateContactAction } from "@/features/contacts/actions"
import { ContactFormSheet } from "@/features/contacts/components/contact-form-sheet"
import { DeleteContactDialog } from "@/features/contacts/components/delete-contact-dialog"
import { displayName } from "@/features/contacts/display-name"
import { formatPhoneNumber } from "@/features/contacts/format"
import type { ContactDetail } from "@/features/contacts/types"

function ContactHeader({ contact }: { contact: ContactDetail }) {
  const t = useTranslations("Contacts")
  const tCommon = useTranslations("Common")
  const format = useFormatter()
  const locale = useLocale()
  const [editing, setEditing] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [confirming, startConfirm] = useTransition()

  const name = displayName(contact)
  const fallback = contact.phoneNumbers[0]
    ? formatPhoneNumber(contact.phoneNumbers[0].number)
    : t("detail.unnamed")
  // « Mr » goes with a person's name, not a company or a number
  const salutation =
    contact.salutation && (contact.firstName || contact.lastName)
      ? t(`salutations.${contact.salutation}`)
      : null
  const openEditor = () => {
    setFormKey((key) => key + 1)
    setEditing(true)
  }

  const confirmName = () => {
    startConfirm(async () => {
      const result = await updateContactAction(
        contact.id,
        { nameConfirmed: true },
        locale
      )
      if (!result.ok) {
        toast.add({ type: "error", title: result.message })
        return
      }
      toast.add({ type: "success", title: t("detail.confirmed") })
    })
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1
            className={cn(
              "font-heading text-xl leading-tight font-semibold break-words sm:text-2xl",
              name && !contact.nameConfirmed && "text-muted-foreground",
              !name && "tabular-nums"
            )}
          >
            {[salutation, name ?? fallback].filter(Boolean).join(" ")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {[
              t("callCount", { count: contact.callCount }),
              contact.lastCallAt &&
                t("detail.lastCall", {
                  date: format.dateTime(new Date(contact.lastCallAt), {
                    dateStyle: "medium",
                  }),
                }),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="outline" onClick={openEditor}>
            <PencilIcon />
            {tCommon("edit")}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("detail.moreActions")}
                />
              }
            >
              <EllipsisIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto">
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleting(true)}
              >
                <Trash2Icon />
                {t("delete.confirm")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {name && !contact.nameConfirmed && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
          <SparklesIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1">{t("detail.suggested")}</span>
          <div className="flex gap-2">
            <Button size="sm" onClick={confirmName} disabled={confirming}>
              {confirming ? <Spinner /> : <CheckIcon />}
              {t("detail.confirm")}
            </Button>
            <Button size="sm" variant="outline" onClick={openEditor}>
              {tCommon("edit")}
            </Button>
          </div>
        </div>
      )}

      {(contact.email || contact.language) && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
          {contact.email && (
            <>
              <dt className="text-muted-foreground">{t("detail.email")}</dt>
              <dd className="min-w-0 truncate">
                <a
                  href={`mailto:${contact.email}`}
                  className="underline-offset-4 hover:underline"
                >
                  {contact.email}
                </a>
              </dd>
            </>
          )}
          {contact.language && (
            <>
              <dt className="text-muted-foreground">{t("detail.language")}</dt>
              <dd>{t(`languages.${contact.language}`)}</dd>
            </>
          )}
        </dl>
      )}

      <ContactFormSheet
        open={editing}
        onOpenChange={setEditing}
        formKey={formKey}
        contact={contact}
      />
      <DeleteContactDialog
        contactId={contact.id}
        open={deleting}
        onOpenChange={setDeleting}
      />
    </section>
  )
}

export { ContactHeader }
