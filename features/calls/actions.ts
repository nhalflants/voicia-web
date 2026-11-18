"use server"

import { refresh } from "next/cache"
import { getTranslations } from "next-intl/server"

import { updateCall } from "@/features/calls/repository"
import type { CallUpdate } from "@/features/calls/types"
import { actionLocale } from "@/i18n/action-locale"
import { ApiError } from "@/lib/api"

export type ActionResult = { ok: true } | { ok: false; message: string }

// Any member can triage calls, so there's no admin check here. The API scopes
// the call to the caller's organization
export async function updateCallAction(
  id: string,
  update: CallUpdate,
  locale: string
): Promise<ActionResult> {
  try {
    await updateCall(id, update)
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
    console.error("Call update failed", error)
    return { ok: false, message: t("Common.somethingWentWrong") }
  }
  switch (error.status) {
    case 400:
      // The chosen assignee left the organization, or the category was
      // deleted, since the page loaded. The API's message isn't translated
      refresh()
      return { ok: false, message: error.message }
    case 401:
    case 403:
      return { ok: false, message: t("Calls.errors.forbidden") }
    case 404:
      refresh()
      return { ok: false, message: t("Calls.errors.notFound") }
    default:
      console.error("Call update failed", error)
      return { ok: false, message: t("Common.somethingWentWrong") }
  }
}
