import { stat } from "node:fs/promises";
import { resolve } from "node:path";

import {
  MemoryRepository,
  openMemoryStore,
  type MemoryStore,
} from "@vibe-project-harness/memory";

import type { ProjectInitializationResult, ProjectSnapshot } from "../shared/project";
import { initializeProject } from "./project-initializer";
import { inspectProject, resolveProjectRoot } from "./project-inspector";

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
