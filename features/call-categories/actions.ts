"use server"

import { refresh } from "next/cache"

import {
  createCallCategory,
  deleteCallCategory,
  updateCallCategory,
} from "@/features/call-categories/repository"
import type { CallCategoryInput } from "@/features/call-categories/types"
import { isOrganizationAdmin } from "@/features/org/auth"
import { ApiError } from "@/lib/api"

export type ActionResult =
  { ok: true } | { ok: false; field?: "name"; message: string }

const NAME_TAKEN = "A category with this name already exists"
const FORBIDDEN: ActionResult = {
  ok: false,
  message: "Only organization admins can change call categories.",
}

export async function saveCallCategoryAction(
  id: string | null,
  input: CallCategoryInput
): Promise<ActionResult> {
  if (!(await isOrganizationAdmin())) return FORBIDDEN
  try {
    if (id) await updateCallCategory(id, input)
    else await createCallCategory(input)
  } catch (error) {
    return toErrorResult(error)
  }
  refresh()
  return { ok: true }
}

export async function deleteCallCategoryAction(
  id: string
): Promise<ActionResult> {
  if (!(await isOrganizationAdmin())) return FORBIDDEN
  try {
    await deleteCallCategory(id)
  } catch (error) {
    // Someone else deleted it first, which is what was asked for
    if (!(error instanceof ApiError && error.status === 404)) {
      return toErrorResult(error)
    }
  }
  refresh()
  return { ok: true }
}

function toErrorResult(error: unknown): ActionResult {
  if (!(error instanceof ApiError)) {
    console.error("Call category request failed", error)
    return { ok: false, message: "Something went wrong. Please try again." }
  }
  switch (error.status) {
    case 400:
      // A selected member left the organization since the page loaded
      if (error.message.startsWith("Not members of this organization")) {
        refresh()
        return {
          ok: false,
          message:
            "Some selected members are no longer in this organization. The list has been updated, please review it and save again.",
        }
      }
      return { ok: false, message: error.message }
    case 401:
    case 403:
      return FORBIDDEN
    case 404:
      refresh()
      return {
        ok: false,
        message: "This category no longer exists. It may have been deleted.",
      }
    case 409:
      return error.message === NAME_TAKEN
        ? { ok: false, field: "name", message: NAME_TAKEN }
        : { ok: false, message: error.message }
    default:
      console.error("Call category request failed", error)
      return { ok: false, message: "Something went wrong. Please try again." }
  }
}
