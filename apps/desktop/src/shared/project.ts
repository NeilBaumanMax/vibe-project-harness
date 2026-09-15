export const PROJECT_SNAPSHOT_CHANNEL = "project:get-snapshot";
export const PROJECT_SELECT_CHANNEL = "project:select";
export const PROJECT_INITIALIZE_CHANNEL = "project:initialize";

export type VibeDirectoryStatus = "present" | "missing";

export interface ProjectSnapshot {
  projectRoot: string;
  vibeDirectoryPath: string;
  vibeDirectoryStatus: VibeDirectoryStatus;
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
