import { mkdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

import { eq } from "drizzle-orm";
import { drizzle, type NodeSQLiteDatabase } from "drizzle-orm/node-sqlite";

import { MEMORY_LAYERS, type MemoryLayer } from "./layers.js";
import { harnessMetadata } from "./schema.js";

const MEMORY_SCHEMA_VERSION = 1;
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
  sqlite.exec("PRAGMA foreign_keys = ON;");
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS harness_metadata (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    ) STRICT;
  `);

  const database = drizzle({ client: sqlite });
  const schemaVersionEntry = database
    .select()
    .from(harnessMetadata)
    .where(eq(harnessMetadata.key, "schema_version"))
    .get();

  if (schemaVersionEntry === undefined) {
    database
      .insert(harnessMetadata)
      .values({ key: "schema_version", value: String(MEMORY_SCHEMA_VERSION) })
      .run();
  } else if (schemaVersionEntry.value !== String(MEMORY_SCHEMA_VERSION)) {
    sqlite.close();
    throw new Error(`Unsupported memory schema version: ${schemaVersionEntry.value}`);
  }

  return {
    database,
    status: {
      databasePath,
      schemaVersion: MEMORY_SCHEMA_VERSION,
      layers: MEMORY_LAYERS,
    },
    close: () => sqlite.close(),
  };
}
