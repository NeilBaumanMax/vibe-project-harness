import { randomUUID } from "node:crypto";
import { stat } from "node:fs/promises";
import { resolve } from "node:path";

import {
  MemoryRepository,
  openMemoryStore,
  type MemoryStore,
} from "@vibe-project-harness/memory";

import type {
  CreateWorkingSetItemResult,
  DeleteKnowledgeItemResult,
  ExpireKnowledgeItemResult,
  MemoryItemSnapshot,
  MemoryLayerId,
  PromoteWorkingSetItemResult,
  ProjectInitializationResult,
  ProjectSnapshot,
  RestoreKnowledgeItemResult,
  UpdateKnowledgeItemContentResult,
} from "../shared/project";
import { initializeProject } from "./project-initializer";
import { inspectProject, resolveProjectRoot } from "./project-inspector";

function toMemoryItemSnapshot(item: {
  id: string;
  layer: MemoryLayerId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}): MemoryItemSnapshot {
  return {
    id: item.id,
    layer: item.layer,
    content: item.content,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export class ProjectSession {
  private projectRoot = resolveProjectRoot();
  private memoryStore: MemoryStore | undefined;
  private memoryStorePromise: Promise<MemoryStore> | undefined;

  async getSnapshot(): Promise<ProjectSnapshot> {
    const snapshot = await inspectProject(this.projectRoot);

    if (snapshot.vibeDirectoryStatus === "missing") {
      this.closeMemoryStore();
      return snapshot;
    }

    try {
      const memoryStore = await this.getOrOpenMemoryStore();
      const repository = new MemoryRepository(memoryStore);

      return {
        ...snapshot,
        memoryRuntime: {
          status: "ready",
          schemaVersion: memoryStore.status.schemaVersion,
          itemCounts: repository.countByLayer(),
        },
      };
    } catch (error) {
      this.closeMemoryStore();

      return {
        ...snapshot,
        memoryRuntime: {
          status: "error",
          message: error instanceof Error ? error.message : "Memory runtime failed to open.",
        },
      };
    }
  }

  async select(projectRoot: string): Promise<ProjectSnapshot> {
    const normalizedProjectRoot = resolve(projectRoot);
    const projectStats = await stat(normalizedProjectRoot);

    if (!projectStats.isDirectory()) {
      throw new Error("The selected project path is not a directory.");
    }

    await inspectProject(normalizedProjectRoot);
    this.closeMemoryStore();
    this.projectRoot = normalizedProjectRoot;
    return this.getSnapshot();
  }

  async initialize(): Promise<ProjectInitializationResult> {
    const result = await initializeProject(this.projectRoot);

    return {
      ...result,
      snapshot: await this.getSnapshot(),
    };
  }

  async listMemoryItems(layer?: MemoryLayerId, query?: string): Promise<MemoryItemSnapshot[]> {
    const memoryStore = await this.getOrOpenMemoryStore();
    const repository = new MemoryRepository(memoryStore);

    return (query?.trim() ? repository.search(query, layer) : repository.list(layer)).map(toMemoryItemSnapshot);
  }

  async createWorkingSetItem(content: unknown): Promise<CreateWorkingSetItemResult> {
    if (typeof content !== "string") {
      throw new Error("Knowledge Item content must be text.");
    }

    const normalizedContent = content.trim();

    if (normalizedContent.length === 0) {
      throw new Error("Knowledge Item content cannot be empty.");
    }

    const memoryStore = await this.getOrOpenMemoryStore();
    const repository = new MemoryRepository(memoryStore);
    const item = repository.create({
      id: randomUUID(),
      layer: "working_set",
      content: normalizedContent,
      timestamp: new Date(),
    });

    return {
      item: toMemoryItemSnapshot(item),
      snapshot: await this.getSnapshot(),
    };
  }

  async promoteWorkingSetItem(itemId: unknown): Promise<PromoteWorkingSetItemResult> {
    if (typeof itemId !== "string" || itemId.trim().length === 0) {
      throw new Error("Knowledge Item ID must be non-empty text.");
    }

    const memoryStore = await this.getOrOpenMemoryStore();
    const repository = new MemoryRepository(memoryStore);
    const item = repository.getById(itemId.trim());

    if (!item) {
      throw new Error("Knowledge Item was not found.");
    }

    if (item.layer !== "working_set") {
      throw new Error("Only Working Set items can be promoted.");
    }

    const promotedItem = repository.moveToLayer({
      id: item.id,
      layer: "active_memory",
      timestamp: new Date(),
    });

    if (!promotedItem) {
      throw new Error("Knowledge Item was not found.");
    }

    return {
      item: toMemoryItemSnapshot(promotedItem),
      snapshot: await this.getSnapshot(),
    };
  }

  async updateKnowledgeItemContent(
    itemId: unknown,
    content: unknown,
  ): Promise<UpdateKnowledgeItemContentResult> {
    if (typeof itemId !== "string" || itemId.trim().length === 0) {
      throw new Error("Knowledge Item ID must be non-empty text.");
    }

    if (typeof content !== "string" || content.trim().length === 0) {
      throw new Error("Knowledge Item content cannot be empty.");
    }

    const memoryStore = await this.getOrOpenMemoryStore();
    const repository = new MemoryRepository(memoryStore);
    const item = repository.getById(itemId.trim());

    if (!item) {
      throw new Error("Knowledge Item was not found.");
    }

    const updatedItem = repository.updateContent({
      id: item.id,
      content: content.trim(),
      timestamp: new Date(),
    });

    if (!updatedItem) {
      throw new Error("Knowledge Item was not found.");
    }

    return {
      item: toMemoryItemSnapshot(updatedItem),
      snapshot: await this.getSnapshot(),
    };
  }

  async deleteKnowledgeItem(itemId: unknown): Promise<DeleteKnowledgeItemResult> {
    if (typeof itemId !== "string" || itemId.trim().length === 0) {
      throw new Error("Knowledge Item ID must be non-empty text.");
    }

    const memoryStore = await this.getOrOpenMemoryStore();
    const repository = new MemoryRepository(memoryStore);
    const deletedItem = repository.deleteById(itemId.trim());

    if (!deletedItem) {
      throw new Error("Knowledge Item was not found.");
    }

    return {
      item: toMemoryItemSnapshot(deletedItem),
      snapshot: await this.getSnapshot(),
    };
  }

  async expireKnowledgeItem(itemId: unknown): Promise<ExpireKnowledgeItemResult> {
    if (typeof itemId !== "string" || itemId.trim().length === 0) {
      throw new Error("Knowledge Item ID must be non-empty text.");
    }

    const memoryStore = await this.getOrOpenMemoryStore();
    const repository = new MemoryRepository(memoryStore);
    const item = repository.getById(itemId.trim());

    if (!item) {
      throw new Error("Knowledge Item was not found.");
    }

    if (item.layer === "expired") {
      throw new Error("Knowledge Item is already expired.");
    }

    const expiredItem = repository.moveToLayer({
      id: item.id,
      layer: "expired",
      timestamp: new Date(),
    });

    if (!expiredItem) {
      throw new Error("Knowledge Item was not found.");
    }

    return {
      item: toMemoryItemSnapshot(expiredItem),
      snapshot: await this.getSnapshot(),
    };
  }

  async restoreKnowledgeItem(itemId: unknown): Promise<RestoreKnowledgeItemResult> {
    if (typeof itemId !== "string" || itemId.trim().length === 0) {
      throw new Error("Knowledge Item ID must be non-empty text.");
    }

    const memoryStore = await this.getOrOpenMemoryStore();
    const repository = new MemoryRepository(memoryStore);
    const item = repository.getById(itemId.trim());

    if (!item) {
      throw new Error("Knowledge Item was not found.");
    }

    if (item.layer !== "expired") {
      throw new Error("Only Expired items can be restored.");
    }

    const restoredItem = repository.moveToLayer({
      id: item.id,
      layer: "working_set",
      timestamp: new Date(),
    });

    if (!restoredItem) {
      throw new Error("Knowledge Item was not found.");
    }

    return {
      item: toMemoryItemSnapshot(restoredItem),
      snapshot: await this.getSnapshot(),
    };
  }

  close(): void {
    this.closeMemoryStore();
  }

  private closeMemoryStore(): void {
    this.memoryStore?.close();
    void this.memoryStorePromise?.then(
      (memoryStore) => memoryStore.close(),
      () => undefined,
    );
    this.memoryStore = undefined;
    this.memoryStorePromise = undefined;
  }

  private async getOrOpenMemoryStore(): Promise<MemoryStore> {
    if (this.memoryStore) return this.memoryStore;

    const openingProjectRoot = this.projectRoot;
    const openingStore = this.memoryStorePromise ?? openMemoryStore(openingProjectRoot);
    this.memoryStorePromise = openingStore;

    try {
      const memoryStore = await openingStore;

      if (openingProjectRoot !== this.projectRoot) {
        memoryStore.close();
        throw new Error("The active project changed while the memory runtime was opening.");
      }

      this.memoryStore = memoryStore;
      return memoryStore;
    } finally {
      if (this.memoryStorePromise === openingStore) {
        this.memoryStorePromise = undefined;
      }
    }
  }
}
