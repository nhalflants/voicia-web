import { relations } from "drizzle-orm/relations"
import { assistants, calls } from "./schema"

export const callsRelations = relations(calls, ({ one }) => ({
  assistant: one(assistants, {
    fields: [calls.assistantId],
    references: [assistants.id],
  }),
}))

export const assistantsRelations = relations(assistants, ({ many }) => ({
  calls: many(calls),
}))
