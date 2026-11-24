"use client"

import { cn } from "cn"
import { ChevronRightIcon, PhoneIcon } from "lucide-react"
import { useFormatter, useNow, useTranslations } from "next-intl"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
        const lastCall = contact.lastCallAt
          ? format.relativeTime(new Date(contact.lastCallAt), now)
          : null
        const unconfirmed = name && !contact.nameConfirmed
        return (
          <li key={contact.id}>
            <Link
              href={`/dashboard/contacts/${contact.id}`}
              className="flex items-center gap-2 px-4 py-3 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
            >
              <ContactAvatar contact={contact} />
              <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:gap-4">
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate font-medium",
                    unconfirmed && "text-muted-foreground",
                    !name && "tabular-nums"
                  )}
                  title={unconfirmed ? t("unconfirmed") : undefined}
                >
                  {name ?? number}
                  {unconfirmed && (
                    <>
                      ?<span className="sr-only">, {t("unconfirmed")}</span>
                    </>
                  )}
                </span>
                {name && number && (
                  <span className="truncate text-sm text-muted-foreground tabular-nums sm:w-40 sm:shrink-0">
                    {number}
                  </span>
                )}
              </div>
              {/* One activity column: « 1 appel · il y a 17 heures » on wide
                  screens, just the time on phones; never wraps */}
              <span className="shrink-0 text-right text-sm whitespace-nowrap text-muted-foreground sm:w-56">
                <span className="hidden sm:inline">
                  {t("callCount", { count: contact.callCount })}
                  {lastCall && " · "}
                </span>
                {lastCall}
              </span>
              <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function initialsOf(...parts: (string | null)[]) {
  return parts
    .map((part) => part?.trim().charAt(0))
    .filter(Boolean)
    .join("")
    .toUpperCase()
}

function ContactAvatar({ contact }: { contact: ContactListItem }) {
  const personInitials = initialsOf(contact.firstName, contact.lastName)
  const initials = personInitials || initialsOf(contact.companyName)

  return (
    <Avatar aria-hidden className="rounded-md after:hidden">
      <AvatarFallback className="rounded-md text-xs font-semibold">
        {initials || <PhoneIcon className="size-3.5" />}
      </AvatarFallback>
    </Avatar>
  )
}

export { ContactsList }
