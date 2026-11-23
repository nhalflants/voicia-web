"use server"

import { auth } from "@clerk/nextjs/server"
import { refresh } from "next/cache"
import { getTranslations } from "next-intl/server"

import { displayName } from "@/features/contacts/display-name"
import { formatPhoneNumber } from "@/features/contacts/format"
import {
  addContactPhoneNumber,
  createContact,
  deleteContact,
  getContact,
  removeContactPhoneNumber,
  setPrimaryContactPhoneNumber,
  updateContact,
} from "@/features/contacts/repository"
import type { ContactInput, ContactPatch } from "@/features/contacts/types"
import { actionLocale } from "@/i18n/action-locale"
import { ApiError } from "@/lib/api"

export type ActionResult =
  | { ok: true; contactId?: string }
  | {
      ok: false
      field?: "phoneNumbers" | "email"
      message: string
      // The contact that already has the number, to link to it
      conflict?: { contactId: string; name: string }
    }

// Any member manages contacts, so there's no admin check here. The API scopes
// every change to the caller's organization

export async function createContactAction(
  input: ContactInput,
  locale: string
): Promise<ActionResult> {
  try {
    const { id } = await createContact(input)
    refresh()
    return { ok: true, contactId: id }
  } catch (error) {
    return toErrorResult(error, locale)
  }
}

export async function updateContactAction(
  id: string,
  patch: ContactPatch,
  locale: string
): Promise<ActionResult> {
  return run(() => updateContact(id, patch), locale)
}

export async function deleteContactAction(
  id: string,
  locale: string
): Promise<ActionResult> {
  try {
    await deleteContact(id)
  } catch (error) {
    // Someone else deleted it first, which is what was asked for
    if (!(error instanceof ApiError && error.status === 404)) {
      return toErrorResult(error, locale)
    }
  }
  return { ok: true }
}

export async function addPhoneNumberAction(
  id: string,
  number: string,
  locale: string
): Promise<ActionResult> {
  return run(() => addContactPhoneNumber(id, number), locale)
}

export async function removePhoneNumberAction(
  id: string,
  numberId: string,
  locale: string
): Promise<ActionResult> {
  return run(() => removeContactPhoneNumber(id, numberId), locale)
}

export async function setPrimaryPhoneNumberAction(
  id: string,
  numberId: string,
  locale: string
): Promise<ActionResult> {
  return run(() => setPrimaryContactPhoneNumber(id, numberId), locale)
}

async function run(
  write: () => Promise<void>,
  locale: string
): Promise<ActionResult> {
  try {
    await write()
  } catch (error) {
    return toErrorResult(error, locale)
  }
  refresh()
  return { ok: true }
}

// The API's messages aren't translated, so the ones a person can hit are
// matched here
async function toErrorResult(
  error: unknown,
  locale: string
): Promise<ActionResult> {
  const t = await getTranslations({ locale: actionLocale(locale) })
  if (!(error instanceof ApiError)) {
    console.error("Contact change failed", error)
    return { ok: false, message: t("Common.somethingWentWrong") }
  }

  const invalidNumber = /^Invalid phone number: (.*)$/.exec(error.message)
  switch (error.status) {
    case 400:
      if (invalidNumber) {
        return {
          ok: false,
          field: "phoneNumbers",
          message: t("Contacts.errors.invalidNumber", {
            number: invalidNumber[1],
          }),
        }
      }
      if (error.message.includes("email")) {
        return {
          ok: false,
          field: "email",
          message: t("Contacts.errors.invalidEmail"),
        }
      }
      return { ok: false, message: error.message }
    case 401:
    case 403:
      return { ok: false, message: t("Contacts.errors.forbidden") }
    case 404:
      refresh()
      return { ok: false, message: t("Contacts.errors.notFound") }
    case 409:
      return conflictResult(error, locale)
    default:
      console.error("Contact change failed", error)
      return { ok: false, message: t("Common.somethingWentWrong") }
  }
}

async function conflictResult(
  error: ApiError,
  locale: string
): Promise<ActionResult> {
  const t = await getTranslations({ locale: actionLocale(locale) })
  const contactId = (error.body as { contactId?: unknown } | null)?.contactId
  if (typeof contactId === "string") {
    const { orgId } = await auth()
    const owner = orgId ? await getContact(orgId, contactId) : null
    const name = owner
      ? (displayName(owner) ??
        formatPhoneNumber(owner.phoneNumbers[0]?.number ?? ""))
      : t("Contacts.detail.unnamed")
    return {
      ok: false,
      field: "phoneNumbers",
      message: t("Contacts.errors.numberTaken", { name }),
      conflict: { contactId, name },
    }
  }
  if (error.message === "This number is already on this contact") {
    return {
      ok: false,
      field: "phoneNumbers",
      message: t("Contacts.errors.numberOnContact"),
    }
  }
  if (error.message === "A contact needs at least one phone number") {
    return { ok: false, message: t("Contacts.errors.lastNumber") }
  }
  return { ok: false, message: error.message }
}
