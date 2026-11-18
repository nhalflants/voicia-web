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
  check,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const callStatus = pgEnum("call_status", ["new", "in_progress", "done"])
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
    assistantId: uuid("assistant_id").notNull(),
    externalCallId: text("external_call_id").notNull(),
    endedReason: text("ended_reason"),
    customerNumber: text("customer_number"),
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
    status: callStatus().default("new").notNull(),
    assigneeUserId: text("assignee_user_id"),
    statusChangedAt: timestamp("status_changed_at", {
      withTimezone: true,
      mode: "string",
    }),
    usageReportedAt: timestamp("usage_reported_at", {
      withTimezone: true,
      mode: "string",
    }),
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
    index("calls_organization_id_assignee_user_id_idx")
      .using(
        "btree",
        table.organizationId.asc().nullsLast().op("text_ops"),
        table.assigneeUserId.asc().nullsLast().op("text_ops")
      )
      .where(sql`(assignee_user_id IS NOT NULL)`),
    index("calls_organization_id_customer_number_started_at_idx")
      .using(
        "btree",
        table.organizationId.asc().nullsLast().op("text_ops"),
        table.customerNumber.asc().nullsLast().op("timestamptz_ops"),
        table.startedAt.asc().nullsLast().op("timestamptz_ops")
      )
      .where(sql`(customer_number IS NOT NULL)`),
    index("calls_organization_id_started_at_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("timestamptz_ops"),
      table.startedAt.asc().nullsLast().op("text_ops")
    ),
    index("calls_organization_id_status_started_at_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops"),
      table.status.asc().nullsLast().op("text_ops"),
      table.startedAt.asc().nullsLast().op("enum_ops")
    ),
    index("calls_usage_unreported_created_at_idx")
      .using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops"))
      .where(sql`(usage_reported_at IS NULL)`),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [callCategories.id],
      name: "calls_category_id_call_categories_id_fk",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.organizationId, table.assigneeUserId],
      foreignColumns: [
        organizationMemberships.organizationId,
        organizationMemberships.userId,
      ],
      name: "calls_assignee_membership_fk",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.assistantId],
      foreignColumns: [assistants.id],
      name: "calls_assistant_id_assistants_id_fk",
    }).onDelete("cascade"),
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

export const organizationBilling = pgTable(
  "organization_billing",
  {
    organizationId: text("organization_id").primaryKey().notNull(),
    stripeCustomerId: text("stripe_customer_id").notNull(),
    stripeSubscriptionId: text("stripe_subscription_id").notNull(),
    status: text().notNull(),
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    currentPeriodEnd: timestamp("current_period_end", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    cancelAt: timestamp("cancel_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("organization_billing_stripe_customer_id_unique").on(
      table.stripeCustomerId
    ),
    unique("organization_billing_stripe_subscription_id_unique").on(
      table.stripeSubscriptionId
    ),
  ]
)

export const organizationMemberships = pgTable(
  "organization_memberships",
  {
    id: text().primaryKey().notNull(),
    organizationId: text("organization_id").notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("organization_memberships_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops")
    ),
    unique("organization_memberships_organization_id_user_id_unique").on(
      table.userId,
      table.organizationId
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
    foreignKey({
      columns: [table.organizationId, table.userId],
      foreignColumns: [
        organizationMemberships.organizationId,
        organizationMemberships.userId,
      ],
      name: "call_category_recipients_membership_fk",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.userId, table.categoryId],
      name: "call_category_recipients_category_id_user_id_pk",
    }),
  ]
)
