"use server"

import { refresh } from "next/cache"
import { getTranslations } from "next-intl/server"

import { updateAssistant } from "@/features/assistants/repository"
import type { AssistantUpdate, SmsLanguage } from "@/features/assistants/types"
import { isOrganizationAdmin } from "@/features/org/auth"
import { actionLocale } from "@/i18n/action-locale"
import { ApiError } from "@/lib/api"

export type AssistantField = "name" | "firstMessage" | `sms.${SmsLanguage}`

export type ActionResult =
  { ok: true } | { ok: false; field?: AssistantField; message: string }

export async function updateAssistantAction(
  id: string,
  update: AssistantUpdate,
  locale: string
): Promise<ActionResult> {
  const t = await getTranslations({ locale: actionLocale(locale) })
  if (!(await isOrganizationAdmin())) {
    return { ok: false, message: t("Assistants.errors.forbidden") }
  }
  try {
    await updateAssistant(id, update)
  } catch (error) {
    return toErrorResult(error, locale)
  }
  refresh()
  return { ok: true }
}

async function toErrorResult(
  error: unknown,
  locale: string
): Promise<ActionResult> {
  const t = await getTranslations({ locale: actionLocale(locale) })
  if (!(error instanceof ApiError)) {
    console.error("Assistant update failed", error)
    return { ok: false, message: t("Common.somethingWentWrong") }
  }
  switch (error.status) {
    case 400:
      // Nest prefixes each issue with its field, e.g. "firstMessage: Too big…".
      // The API's message isn't translated
      if (error.message.startsWith("firstMessage")) {
        return { ok: false, field: "firstMessage", message: error.message }
      }
      if (error.message.startsWith("name")) {
        return { ok: false, field: "name", message: error.message }
      }
      {
        // e.g. "smsTemplates.fr: Too long for one SMS: 75/70 (because of ê)"
        const sms = /^smsTemplates\.(fr|nl|en)\b/.exec(error.message)
        if (sms) {
          const language = sms[1] as SmsLanguage
          return { ok: false, field: `sms.${language}`, message: error.message }
        }
      }
      return { ok: false, message: error.message }
    case 401:
    case 403:
      return { ok: false, message: t("Assistants.errors.forbidden") }
    case 404:
      refresh()
      return { ok: false, message: t("Assistants.errors.notFound") }
    case 502:
      // Vapi rejected the first message or was unreachable; the API saved nothing
      return { ok: false, message: t("Assistants.errors.phoneLine") }
    default:
      console.error("Assistant update failed", error)
      return { ok: false, message: t("Common.somethingWentWrong") }
  }
}
