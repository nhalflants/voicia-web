import "server-only"

import { and, desc, eq, exists, ilike, or, sql, type SQL } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

import {
  listColumns,
  newestFirst,
  todayCallCount,
  toListItem,
} from "@/features/calls/repository"
import { isUuid } from "@/features/calls/filters"
import type { CallListItem } from "@/features/calls/types"
import { CONTACTS_PAGE_SIZE } from "@/features/contacts/constants"
import type {
  ContactDetail,
  ContactInput,
  ContactListItem,
  ContactPatch,
} from "@/features/contacts/types"
import { api } from "@/lib/api"
import { db } from "@/lib/db"
import { calls, contactPhoneNumbers, contacts } from "@/lib/db/generated/schema"

// Reads go straight to the database; writes go through the NestJS API, which
// owns them (see lib/db/index.ts). A contact's calls are the calls whose
// customer_number is one of its numbers: calls carry no contact id

const primaryNumber = alias(contactPhoneNumbers, "primary_number")

// When a call happened; one that never connected has only its insert time
const callTime = sql`coalesce(${calls.startedAt}, ${calls.createdAt})`

// Call count, first and last call per contact of the organization
function callStats(organizationId: string) {
  return db
    .select({
      contactId: contactPhoneNumbers.contactId,
      callCount: sql<number>`count(*)::int`.as("call_count"),
      firstCallAt: sql<string>`min(${callTime})`.as("first_call_at"),
      lastCallAt: sql<string>`max(${callTime})`.as("last_call_at"),
    })
    .from(contactPhoneNumbers)
    .innerJoin(
      calls,
      and(
        eq(calls.organizationId, contactPhoneNumbers.organizationId),
        eq(calls.customerNumber, contactPhoneNumbers.number)
      )
    )
    .where(eq(contactPhoneNumbers.organizationId, organizationId))
    .groupBy(contactPhoneNumbers.contactId)
    .as("call_stats")
}

// Name or company containing the text, or a number containing its digits.
// Leading zeros are dropped so « 0470 12 » finds +3247012…
function searchCondition(query: string): SQL | undefined {
  const text = query.trim()
  if (!text) return undefined
  const escaped = text.replace(/[\\%_]/g, (c) => `\\${c}`)
  const conditions: (SQL | undefined)[] = [
    ilike(
      sql`concat_ws(' ', ${contacts.firstName}, ${contacts.lastName}, ${contacts.companyName})`,
      `%${escaped}%`
    ),
  ]
  const digits = text.replace(/\D/g, "").replace(/^0+/, "")
  if (digits.length >= 2) {
    conditions.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(contactPhoneNumbers)
          .where(
            and(
              eq(contactPhoneNumbers.contactId, contacts.id),
              sql`${contactPhoneNumbers.number} like ${`%${digits}%`}`
            )
          )
      )
    )
  }
  return or(...conditions)
}

// Most recent call first; contacts without calls (added by hand) after, newest
// first
export async function getContacts(
  organizationId: string,
  { query, page }: { query: string; page: number }
): Promise<{ contacts: ContactListItem[]; total: number }> {
  const stats = callStats(organizationId)
  const where = and(
    eq(contacts.organizationId, organizationId),
    searchCondition(query)
  )
  const [rows, total] = await Promise.all([
    db
      .select({
        id: contacts.id,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        companyName: contacts.companyName,
        nameConfirmed: contacts.nameConfirmed,
        primaryNumber: primaryNumber.number,
        callCount: sql<number>`coalesce(${stats.callCount}, 0)::int`,
        lastCallAt: stats.lastCallAt,
      })
      .from(contacts)
      .leftJoin(
        primaryNumber,
        and(
          eq(primaryNumber.contactId, contacts.id),
          eq(primaryNumber.isPrimary, true)
        )
      )
      .leftJoin(stats, eq(stats.contactId, contacts.id))
      .where(where)
      .orderBy(
        sql`${stats.lastCallAt} desc nulls last`,
        desc(contacts.createdAt)
      )
      .limit(CONTACTS_PAGE_SIZE)
      .offset((Math.max(page, 1) - 1) * CONTACTS_PAGE_SIZE),
    db.$count(contacts, where),
  ])
  return { contacts: rows, total }
}

// Scoped by organization, so a shared link can't open another organization's
// contact; a malformed id is simply not found
export async function getContact(
  organizationId: string,
  id: string
): Promise<ContactDetail | null> {
  if (!isUuid(id)) return null
  const contact = await db.query.contacts.findFirst({
    where: and(
      eq(contacts.id, id),
      eq(contacts.organizationId, organizationId)
    ),
    with: { contactPhoneNumbers: true },
  })
  if (!contact) return null

  const stats = callStats(organizationId)
  const [row] = await db
    .select({
      callCount: stats.callCount,
      firstCallAt: stats.firstCallAt,
      lastCallAt: stats.lastCallAt,
    })
    .from(stats)
    .where(eq(stats.contactId, id))

  const phoneNumbers = [...contact.contactPhoneNumbers]
    .sort(
      (a, b) =>
        Number(b.isPrimary) - Number(a.isPrimary) ||
        a.createdAt.localeCompare(b.createdAt)
    )
    .map(({ id, number, isPrimary }) => ({ id, number, isPrimary }))

  return {
    id: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    companyName: contact.companyName,
    nameConfirmed: contact.nameConfirmed,
    salutation: contact.salutation,
    email: contact.email,
    language: contact.language,
    source: contact.source,
    phoneNumbers,
    callCount: row?.callCount ?? 0,
    firstCallAt: row?.firstCallAt ?? null,
    lastCallAt: row?.lastCallAt ?? null,
  }
}

// The contact's most recent calls, from any of its numbers, and how many in all
export async function getContactCalls(
  organizationId: string,
  contactId: string,
  limit: number
): Promise<{ calls: CallListItem[]; total: number }> {
  const where = and(
    eq(calls.organizationId, organizationId),
    exists(
      db
        .select({ one: sql`1` })
        .from(contactPhoneNumbers)
        .where(
          and(
            eq(contactPhoneNumbers.contactId, contactId),
            eq(contactPhoneNumbers.organizationId, organizationId),
            eq(contactPhoneNumbers.number, calls.customerNumber)
          )
        )
    )
  )
  const [rows, total] = await Promise.all([
    db.query.calls.findMany({
      where,
      columns: listColumns,
      extras: { todayCallCount },
      with: { callCategory: { columns: { name: true, color: true } } },
      orderBy: newestFirst,
      limit,
    }),
    db.$count(calls, where),
  ])
  return { calls: rows.map(toListItem), total }
}

// The organization comes from the session token, never from the body

export async function createContact(
  input: ContactInput
): Promise<{ id: string }> {
  return api<{ id: string }>("/contacts", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateContact(
  id: string,
  patch: ContactPatch
): Promise<void> {
  await api(`/contacts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  })
}

export async function deleteContact(id: string): Promise<void> {
  await api(`/contacts/${encodeURIComponent(id)}`, { method: "DELETE" })
}

export async function addContactPhoneNumber(
  id: string,
  number: string
): Promise<void> {
  await api(`/contacts/${encodeURIComponent(id)}/phone-numbers`, {
    method: "POST",
    body: JSON.stringify({ number }),
  })
}

export async function removeContactPhoneNumber(
  id: string,
  numberId: string
): Promise<void> {
  await api(
    `/contacts/${encodeURIComponent(id)}/phone-numbers/${encodeURIComponent(numberId)}`,
    { method: "DELETE" }
  )
}

export async function setPrimaryContactPhoneNumber(
  id: string,
  numberId: string
): Promise<void> {
  await api(
    `/contacts/${encodeURIComponent(id)}/phone-numbers/${encodeURIComponent(numberId)}/primary`,
    { method: "POST" }
  )
}
