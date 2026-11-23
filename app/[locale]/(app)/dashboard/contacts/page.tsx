import type { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"
import { getTranslations } from "next-intl/server"
import { SearchIcon, UsersIcon } from "lucide-react"

import { DashboardHeader } from "@/components/layout/dashboard-header"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { AddContactButton } from "@/features/contacts/components/add-contact-button"
import { ContactsList } from "@/features/contacts/components/contacts-list"
import { CONTACTS_PAGE_SIZE } from "@/features/contacts/constants"
import { getContacts } from "@/features/contacts/repository"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Nav")
  return { title: t("contacts") }
}

type SearchParams = { [key: string]: string | string[] | undefined }

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { orgId } = await auth.protect()
  const [tNav, tCommon, t] = await Promise.all([
    getTranslations("Nav"),
    getTranslations("Common"),
    getTranslations("Contacts"),
  ])

  if (!orgId) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <DashboardHeader title={tNav("contacts")} />
        <div className="flex flex-1 flex-col items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{tCommon("noOrganization")}</EmptyTitle>
              <EmptyDescription>{t("noOrganization")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </div>
    )
  }

  const params = await searchParams
  const query = (first(params.q) ?? "").slice(0, 100)
  const page = Math.max(1, Number.parseInt(first(params.page) ?? "1", 10) || 1)
  const { contacts, total } = await getContacts(orgId, { query, page })
  const pages = Math.max(1, Math.ceil(total / CONTACTS_PAGE_SIZE))
  const hrefFor = (target: number) => {
    const next = new URLSearchParams()
    if (query) next.set("q", query)
    if (target > 1) next.set("page", String(target))
    const search = next.toString()
    return search ? `?${search}` : "?"
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <DashboardHeader
        title={tNav("contacts")}
        description={t("description")}
        action={<AddContactButton />}
      />

      {/* A plain GET form: the search lives in the URL, like the calls filters */}
      <form role="search" className="w-full sm:max-w-sm">
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            name="q"
            defaultValue={query}
            placeholder={t("search")}
            aria-label={t("search")}
          />
        </InputGroup>
      </form>

      {contacts.length > 0 ? (
        <ContactsList contacts={contacts} />
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>
              {query ? t("noMatch.title") : t("empty.title")}
            </EmptyTitle>
            <EmptyDescription>
              {query ? t("noMatch.description") : t("empty.description")}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {pages > 1 && (
        <Pagination>
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  href={hrefFor(page - 1)}
                  text={t("pagination.previous")}
                />
              </PaginationItem>
            )}
            <PaginationItem className="px-3 text-sm text-muted-foreground">
              {t("pagination.page", { page, pages })}
            </PaginationItem>
            {page < pages && (
              <PaginationItem>
                <PaginationNext
                  href={hrefFor(page + 1)}
                  text={t("pagination.next")}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
