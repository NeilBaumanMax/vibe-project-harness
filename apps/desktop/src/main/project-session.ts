import { stat } from "node:fs/promises";
import { resolve } from "node:path";

import type { ProjectInitializationResult, ProjectSnapshot } from "../shared/project";
import { initializeProject } from "./project-initializer";
import { inspectProject, resolveProjectRoot } from "./project-inspector";

export class ProjectSession {
  private projectRoot = resolveProjectRoot();

  async getSnapshot(): Promise<ProjectSnapshot> {
    return inspectProject(this.projectRoot);
  }

  async select(projectRoot: string): Promise<ProjectSnapshot> {
    const normalizedProjectRoot = resolve(projectRoot);
    const projectStats = await stat(normalizedProjectRoot);

    if (!projectStats.isDirectory()) {
      throw new Error("The selected project path is not a directory.");
    }

    const snapshot = await inspectProject(normalizedProjectRoot);
    this.projectRoot = snapshot.projectRoot;
    return snapshot;
  }

  async initialize(): Promise<ProjectInitializationResult> {
    return initializeProject(this.projectRoot);
  }
}
