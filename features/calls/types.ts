import type { callStatus } from "@/lib/db/generated/schema"

export type CallStatus = (typeof callStatus.enumValues)[number]

export interface CallListItem {
  id: string
  callerName: string | null
  customerNumber: string | null
  summary: string | null
  startedAt: string | null
  durationSeconds: number | null
  status: CallStatus
  assigneeUserId: string | null
  categoryId: string | null
  category: { name: string; color: string } | null
  // How many calls its number made today (Belgian time), this one included;
  // 0 for calls from earlier days or without a number or start time
  todayCallCount: number
  // The caller said nothing: a missed call to call back
  isEmpty: boolean
  // The contact owning the call's number, if any
  contact: CallContact | null
}

export interface CallContact {
  id: string
  // Set only when the contact's name is confirmed; it then replaces callerName
  name: string | null
}

export interface TranscriptTurn {
  role: "assistant" | "user"
  content: string
}

// Everything the detail panel shows. The recording itself is fetched through
// /api/calls/[id]/recording, so its storage URL never reaches the browser
export interface CallDetail extends CallListItem {
  endedReason: string | null
  assistantName: string | null
  transcript: TranscriptTurn[]
  hasRecording: boolean
  // The most recent other calls from the same number, newest first, and how
  // many there are in all
  otherCalls: CallListItem[]
  otherCallsTotal: number
}

// "open" groups the calls someone still has to act on
export type StatusFilter = "open" | "closed" | "all"

export interface CallFilters {
  status: StatusFilter
  // "me", "unassigned" or a member's user id; null means anyone
  assignee: string | null
  categoryId: string | null
}

// What the NestJS API accepts to change a call; omitted fields stay as they are
export interface CallUpdate {
  status?: CallStatus
  assigneeUserId?: string | null
  categoryId?: string | null
}
