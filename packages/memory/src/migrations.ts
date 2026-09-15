import type { DatabaseSync } from "node:sqlite";

const CURRENT_SCHEMA_VERSION = 2;

interface SchemaVersionRow {
  value: string;
}

function readSchemaVersion(sqlite: DatabaseSync): number {
  const entry = sqlite
    .prepare("SELECT value FROM harness_metadata WHERE key = ?")
    .get("schema_version") as SchemaVersionRow | undefined;

  if (entry === undefined) {
    sqlite
      .prepare("INSERT INTO harness_metadata (key, value) VALUES (?, ?)")
      .run("schema_version", "1");
    return 1;
  }

  const version = Number(entry.value);

  if (!Number.isSafeInteger(version) || version < 1) {
    throw new Error(`Invalid memory schema version: ${entry.value}`);
  }

  return version;
}

function migrateToVersion2(sqlite: DatabaseSync): void {
  sqlite.exec(`
    CREATE TABLE knowledge_items (
      id TEXT PRIMARY KEY NOT NULL,
      layer TEXT NOT NULL CHECK (
        layer IN (
          'working_set',
          'active_memory',
          'consolidated_memory',
          'indexed_archive',
          'expired'
        )
      ),
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    ) STRICT;
  `);
}

export function migrateMemorySchema(sqlite: DatabaseSync): number {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS harness_metadata (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    ) STRICT;
  `);

  let schemaVersion = readSchemaVersion(sqlite);

  if (schemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error(`Unsupported memory schema version: ${schemaVersion}`);
  }

  if (schemaVersion < 2) {
    sqlite.exec("BEGIN IMMEDIATE;");

    try {
      migrateToVersion2(sqlite);
      sqlite
        .prepare("UPDATE harness_metadata SET value = ? WHERE key = ?")
        .run("2", "schema_version");
      sqlite.exec("COMMIT;");
      schemaVersion = 2;
    } catch (error) {
      sqlite.exec("ROLLBACK;");
      throw error;
    }
  }

  return schemaVersion;
}
