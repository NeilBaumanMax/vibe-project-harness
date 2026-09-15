import { mkdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

import { drizzle, type NodeSQLiteDatabase } from "drizzle-orm/node-sqlite";

import { MEMORY_LAYERS, type MemoryLayer } from "./layers.js";
import { migrateMemorySchema } from "./migrations.js";

const DATABASE_FILE_NAME = "memory.sqlite3";

type MemoryDatabase = NodeSQLiteDatabase;

export interface MemoryStoreStatus {
  databasePath: string;
  schemaVersion: number;
  layers: readonly MemoryLayer[];
}

export interface MemoryStore {
  database: MemoryDatabase;
  status: MemoryStoreStatus;
  close: () => void;
}

async function assertInitializedProject(projectRoot: string): Promise<string> {
  const vibeDirectoryPath = join(resolve(projectRoot), ".vibe");

  try {
    const vibeStats = await stat(vibeDirectoryPath);

    if (!vibeStats.isDirectory()) {
      throw new Error("The .vibe path is not a directory.");
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error("The project is not initialized: .vibe is missing.");
    }

    throw error;
  }

  return vibeDirectoryPath;
}

export async function openMemoryStore(projectRoot: string): Promise<MemoryStore> {
  const vibeDirectoryPath = await assertInitializedProject(projectRoot);
  const runtimeDirectoryPath = join(vibeDirectoryPath, "runtime");
  await mkdir(runtimeDirectoryPath, { recursive: true });

  const databasePath = join(runtimeDirectoryPath, DATABASE_FILE_NAME);
  const sqlite = new DatabaseSync(databasePath, { timeout: 5_000 });

  try {
    sqlite.exec("PRAGMA foreign_keys = ON;");
    const schemaVersion = migrateMemorySchema(sqlite);
    const database = drizzle({ client: sqlite });

    return {
      database,
      status: {
        databasePath,
        schemaVersion,
        layers: MEMORY_LAYERS,
      },
      close: () => {
        if (sqlite.isOpen) sqlite.close();
      },
    };
  } catch (error) {
    if (sqlite.isOpen) sqlite.close();
    throw error;
  }
}
