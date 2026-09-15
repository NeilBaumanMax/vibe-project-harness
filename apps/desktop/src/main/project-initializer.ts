import { mkdir, rename, rmdir, stat, unlink, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

import type { ProjectInitializationResult } from "../shared/project";
import { inspectProject } from "./project-inspector";

const MANIFEST_SCHEMA_VERSION = 1;

function isErrorCode(error: unknown, code: string): boolean {
  return (error as NodeJS.ErrnoException).code === code;
}

async function assertProjectDirectory(projectRoot: string): Promise<void> {
  const projectStats = await stat(projectRoot);

  if (!projectStats.isDirectory()) {
    throw new Error("The active project path is not a directory.");
  }
}

export async function initializeProject(
  projectRoot: string,
): Promise<ProjectInitializationResult> {
  const normalizedProjectRoot = resolve(projectRoot);
  await assertProjectDirectory(normalizedProjectRoot);

  const currentSnapshot = await inspectProject(normalizedProjectRoot);

  if (currentSnapshot.vibeDirectoryStatus === "present") {
    return { status: "already-exists", snapshot: currentSnapshot };
  }

  try {
    await mkdir(currentSnapshot.vibeDirectoryPath);
  } catch (error) {
    if (isErrorCode(error, "EEXIST")) {
      const latestSnapshot = await inspectProject(normalizedProjectRoot);

      if (latestSnapshot.vibeDirectoryStatus === "present") {
        return { status: "already-exists", snapshot: latestSnapshot };
      }

      throw new Error("A file named .vibe already exists in the project root.");
    }

    throw error;
  }

  const manifestPath = join(currentSnapshot.vibeDirectoryPath, "manifest.json");
  const temporaryManifestPath = join(
    currentSnapshot.vibeDirectoryPath,
    `.manifest.${process.pid}.tmp`,
  );
  const projectName = basename(normalizedProjectRoot) || normalizedProjectRoot;
  const manifest = {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    project: { name: projectName },
  };

  try {
    await writeFile(temporaryManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
    await rename(temporaryManifestPath, manifestPath);
  } catch (error) {
    await unlink(temporaryManifestPath).catch(() => undefined);
    await rmdir(currentSnapshot.vibeDirectoryPath).catch(() => undefined);
    throw error;
  }

  return {
    status: "initialized",
    snapshot: await inspectProject(normalizedProjectRoot),
  };
}
