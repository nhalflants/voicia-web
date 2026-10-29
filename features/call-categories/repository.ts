import "server-only"

import { and, count, eq, isNotNull } from "drizzle-orm"

import type {
  CallCategory,
  CallCategoryInput,
} from "@/features/call-categories/types"
import { api } from "@/lib/api"
import { db } from "@/lib/db"
import { callCategories, calls } from "@/lib/db/generated/schema"

// Reads go straight to the database; writes go through the NestJS API, which
// owns them (see lib/db/index.ts)

export async function getCallCategories(
  organizationId: string
): Promise<CallCategory[]> {
  const [categories, counts] = await Promise.all([
    db.query.callCategories.findMany({
      where: eq(callCategories.organizationId, organizationId),
      with: { callCategoryRecipients: { columns: { userId: true } } },
    }),
    db
      .select({ categoryId: calls.categoryId, total: count() })
      .from(calls)
      .where(
        and(
          eq(calls.organizationId, organizationId),
          isNotNull(calls.categoryId)
        )
      )
      .groupBy(calls.categoryId),
  ])
  const callCounts = new Map(counts.map((c) => [c.categoryId, c.total]))

  return categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      description: category.description,
      recipientUserIds: category.callCategoryRecipients.map((r) => r.userId),
      callCount: callCounts.get(category.id) ?? 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

// The organization comes from the session token, never from the body
export async function createCallCategory(
  input: CallCategoryInput
): Promise<void> {
  await api("/call-categories", { method: "POST", body: toBody(input) })
}

export async function updateCallCategory(
  id: string,
  input: CallCategoryInput
): Promise<void> {
  await api(`/call-categories/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: toBody(input),
  })
}

export async function deleteCallCategory(id: string): Promise<void> {
  await api(`/call-categories/${encodeURIComponent(id)}`, { method: "DELETE" })
}

// Only the fields the API accepts: it rejects unknown keys
function toBody(input: CallCategoryInput) {
  return JSON.stringify({
    name: input.name,
    color: input.color,
    description: input.description,
    recipientUserIds: input.recipientUserIds,
  })
}
