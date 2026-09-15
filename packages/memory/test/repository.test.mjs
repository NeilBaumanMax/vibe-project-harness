import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

import { MemoryRepository, openMemoryStore } from "../dist/index.js";

async function createInitializedProject() {
  const projectRoot = await mkdtemp(join(tmpdir(), "vibe-memory-repository-"));
  await mkdir(join(projectRoot, ".vibe"));
  return projectRoot;
}

test("creates, reads and lists knowledge items by layer", async () => {
  const projectRoot = await createInitializedProject();

  try {
    const store = await openMemoryStore(projectRoot);
    const repository = new MemoryRepository(store);
    const timestamp = new Date("2026-09-15T12:00:00.000Z");

    const created = repository.create({
      id: "item-001",
      layer: "working_set",
      content: "Current implementation context",
      timestamp,
    });
    repository.create({
      id: "item-002",
      layer: "active_memory",
      content: "Stable architecture rule",
      timestamp: new Date(timestamp.getTime() + 1_000),
    });

    assert.equal(created.id, "item-001");
    assert.equal(created.createdAt.toISOString(), timestamp.toISOString());
    assert.deepEqual(repository.getById("item-001"), created);
    assert.deepEqual(
      repository.list("working_set").map((item) => item.id),
      ["item-001"],
    );
    assert.deepEqual(
      repository.list().map((item) => item.id),
      ["item-001", "item-002"],
    );
    store.close();
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

test("migrates an existing schema version 1 database to version 2", async () => {
  const projectRoot = await createInitializedProject();
  const runtimePath = join(projectRoot, ".vibe", "runtime");
  const databasePath = join(runtimePath, "memory.sqlite3");

  try {
    await mkdir(runtimePath);
    const legacyDatabase = new DatabaseSync(databasePath);
    legacyDatabase.exec(`
      CREATE TABLE harness_metadata (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      ) STRICT;
      INSERT INTO harness_metadata (key, value) VALUES ('schema_version', '1');
    `);
    legacyDatabase.close();

    const store = await openMemoryStore(projectRoot);
    assert.equal(store.status.schemaVersion, 2);
    const repository = new MemoryRepository(store);
    assert.deepEqual(repository.list(), []);
    store.close();

    const migratedDatabase = new DatabaseSync(databasePath, { readOnly: true });

    try {
      const version = migratedDatabase
        .prepare("SELECT value FROM harness_metadata WHERE key = 'schema_version'")
        .get();
      assert.equal(version.value, "2");
    } finally {
      migratedDatabase.close();
    }
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

test("rejects invalid layers before writing", async () => {
  const projectRoot = await createInitializedProject();

  try {
    const store = await openMemoryStore(projectRoot);
    const repository = new MemoryRepository(store);
    assert.throws(
      () =>
        repository.create({
          id: "invalid-item",
          layer: "unknown",
          content: "Invalid",
        }),
      /Invalid memory layer/,
    );
    assert.equal(repository.getById("invalid-item"), undefined);
    store.close();
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});
