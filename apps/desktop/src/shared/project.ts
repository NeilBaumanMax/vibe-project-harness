export const PROJECT_SNAPSHOT_CHANNEL = "project:get-snapshot";

export type VibeDirectoryStatus = "present" | "missing";

export interface ProjectSnapshot {
  projectRoot: string;
  vibeDirectoryPath: string;
  vibeDirectoryStatus: VibeDirectoryStatus;
}

export interface HarnessDesktopApi {
  getProjectSnapshot: () => Promise<ProjectSnapshot>;
}
