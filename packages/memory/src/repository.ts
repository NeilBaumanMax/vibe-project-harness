import { asc, count, eq } from "drizzle-orm";

import { isMemoryLayer, MEMORY_LAYERS, type MemoryLayer } from "./layers.js";
import { knowledgeItems } from "./schema.js";
import type { MemoryStore } from "./store.js";

export type KnowledgeItem = typeof knowledgeItems.$inferSelect;

export interface CreateKnowledgeItemInput {
  id: string;
  layer: MemoryLayer;
  content: string;
  timestamp?: Date;
}

export interface UpdateKnowledgeItemContentInput {
  id: string;
  content: string;
  timestamp: Date;
}

export interface MoveKnowledgeItemInput {
  id: string;
  layer: MemoryLayer;
  timestamp: Date;
}

export type MemoryLayerCounts = Record<MemoryLayer, number>;

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

  updateContent(input: UpdateKnowledgeItemContentInput): KnowledgeItem | undefined {
    return this.store.database
      .update(knowledgeItems)
      .set({ content: input.content, updatedAt: input.timestamp })
      .where(eq(knowledgeItems.id, input.id))
      .returning()
      .get();
  }

  moveToLayer(input: MoveKnowledgeItemInput): KnowledgeItem | undefined {
    if (!isMemoryLayer(input.layer)) {
      throw new Error(`Invalid memory layer: ${input.layer}`);
    }

    return this.store.database
      .update(knowledgeItems)
      .set({ layer: input.layer, updatedAt: input.timestamp })
      .where(eq(knowledgeItems.id, input.id))
      .returning()
      .get();
  }

  deleteById(id: string): KnowledgeItem | undefined {
    return this.store.database
      .delete(knowledgeItems)
      .where(eq(knowledgeItems.id, id))
      .returning()
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

  countByLayer(): MemoryLayerCounts {
    const counts = Object.fromEntries(MEMORY_LAYERS.map((layer) => [layer, 0])) as MemoryLayerCounts;
    const rows = this.store.database
      .select({ layer: knowledgeItems.layer, count: count() })
      .from(knowledgeItems)
      .groupBy(knowledgeItems.layer)
      .all();

    for (const row of rows) {
      counts[row.layer] = row.count;
    }

    return counts;
  }
}
