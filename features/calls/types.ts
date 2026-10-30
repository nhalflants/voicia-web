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
  statusChangedAt: string | null
  assigneeUserId: string | null
  category: { name: string; color: string } | null
}

// "open" groups the calls someone still has to act on
export type StatusFilter = "open" | "done" | "dismissed" | "all"

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
}
