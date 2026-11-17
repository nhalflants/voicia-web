import "server-only"

import { and, desc, eq, inArray, isNull, ne, sql, type SQL } from "drizzle-orm"

import {
  CALL_HISTORY_LIMIT,
  CALL_LIST_LIMIT,
  STATUS_FILTERS,
} from "@/features/calls/constants"
import type {
  CallDetail,
  CallFilters,
  CallHistoryItem,
  CallListItem,
  CallUpdate,
  TranscriptTurn,
} from "@/features/calls/types"
import { api } from "@/lib/api"
import { db } from "@/lib/db"
import { calls } from "@/lib/db/generated/schema"

// Reads go straight to the database; writes go through the NestJS API, which
// owns them (see lib/db/index.ts)

const listColumns = {
  id: true,
  callerName: true,
  customerNumber: true,
  summary: true,
  startedAt: true,
  durationSeconds: true,
  status: true,
  assigneeUserId: true,
  categoryId: true,
} as const

// The nth call from this number in the 24 hours up to this one. Later calls
// aren't counted, so a call's badge never changes afterwards. A missing number
// or start time makes the comparisons null, which counts 0
const repeatCount = sql<number>`(
  select count(*)::int from ${calls} as prior
  where prior.organization_id = ${calls.organizationId}
    and prior.customer_number = ${calls.customerNumber}
    and prior.started_at > ${calls.startedAt} - interval '24 hours'
    and prior.started_at <= ${calls.startedAt}
)`.as("repeat_count")

// Newest first; calls that never connected have no start time and go last
const newestFirst = [
  sql`${calls.startedAt} desc nulls last`,
  desc(calls.createdAt),
]

export async function getCalls(
  organizationId: string,
  filters: CallFilters,
  currentUserId: string
): Promise<CallListItem[]> {
  const conditions: SQL[] = [eq(calls.organizationId, organizationId)]

  const statuses = STATUS_FILTERS.find(
    (f) => f.value === filters.status
  )?.statuses
  if (statuses) conditions.push(inArray(calls.status, statuses))

  if (filters.assignee === "unassigned") {
    conditions.push(isNull(calls.assigneeUserId))
  } else if (filters.assignee) {
    const assigneeUserId =
      filters.assignee === "me" ? currentUserId : filters.assignee
    conditions.push(eq(calls.assigneeUserId, assigneeUserId))
  }

  if (filters.categoryId) {
    conditions.push(eq(calls.categoryId, filters.categoryId))
  }

  const rows = await db.query.calls.findMany({
    where: and(...conditions),
    columns: listColumns,
    extras: { repeatCount },
    with: { callCategory: { columns: { name: true, color: true } } },
    orderBy: newestFirst,
    limit: CALL_LIST_LIMIT,
  })

  return rows.map(({ callCategory, ...call }) => ({
    ...call,
    category: callCategory,
  }))
}

// Scoped by organization too, so a shared link can't open another
// organization's call
export async function getCall(
  organizationId: string,
  id: string
): Promise<CallDetail | null> {
  const row = await db.query.calls.findFirst({
    where: and(eq(calls.id, id), eq(calls.organizationId, organizationId)),
    columns: {
      ...listColumns,
      endedReason: true,
      isEmpty: true,
      transcript: true,
      recordingUrl: true,
    },
    extras: { repeatCount },
    with: {
      callCategory: { columns: { name: true, color: true } },
      assistant: { columns: { name: true } },
    },
  })
  if (!row) return null

  const {
    callCategory,
    assistant,
    transcript,
    recordingUrl,
    isEmpty,
    ...call
  } = row
  const otherCalls = await getOtherCalls(organizationId, call)
  return {
    ...call,
    category: callCategory,
    assistantName: assistant?.name ?? null,
    isEmpty: isEmpty ?? false,
    transcript: parseTranscript(transcript),
    hasRecording: Boolean(recordingUrl),
    otherCalls: otherCalls.calls,
    otherCallsTotal: otherCalls.total,
  }
}

// Every other call from the same number in this organization, earlier and
// later. Withheld numbers can't be matched
async function getOtherCalls(
  organizationId: string,
  call: { id: string; customerNumber: string | null }
): Promise<{ calls: CallHistoryItem[]; total: number }> {
  if (!call.customerNumber) return { calls: [], total: 0 }

  const where = and(
    eq(calls.organizationId, organizationId),
    eq(calls.customerNumber, call.customerNumber),
    ne(calls.id, call.id)
  )
  const [rows, total] = await Promise.all([
    db.query.calls.findMany({
      where,
      columns: { ...listColumns, isEmpty: true },
      extras: { repeatCount },
      with: { callCategory: { columns: { name: true, color: true } } },
      orderBy: newestFirst,
      limit: CALL_HISTORY_LIMIT,
    }),
    db.$count(calls, where),
  ])

  return {
    calls: rows.map(({ callCategory, isEmpty, ...other }) => ({
      ...other,
      category: callCategory,
      isEmpty: isEmpty ?? false,
    })),
    total,
  }
}

// The stored recording URLs aren't playable (Vapi's storage is private), so
// the API asks Vapi for a short-lived signed URL
export async function getCallRecordingUrl(id: string) {
  const { url } = await api<{ url: string }>(
    `/calls/${encodeURIComponent(id)}/recording`
  )
  return url
}

// The organization comes from the session token, never from the body
export async function updateCall(id: string, update: CallUpdate) {
  await api(`/calls/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: toBody(update),
  })
}

// Only the fields the API accepts: it rejects unknown keys
function toBody(update: CallUpdate) {
  return JSON.stringify({
    status: update.status,
    assigneeUserId: update.assigneeUserId,
    categoryId: update.categoryId,
  })
}

// jsonb is untyped and holds Vapi's OpenAI-formatted messages; anything that
// isn't a spoken turn (system prompt, tool calls) is dropped
function parseTranscript(value: unknown): TranscriptTurn[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((turn) => {
    const { role, content } = (turn ?? {}) as Record<string, unknown>
    if (role !== "assistant" && role !== "user") return []
    if (typeof content !== "string" || !content.trim()) return []
    return [{ role, content: content.trim() }]
  })
}
