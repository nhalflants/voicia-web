import { relations } from "drizzle-orm/relations"
import {
  assistants,
  calls,
  callCategories,
  callCategoryRecipients,
} from "./schema"

export const callsRelations = relations(calls, ({ one }) => ({
  assistant: one(assistants, {
    fields: [calls.assistantId],
    references: [assistants.id],
  }),
  callCategory: one(callCategories, {
    fields: [calls.categoryId],
    references: [callCategories.id],
  }),
}))

export const assistantsRelations = relations(assistants, ({ many }) => ({
  calls: many(calls),
}))

export const callCategoriesRelations = relations(
  callCategories,
  ({ many }) => ({
    calls: many(calls),
    callCategoryRecipients: many(callCategoryRecipients),
  })
)

export const callCategoryRecipientsRelations = relations(
  callCategoryRecipients,
  ({ one }) => ({
    callCategory: one(callCategories, {
      fields: [callCategoryRecipients.categoryId],
      references: [callCategories.id],
    }),
  })
)
