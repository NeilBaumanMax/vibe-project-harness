import { asc, eq } from "drizzle-orm";

import { isMemoryLayer, type MemoryLayer } from "./layers.js";
import { knowledgeItems } from "./schema.js";
import type { MemoryStore } from "./store.js";

export type KnowledgeItem = typeof knowledgeItems.$inferSelect;

export interface CreateKnowledgeItemInput {
  id: string;
  layer: MemoryLayer;
  content: string;
  timestamp?: Date;
}

export class MemoryRepository {
  constructor(private readonly store: MemoryStore) {}

  create(input: CreateKnowledgeItemInput): KnowledgeItem {
    if (!isMemoryLayer(input.layer)) {
      throw new Error(`Invalid memory layer: ${input.layer}`);
    }

    const timestamp = input.timestamp ?? new Date();

    return this.store.database
      .insert(knowledgeItems)
      .values({
        id: input.id,
        layer: input.layer,
        content: input.content,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning()
      .get();
  }

  getById(id: string): KnowledgeItem | undefined {
    return this.store.database
      .select()
      .from(knowledgeItems)
      .where(eq(knowledgeItems.id, id))
      .get();
  }

  list(layer?: MemoryLayer): KnowledgeItem[] {
    if (layer !== undefined && !isMemoryLayer(layer)) {
      throw new Error(`Invalid memory layer: ${layer}`);
    }

    if (layer === undefined) {
      return this.store.database
        .select()
        .from(knowledgeItems)
        .orderBy(asc(knowledgeItems.createdAt), asc(knowledgeItems.id))
        .all();
    }

    return this.store.database
      .select()
      .from(knowledgeItems)
      .where(eq(knowledgeItems.layer, layer))
      .orderBy(asc(knowledgeItems.createdAt), asc(knowledgeItems.id))
      .all();
  }
}
