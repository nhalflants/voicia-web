import {
  pgTable,
  index,
  foreignKey,
  unique,
  uuid,
  text,
  timestamp,
  integer,
  numeric,
  jsonb,
  boolean,
  check,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const language = pgEnum("language", ["fr", "nl", "en"])

export const calls = pgTable(
  "calls",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    organizationId: text("organization_id").notNull(),
    assistantId: uuid("assistant_id"),
    externalCallId: text("external_call_id").notNull(),
    endedReason: text("ended_reason"),
    customerNumber: text("customer_number"),
    phoneNumberId: text("phone_number_id"),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "string" }),
    endedAt: timestamp("ended_at", { withTimezone: true, mode: "string" }),
    durationSeconds: integer("duration_seconds"),
    cost: numeric({ precision: 10, scale: 4 }),
    costBreakdown: jsonb("cost_breakdown"),
    transcript: jsonb(),
    recordingUrl: text("recording_url"),
    stereoRecordingUrl: text("stereo_recording_url"),
    summary: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    isEmpty: boolean("is_empty"),
    callerName: text("caller_name"),
    successScore: integer("success_score"),
    categoryId: uuid("category_id"),
  },
  (table) => [
    index("calls_assistant_id_idx").using(
      "btree",
      table.assistantId.asc().nullsLast().op("uuid_ops")
    ),
    index("calls_category_id_idx").using(
      "btree",
      table.categoryId.asc().nullsLast().op("uuid_ops")
    ),
    index("calls_organization_id_started_at_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("timestamptz_ops"),
      table.startedAt.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.assistantId],
      foreignColumns: [assistants.id],
      name: "calls_assistant_id_assistants_id_fk",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [callCategories.id],
      name: "calls_category_id_call_categories_id_fk",
    }).onDelete("set null"),
    unique("calls_external_call_id_unique").on(table.externalCallId),
  ]
)

export const assistants = pgTable(
  "assistants",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    organizationId: text("organization_id").notNull(),
    externalAssistantId: text("external_assistant_id").notNull(),
    name: text().notNull(),
    firstMessage: text("first_message"),
    systemPrompt: text("system_prompt"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("assistants_organization_id_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
    unique("assistants_external_assistant_id_unique").on(
      table.externalAssistantId
    ),
  ]
)

export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id").primaryKey().notNull(),
  language: language(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  contactEmail: text("contact_email"),
})

export const callCategories = pgTable(
  "call_categories",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    organizationId: text("organization_id").notNull(),
    name: text().notNull(),
    color: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    description: text(),
  },
  (table) => [
    unique("call_categories_organization_id_name_unique").on(
      table.organizationId,
      table.name
    ),
    unique("call_categories_id_organization_id_unique").on(
      table.organizationId,
      table.id
    ),
    check(
      "call_categories_color_hex_check",
      sql`color ~ '^#[0-9A-Fa-f]{6}$'::text`
    ),
  ]
)

export const callCategoryRecipients = pgTable(
  "call_category_recipients",
  {
    categoryId: uuid("category_id").notNull(),
    organizationId: text("organization_id").notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("call_category_recipients_organization_id_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
    index("call_category_recipients_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.categoryId, table.organizationId],
      foreignColumns: [callCategories.id, callCategories.organizationId],
      name: "call_category_recipients_category_organization_fk",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.userId, table.categoryId],
      name: "call_category_recipients_category_id_user_id_pk",
    }),
  ]
)
