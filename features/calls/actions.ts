"use server"

import { refresh } from "next/cache"

import { updateCall } from "@/features/calls/repository"
import type { CallUpdate } from "@/features/calls/types"
import { ApiError } from "@/lib/api"

export type ActionResult = { ok: true } | { ok: false; message: string }

// Any member can triage calls, so there's no admin check here. The API scopes
// the call to the caller's organization
export async function updateCallAction(
  id: string,
  update: CallUpdate
): Promise<ActionResult> {
  try {
    await updateCall(id, update)
  } catch (error) {
    return toErrorResult(error)
  }
  refresh()
  return { ok: true }
}

function toErrorResult(error: unknown): ActionResult {
  if (!(error instanceof ApiError)) {
    console.error("Call update failed", error)
    return { ok: false, message: "Something went wrong. Please try again." }
  }
  switch (error.status) {
    case 400:
      // The chosen assignee left the organization, or the category was
      // deleted, since the page loaded
      refresh()
      return { ok: false, message: error.message }
    case 401:
    case 403:
      return {
        ok: false,
        message: "You can't change calls in this organization.",
      }
    case 404:
      refresh()
      return {
        ok: false,
        message: "This call no longer exists. It may have been deleted.",
      }
    default:
      console.error("Call update failed", error)
      return { ok: false, message: "Something went wrong. Please try again." }
  }
}
