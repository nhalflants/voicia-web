"use server"

import { refresh } from "next/cache"
import { getTranslations } from "next-intl/server"

import {
  createCallCategory,
  deleteCallCategory,
  updateCallCategory,
} from "@/features/call-categories/repository"
import type { CallCategoryInput } from "@/features/call-categories/types"
import { isOrganizationAdmin } from "@/features/org/auth"
import { actionLocale } from "@/i18n/action-locale"
import { ApiError } from "@/lib/api"

export type ActionResult =
  { ok: true } | { ok: false; field?: "name"; message: string }

// The API's message for a duplicate name, matched to flag the name field
const NAME_TAKEN = "A category with this name already exists"

async function getT(locale: string) {
  return getTranslations({ locale: actionLocale(locale) })
}

export async function saveCallCategoryAction(
  id: string | null,
  input: CallCategoryInput,
  locale: string
): Promise<ActionResult> {
  if (!(await isOrganizationAdmin())) return forbidden(locale)
  try {
    if (id) await updateCallCategory(id, input)
    else await createCallCategory(input)
  } catch (error) {
    return toErrorResult(error, locale)
  }
  refresh()
  return { ok: true }
}

export async function deleteCallCategoryAction(
  id: string,
  locale: string
): Promise<ActionResult> {
  if (!(await isOrganizationAdmin())) return forbidden(locale)
  try {
    await deleteCallCategory(id)
  } catch (error) {
    // Someone else deleted it first, which is what was asked for
    if (!(error instanceof ApiError && error.status === 404)) {
      return toErrorResult(error, locale)
    }
  }
  refresh()
  return { ok: true }
}

async function forbidden(locale: string): Promise<ActionResult> {
  const t = await getT(locale)
  return { ok: false, message: t("CallCategories.errors.forbidden") }
}

async function toErrorResult(
  error: unknown,
  locale: string
): Promise<ActionResult> {
  const t = await getT(locale)
  if (!(error instanceof ApiError)) {
    console.error("Call category request failed", error)
    return { ok: false, message: t("Common.somethingWentWrong") }
  }
  switch (error.status) {
    case 400:
      // A selected member left the organization since the page loaded
      if (error.message.startsWith("Not members of this organization")) {
        refresh()
        return { ok: false, message: t("CallCategories.errors.formerMembers") }
      }
      // The API's message isn't translated
      return { ok: false, message: error.message }
    case 401:
    case 403:
      return { ok: false, message: t("CallCategories.errors.forbidden") }
    case 404:
      refresh()
      return { ok: false, message: t("CallCategories.errors.notFound") }
    case 409:
      return error.message === NAME_TAKEN
        ? {
            ok: false,
            field: "name",
            message: t("CallCategories.errors.nameTaken"),
          }
        : { ok: false, message: error.message }
    default:
      console.error("Call category request failed", error)
      return { ok: false, message: t("Common.somethingWentWrong") }
  }
}
