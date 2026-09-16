export const PROJECT_SNAPSHOT_CHANNEL = "project:get-snapshot";
export const PROJECT_SELECT_CHANNEL = "project:select";
export const PROJECT_INITIALIZE_CHANNEL = "project:initialize";
export const MEMORY_ITEMS_CHANNEL = "memory:list-items";
export const MEMORY_CREATE_WORKING_SET_CHANNEL = "memory:create-working-set-item";
export const MEMORY_PROMOTE_WORKING_SET_CHANNEL = "memory:promote-working-set-item";
export const MEMORY_UPDATE_ITEM_CONTENT_CHANNEL = "memory:update-item-content";

export type VibeDirectoryStatus = "present" | "missing";

export type MemoryLayerId =
  | "working_set"
  | "active_memory"
  | "consolidated_memory"
  | "indexed_archive"
  | "expired";

export type MemoryLayerCounts = Record<MemoryLayerId, number>;

export interface MemoryItemSnapshot {
  id: string;
  layer: MemoryLayerId;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type MemoryRuntimeSnapshot =
  | { status: "unavailable" }
  | { status: "ready"; schemaVersion: number; itemCounts: MemoryLayerCounts }
  | { status: "error"; message: string };

export interface ProjectSnapshot {
  projectRoot: string;
  vibeDirectoryPath: string;
  vibeDirectoryStatus: VibeDirectoryStatus;
  memoryRuntime: MemoryRuntimeSnapshot;
}

export type ProjectSelectionResult =
  | { status: "selected"; snapshot: ProjectSnapshot }
  | { status: "cancelled" };

export type ProjectInitializationResult =
  | { status: "initialized"; snapshot: ProjectSnapshot }
  | { status: "already-exists"; snapshot: ProjectSnapshot };

export interface MemoryItemMutationResult {
  item: MemoryItemSnapshot;
  snapshot: ProjectSnapshot;
}

export type CreateWorkingSetItemResult = MemoryItemMutationResult;
export type PromoteWorkingSetItemResult = MemoryItemMutationResult;
export type UpdateKnowledgeItemContentResult = MemoryItemMutationResult;

export interface HarnessDesktopApi {
  getProjectSnapshot: () => Promise<ProjectSnapshot>;
  selectProject: () => Promise<ProjectSelectionResult>;
  initializeProject: () => Promise<ProjectInitializationResult>;
  listMemoryItems: (layer?: MemoryLayerId) => Promise<MemoryItemSnapshot[]>;
  createWorkingSetItem: (content: string) => Promise<CreateWorkingSetItemResult>;
  promoteWorkingSetItem: (itemId: string) => Promise<PromoteWorkingSetItemResult>;
  updateKnowledgeItemContent: (
    itemId: string,
    content: string,
  ) => Promise<UpdateKnowledgeItemContentResult>;
}
