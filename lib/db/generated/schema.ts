import {
  pgTable,
  index,
  unique,
  uuid,
  text,
  timestamp,
  foreignKey,
  integer,
  numeric,
  jsonb,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const language = pgEnum("language", ["fr", "nl", "en"])

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
  },
  (table) => [
    index("calls_assistant_id_idx").using(
      "btree",
      table.assistantId.asc().nullsLast().op("uuid_ops")
    ),
    index("calls_organization_id_started_at_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops"),
      table.startedAt.asc().nullsLast().op("timestamptz_ops")
    ),
    foreignKey({
      columns: [table.assistantId],
      foreignColumns: [assistants.id],
      name: "calls_assistant_id_assistants_id_fk",
    }).onDelete("set null"),
    unique("calls_external_call_id_unique").on(table.externalCallId),
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
})
