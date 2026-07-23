import { pgTable, text, jsonb, timestamp, primaryKey } from "drizzle-orm/pg-core"

export const userState = pgTable("user_state", {
  userId: text("user_id").notNull(),
  key: text("key").notNull(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.key] }),
])
