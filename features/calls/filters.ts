import { STATUS_FILTERS } from "@/features/calls/constants"
import type { CallFilters, StatusFilter } from "@/features/calls/types"

type SearchParams = { [key: string]: string | string[] | undefined }

// category_id is a uuid column: anything else would make Postgres throw
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Filters live in the URL so a view can be bookmarked and shared. Unknown
// values fall back to the default view instead of erroring
export function parseCallFilters(searchParams: SearchParams): CallFilters {
  const status = first(searchParams.status)
  const assignee = first(searchParams.assignee)
  const categoryId = first(searchParams.category)

  return {
    status: STATUS_FILTERS.some((f) => f.value === status)
      ? (status as StatusFilter)
      : "open",
    assignee: assignee || null,
    categoryId: categoryId && UUID.test(categoryId) ? categoryId : null,
  }
}

// The call open in the detail panel, if any
export function parseCallId(searchParams: SearchParams): string | null {
  const callId = first(searchParams.call)
  return callId && UUID.test(callId) ? callId : null
}

export function isUuid(value: string) {
  return UUID.test(value)
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
