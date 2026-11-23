import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { getTranslations } from "next-intl/server"
import { ChevronLeftIcon, PhoneIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { getCallCategories } from "@/features/call-categories/repository"
import { CallsList } from "@/features/calls/components/calls-list"
import { parseCallId } from "@/features/calls/filters"
import { getCall } from "@/features/calls/repository"
import { ContactHeader } from "@/features/contacts/components/contact-header"
import { ContactPhoneNumbers } from "@/features/contacts/components/contact-phone-numbers"
import {
  CONTACT_CALLS_MAX,
  CONTACT_CALLS_STEP,
} from "@/features/contacts/constants"
import { displayName } from "@/features/contacts/display-name"
import { formatPhoneNumber } from "@/features/contacts/format"
import { getContact, getContactCalls } from "@/features/contacts/repository"
import { getOrganizationMembers } from "@/features/org/repository"
import { Link } from "@/i18n/navigation"

type Params = Promise<{ id: string }>
type SearchParams = { [key: string]: string | string[] | undefined }

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
  const contact = orgId ? await getContact(orgId, id) : null
  const name =
    contact &&
    (displayName(contact) ??
      (contact.phoneNumbers[0] &&
        formatPhoneNumber(contact.phoneNumbers[0].number)))
  return { title: name || t("contacts") }
}

// How many calls to show: ?calls= grows by CONTACT_CALLS_STEP with "Show older"
function parseCallLimit(value: string | string[] | undefined) {
  const raw = Number.parseInt(
    Array.isArray(value) ? value[0] : (value ?? ""),
    10
  )
  if (!Number.isFinite(raw)) return CONTACT_CALLS_STEP
  return Math.min(Math.max(raw, CONTACT_CALLS_STEP), CONTACT_CALLS_MAX)
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: Promise<SearchParams>
}) {
  const { orgId, userId } = await auth.protect()
  // Without an organization there is no contact to show
  if (!orgId) notFound()

  const [{ id }, query, t] = await Promise.all([
    params,
    searchParams,
    getTranslations("Contacts"),
  ])
  const contact = await getContact(orgId, id)
  if (!contact) notFound()

  const limit = parseCallLimit(query.calls)
  const selectedCallId = parseCallId(query)
  const [{ calls, total }, categories, members, selectedCall] =
    await Promise.all([
      getContactCalls(orgId, contact.id, limit),
      getCallCategories(orgId),
      getOrganizationMembers(orgId),
      selectedCallId ? getCall(orgId, selectedCallId) : null,
    ])

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          nativeButton={false}
          render={<Link href="/dashboard/contacts" />}
        >
          <ChevronLeftIcon />
          {t("detail.back")}
        </Button>
      </div>

      <ContactHeader contact={contact} />
      <ContactPhoneNumbers contact={contact} />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">{t("detail.calls")}</h2>
        <CallsList
          calls={calls}
          categories={categories}
          members={members}
          currentUserId={userId}
          selectedCallId={selectedCallId}
          selectedCall={selectedCall}
          empty={
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <PhoneIcon />
                </EmptyMedia>
                <EmptyTitle>{t("detail.noCalls.title")}</EmptyTitle>
                <EmptyDescription>
                  {t("detail.noCalls.description")}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          }
        />
        {total > calls.length && limit < CONTACT_CALLS_MAX && (
          <Button
            variant="outline"
            size="sm"
            className="w-fit self-center"
            nativeButton={false}
            render={
              <Link
                href={`/dashboard/contacts/${contact.id}?calls=${limit + CONTACT_CALLS_STEP}`}
                scroll={false}
              />
            }
          >
            {t("detail.showOlder")}
          </Button>
        )}
      </section>
    </div>
  )
}
