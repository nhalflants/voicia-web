import "server-only"

import { and, desc, eq, inArray, isNull, sql, type SQL } from "drizzle-orm"

import { CALL_LIST_LIMIT, STATUS_FILTERS } from "@/features/calls/constants"
import type {
  CallFilters,
  CallListItem,
  CallUpdate,
} from "@/features/calls/types"
import { api } from "@/lib/api"
import { db } from "@/lib/db"
import { calls } from "@/lib/db/generated/schema"

// Reads go straight to the database; writes go through the NestJS API, which
// owns them (see lib/db/index.ts)

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
    columns: {
      id: true,
      callerName: true,
      customerNumber: true,
      summary: true,
      startedAt: true,
      durationSeconds: true,
      status: true,
      statusChangedAt: true,
      assigneeUserId: true,
    },
    with: { callCategory: { columns: { name: true, color: true } } },
    // Calls that never connected have no start time; keep them at the bottom
    orderBy: [sql`${calls.startedAt} desc nulls last`, desc(calls.createdAt)],
    limit: CALL_LIST_LIMIT,
  })

  return rows.map(({ callCategory, ...call }) => ({
    ...call,
    category: callCategory,
  }))
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
  })
}
