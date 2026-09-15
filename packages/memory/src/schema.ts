import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const harnessMetadata = sqliteTable("harness_metadata", {
  key: text().primaryKey(),
  value: text().notNull(),
});
