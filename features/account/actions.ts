"use server"

import { refresh } from "next/cache"
import { getTranslations } from "next-intl/server"

import { updateContactEmail } from "@/features/account/repository"
import { actionLocale } from "@/i18n/action-locale"
import { ApiError } from "@/lib/api"

export type ActionResult = { ok: true } | { ok: false; message: string }

export async function updateContactEmailAction(
  contactEmail: string | null,
  locale: string
): Promise<ActionResult> {
  const t = await getTranslations({ locale: actionLocale(locale) })
  try {
    await updateContactEmail(contactEmail)
  } catch (error) {
    // The address isn't (or is no longer) a verified address of the account
    if (error instanceof ApiError && error.status === 400) {
      return { ok: false, message: t("Account.reports.errors.unverified") }
    }
    console.error("Contact email update failed", error)
    return { ok: false, message: t("Common.somethingWentWrong") }
  }
  refresh()
  return { ok: true }
}
