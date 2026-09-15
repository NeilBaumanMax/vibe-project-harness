export const PROJECT_SNAPSHOT_CHANNEL = "project:get-snapshot";
export const PROJECT_SELECT_CHANNEL = "project:select";
export const PROJECT_INITIALIZE_CHANNEL = "project:initialize";

export type VibeDirectoryStatus = "present" | "missing";

export type MemoryLayerCounts = Record<
  "working_set" | "active_memory" | "consolidated_memory" | "indexed_archive" | "expired",
  number
>;

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

export interface HarnessDesktopApi {
  getProjectSnapshot: () => Promise<ProjectSnapshot>;
  selectProject: () => Promise<ProjectSelectionResult>;
  initializeProject: () => Promise<ProjectInitializationResult>;
}
