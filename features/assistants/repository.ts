import "server-only"

import { and, eq } from "drizzle-orm"

import type {
  Assistant,
  AssistantUpdate,
  SmsTemplates,
} from "@/features/assistants/types"
import { isUuid } from "@/features/calls/filters"
import { api } from "@/lib/api"
import { db } from "@/lib/db"
import { assistants } from "@/lib/db/generated/schema"

// Reads go straight to the database; writes go through the NestJS API, which
// owns them (see lib/db/index.ts)

// The system prompt is never selected: it isn't shown to anyone
const columns = {
  id: assistants.id,
  name: assistants.name,
  firstMessage: assistants.firstMessage,
  phoneNumber: assistants.phoneNumber,
  smsEnabled: assistants.smsEnabled,
  smsTemplates: assistants.smsTemplates,
}

function toAssistant({
  phoneNumber,
  smsEnabled,
  smsTemplates,
  ...assistant
}: {
  id: string
  name: string
  firstMessage: string | null
  phoneNumber: string | null
  smsEnabled: boolean
  smsTemplates: unknown
}): Assistant {
  return {
    ...assistant,
    smsEnabled: smsEnabled && phoneNumber !== null,
    smsTemplates: smsTemplates as SmsTemplates | null,
  }
}

export async function getAssistants(
  organizationId: string
): Promise<Assistant[]> {
  const rows = await db
    .select(columns)
    .from(assistants)
    .where(eq(assistants.organizationId, organizationId))

  return rows.map(toAssistant).sort((a, b) => a.name.localeCompare(b.name))
}

export async function getAssistant(
  organizationId: string,
  id: string
): Promise<Assistant | null> {
  // The id is a uuid column: anything else would make Postgres throw
  if (!isUuid(id)) return null
  const [row] = await db
    .select(columns)
    .from(assistants)
    .where(
      and(eq(assistants.organizationId, organizationId), eq(assistants.id, id))
    )
    .limit(1)
  return row ? toAssistant(row) : null
}

// The organization comes from the session token, never from the body. A first
// message change is pushed to Vapi before it is saved
export async function updateAssistant(
  id: string,
  update: AssistantUpdate
): Promise<void> {
  await api(`/assistants/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: toBody(update),
  })
}

// Only the fields the API accepts: it rejects unknown keys. Undefined fields
// are left out by JSON.stringify
function toBody(update: AssistantUpdate) {
  return JSON.stringify({
    name: update.name,
    firstMessage: update.firstMessage,
    smsTemplates: update.smsTemplates,
  })
}
