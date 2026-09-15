import { stat } from "node:fs/promises";
import { resolve } from "node:path";

import type { ProjectSnapshot } from "../shared/project";

function readProjectArgument(args: string[]): string | undefined {
  const inlineArgument = args.find((argument) => argument.startsWith("--project="));

  if (inlineArgument) {
    return inlineArgument.slice("--project=".length);
  }

  const argumentIndex = args.indexOf("--project");
  return argumentIndex >= 0 ? args[argumentIndex + 1] : undefined;
}

export function resolveProjectRoot(): string {
  const configuredPath =
    readProjectArgument(process.argv) ??
    process.env.VIBE_PROJECT_PATH ??
    process.env.INIT_CWD ??
    process.cwd();

  return resolve(configuredPath);
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory();
  } catch (error) {
    const errorCode = (error as NodeJS.ErrnoException).code;

    if (errorCode === "ENOENT" || errorCode === "ENOTDIR") {
      return false;
    }

    throw error;
  }
}

export async function inspectProject(projectRoot = resolveProjectRoot()): Promise<ProjectSnapshot> {
  const normalizedProjectRoot = resolve(projectRoot);
  const vibeDirectoryPath = resolve(normalizedProjectRoot, ".vibe");
  const vibeDirectoryExists = await isDirectory(vibeDirectoryPath);

  return {
    projectRoot: normalizedProjectRoot,
    vibeDirectoryPath,
    vibeDirectoryStatus: vibeDirectoryExists ? "present" : "missing",
  };
}
