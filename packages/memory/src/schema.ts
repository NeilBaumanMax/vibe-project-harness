import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import type { MemoryLayer } from "./layers.js";

export const harnessMetadata = sqliteTable("harness_metadata", {
  key: text().primaryKey(),
  value: text().notNull(),
});

export const knowledgeItems = sqliteTable("knowledge_items", {
  id: text().primaryKey(),
  layer: text().$type<MemoryLayer>().notNull(),
  content: text().notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});
