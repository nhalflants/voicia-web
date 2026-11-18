import type { CallStatus, StatusFilter } from "@/features/calls/types"

// Mirrors the call_status enum, in lifecycle order. Labels are in the
// Calls.statuses messages
export const CALL_STATUSES: Record<CallStatus, { dotClassName: string }> = {
  new: { dotClassName: "bg-blue-500" },
  in_progress: { dotClassName: "bg-amber-500" },
  done: { dotClassName: "bg-green-500" },
}

// Labels are in the Calls.statusFilters messages
export const STATUS_FILTERS: {
  value: StatusFilter
  // null shows every status
  statuses: CallStatus[] | null
}[] = [
  { value: "open", statuses: ["new", "in_progress"] },
  { value: "closed", statuses: ["done"] },
  { value: "all", statuses: null },
]

// The list isn't paginated yet; the open view stays well under this
export const CALL_LIST_LIMIT = 100

// Where "today" starts for the repeat-caller badge. Voicia only serves Belgium
// for now; this moves to the organization when that changes
export const BUSINESS_TIME_ZONE = "Europe/Brussels"

// Other calls from the same number shown in the detail panel
export const CALL_HISTORY_LIMIT = 10

// Vapi's ended reasons that mean something to the team, mapped to their
// Calls.endedReasons message; the rest are technical and stay hidden
export const ENDED_REASONS: Record<
  string,
  | "callerHungUp"
  | "assistantEnded"
  | "transferred"
  | "silence"
  | "timeLimit"
  | "voicemail"
> = {
  "customer-ended-call": "callerHungUp",
  "assistant-ended-call": "assistantEnded",
  "assistant-ended-call-after-message-spoken": "assistantEnded",
  "assistant-ended-call-with-hangup-task": "assistantEnded",
  "assistant-said-end-call-phrase": "assistantEnded",
  "assistant-forwarded-call": "transferred",
  "silence-timed-out": "silence",
  "exceeded-max-duration": "timeLimit",
  voicemail: "voicemail",
}
