import { relations } from "drizzle-orm/relations"
import {
  callCategories,
  calls,
  organizationMemberships,
  assistants,
  contacts,
  contactPhoneNumbers,
  smsMessages,
  callCategoryRecipients,
} from "./schema"

export const callsRelations = relations(calls, ({ one }) => ({
  callCategory: one(callCategories, {
    fields: [calls.categoryId],
    references: [callCategories.id],
  }),
  organizationMembership: one(organizationMemberships, {
    fields: [calls.organizationId],
    references: [organizationMemberships.organizationId],
  }),
  assistant: one(assistants, {
    fields: [calls.assistantId],
    references: [assistants.id],
  }),
}))

export const callCategoriesRelations = relations(
  callCategories,
  ({ many }) => ({
    calls: many(calls),
    callCategoryRecipients: many(callCategoryRecipients),
  })
)

export const organizationMembershipsRelations = relations(
  organizationMemberships,
  ({ many }) => ({
    calls: many(calls),
    callCategoryRecipients: many(callCategoryRecipients),
  })
)

export const assistantsRelations = relations(assistants, ({ many }) => ({
  calls: many(calls),
  smsMessages: many(smsMessages),
}))

export const contactPhoneNumbersRelations = relations(
  contactPhoneNumbers,
  ({ one }) => ({
    contact: one(contacts, {
      fields: [contactPhoneNumbers.contactId],
      references: [contacts.id],
    }),
  })
)

export const contactsRelations = relations(contacts, ({ many }) => ({
  contactPhoneNumbers: many(contactPhoneNumbers),
}))

export const smsMessagesRelations = relations(smsMessages, ({ one }) => ({
  assistant: one(assistants, {
    fields: [smsMessages.assistantId],
    references: [assistants.id],
  }),
}))

export const callCategoryRecipientsRelations = relations(
  callCategoryRecipients,
  ({ one }) => ({
    callCategory: one(callCategories, {
      fields: [callCategoryRecipients.categoryId],
      references: [callCategories.id],
    }),
    organizationMembership: one(organizationMemberships, {
      fields: [callCategoryRecipients.organizationId],
      references: [organizationMemberships.organizationId],
    }),
  })
)
