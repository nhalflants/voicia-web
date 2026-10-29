"use server"

import { refresh } from "next/cache"

import { updateAssistant } from "@/features/assistants/repository"
import type { AssistantUpdate } from "@/features/assistants/types"
import { isOrganizationAdmin } from "@/features/org/auth"
import { ApiError } from "@/lib/api"

export type ActionResult =
  { ok: true } | { ok: false; field?: "name" | "firstMessage"; message: string }

const FORBIDDEN: ActionResult = {
  ok: false,
  message: "Only organization admins can change assistants.",
}

export async function updateAssistantAction(
  id: string,
  update: AssistantUpdate
): Promise<ActionResult> {
  if (!(await isOrganizationAdmin())) return FORBIDDEN
  try {
    await updateAssistant(id, update)
  } catch (error) {
    return toErrorResult(error)
  }
  refresh()
  return { ok: true }
}

function toErrorResult(error: unknown): ActionResult {
  if (!(error instanceof ApiError)) {
    console.error("Assistant update failed", error)
    return { ok: false, message: "Something went wrong. Please try again." }
  }
  switch (error.status) {
    case 400:
      // Nest prefixes each issue with its field, e.g. "firstMessage: Too big…"
      if (error.message.startsWith("firstMessage")) {
        return { ok: false, field: "firstMessage", message: error.message }
      }
      if (error.message.startsWith("name")) {
        return { ok: false, field: "name", message: error.message }
      }
      return { ok: false, message: error.message }
    case 401:
    case 403:
      return FORBIDDEN
    case 404:
      refresh()
      return { ok: false, message: "This assistant no longer exists." }
    case 502:
      // Vapi rejected the first message or was unreachable; the API saved nothing
      return {
        ok: false,
        message:
          "We couldn't update your phone line. Nothing was saved, please try again.",
      }
    default:
      console.error("Assistant update failed", error)
      return { ok: false, message: "Something went wrong. Please try again." }
  }
}
