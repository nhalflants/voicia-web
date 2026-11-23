"use client"

import { ChevronRightIcon } from "lucide-react"
import { useFormatter, useNow, useTranslations } from "next-intl"

import { displayName } from "@/features/contacts/display-name"
import { formatPhoneNumber } from "@/features/contacts/format"
import type { ContactListItem } from "@/features/contacts/types"
import { Link } from "@/i18n/navigation"

function ContactsList({ contacts }: { contacts: ContactListItem[] }) {
  const t = useTranslations("Contacts")
  const format = useFormatter()
  const now = useNow()

  return (
    <ul className="flex flex-col divide-y rounded-lg border">
      {contacts.map((contact) => {
        const name = displayName(contact)
        const number = contact.primaryNumber
          ? formatPhoneNumber(contact.primaryNumber)
          : null
        return (
          <li key={contact.id}>
            <Link
              href={`/dashboard/contacts/${contact.id}`}
              className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
                <span className="min-w-0 flex-1 truncate font-medium">
                  {name ? (
                    contact.nameConfirmed ? (
                      name
                    ) : (
                      <span
                        className="text-muted-foreground"
                        title={t("unconfirmed")}
                      >
                        {name}?
                        <span className="sr-only">, {t("unconfirmed")}</span>
                      </span>
                    )
                  ) : (
                    number
                  )}
                </span>
                {name && number && (
                  <span className="text-sm text-muted-foreground tabular-nums sm:w-44">
                    {number}
                  </span>
                )}
              </div>
              <span className="hidden w-20 text-right text-sm text-muted-foreground sm:block">
                {t("callCount", { count: contact.callCount })}
              </span>
              <span className="w-28 text-right text-sm text-muted-foreground">
                {contact.lastCallAt
                  ? format.relativeTime(new Date(contact.lastCallAt), now)
                  : null}
              </span>
              <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export { ContactsList }
