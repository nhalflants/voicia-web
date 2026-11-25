import "server-only"

import { eq } from "drizzle-orm"

import type {
  Assistant,
  AssistantUpdate,
  SmsTemplates,
} from "@/features/assistants/types"
import { api } from "@/lib/api"
import { db } from "@/lib/db"
import { assistants } from "@/lib/db/generated/schema"

// Reads go straight to the database; writes go through the NestJS API, which
// owns them (see lib/db/index.ts)

export async function getAssistants(
  organizationId: string
): Promise<Assistant[]> {
  // The system prompt is never selected: it isn't shown to anyone
  const rows = await db
    .select({
      id: assistants.id,
      name: assistants.name,
      firstMessage: assistants.firstMessage,
      phoneNumber: assistants.phoneNumber,
      smsEnabled: assistants.smsEnabled,
      smsTemplates: assistants.smsTemplates,
    })
    .from(assistants)
    .where(eq(assistants.organizationId, organizationId))

  return rows
    .map(({ phoneNumber, smsEnabled, smsTemplates, ...assistant }) => ({
      ...assistant,
      smsEnabled: smsEnabled && phoneNumber !== null,
      smsTemplates: smsTemplates as SmsTemplates | null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
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
