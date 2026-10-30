import type { CallStatus, StatusFilter } from "@/features/calls/types"

// Mirrors the call_status enum, in lifecycle order
export const CALL_STATUSES: Record<
  CallStatus,
  { label: string; dotClassName: string }
> = {
  new: { label: "New", dotClassName: "bg-blue-500" },
  in_progress: { label: "In progress", dotClassName: "bg-amber-500" },
  done: { label: "Done", dotClassName: "bg-green-500" },
  dismissed: { label: "Dismissed", dotClassName: "bg-gray-400" },
}

export const STATUS_FILTERS: {
  value: StatusFilter
  label: string
  // null shows every status
  statuses: CallStatus[] | null
}[] = [
  { value: "open", label: "Open", statuses: ["new", "in_progress"] },
  { value: "done", label: "Done", statuses: ["done"] },
  { value: "dismissed", label: "Dismissed", statuses: ["dismissed"] },
  { value: "all", label: "All", statuses: null },
]

// The list isn't paginated yet; the open view stays well under this
export const CALL_LIST_LIMIT = 100
