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
    assert.deepEqual(repository.countByLayer(), {
      working_set: 1,
      active_memory: 1,
      consolidated_memory: 0,
      indexed_archive: 0,
      expired: 0,
    });
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
    repository.create({
      id: "valid-item",
      layer: "working_set",
      content: "Valid",
      timestamp: new Date("2026-09-15T12:00:00.000Z"),
    });
    assert.throws(
      () =>
        repository.moveToLayer({
          id: "valid-item",
          layer: "unknown",
          timestamp: new Date("2026-09-15T12:01:00.000Z"),
        }),
      /Invalid memory layer/,
    );
    assert.equal(repository.getById("valid-item").layer, "working_set");
    store.close();
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

test("updates content and moves items without changing their creation time", async () => {
  const projectRoot = await createInitializedProject();

  try {
    const store = await openMemoryStore(projectRoot);
    const repository = new MemoryRepository(store);
    const createdAt = new Date("2026-09-15T12:00:00.000Z");
    const contentUpdatedAt = new Date("2026-09-15T12:05:00.000Z");
    const movedAt = new Date("2026-09-15T12:10:00.000Z");

    repository.create({
      id: "mutable-item",
      layer: "working_set",
      content: "Initial content",
      timestamp: createdAt,
    });

    const updated = repository.updateContent({
      id: "mutable-item",
      content: "Updated content",
      timestamp: contentUpdatedAt,
    });
    assert.equal(updated.content, "Updated content");
    assert.equal(updated.createdAt.toISOString(), createdAt.toISOString());
    assert.equal(updated.updatedAt.toISOString(), contentUpdatedAt.toISOString());

    const moved = repository.moveToLayer({
      id: "mutable-item",
      layer: "active_memory",
      timestamp: movedAt,
    });
    assert.equal(moved.layer, "active_memory");
    assert.equal(moved.createdAt.toISOString(), createdAt.toISOString());
    assert.equal(moved.updatedAt.toISOString(), movedAt.toISOString());
    assert.deepEqual(repository.countByLayer(), {
      working_set: 0,
      active_memory: 1,
      consolidated_memory: 0,
      indexed_archive: 0,
      expired: 0,
    });
    store.close();

    const reopenedStore = await openMemoryStore(projectRoot);
    const reopenedRepository = new MemoryRepository(reopenedStore);
    assert.equal(reopenedRepository.getById("mutable-item").content, "Updated content");
    assert.equal(reopenedRepository.getById("mutable-item").layer, "active_memory");
    reopenedStore.close();
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

test("returns undefined when updating or moving an unknown item", async () => {
  const projectRoot = await createInitializedProject();

  try {
    const store = await openMemoryStore(projectRoot);
    const repository = new MemoryRepository(store);
    const timestamp = new Date("2026-09-15T12:00:00.000Z");

    assert.equal(
      repository.updateContent({ id: "missing", content: "Unknown", timestamp }),
      undefined,
    );
    assert.equal(
      repository.moveToLayer({ id: "missing", layer: "expired", timestamp }),
      undefined,
    );
    assert.deepEqual(repository.list(), []);
    store.close();
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

test("deletes a knowledge item and persists the removal after reopen", async () => {
  const projectRoot = await createInitializedProject();

  try {
    const store = await openMemoryStore(projectRoot);
    const repository = new MemoryRepository(store);
    repository.create({
      id: "deletable-item",
      layer: "working_set",
      content: "Remove this item",
      timestamp: new Date("2026-09-15T12:00:00.000Z"),
    });

    const deleted = repository.deleteById("deletable-item");
    assert.equal(deleted.id, "deletable-item");
    assert.equal(repository.getById("deletable-item"), undefined);
    assert.equal(repository.deleteById("deletable-item"), undefined);
    store.close();

    const reopenedStore = await openMemoryStore(projectRoot);
    assert.equal(new MemoryRepository(reopenedStore).list().length, 0);
    reopenedStore.close();
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

test("searches content and respects an optional layer filter", async () => {
  const projectRoot = await createInitializedProject();

  try {
    const store = await openMemoryStore(projectRoot);
    const repository = new MemoryRepository(store);
    repository.create({ id: "search-working", layer: "working_set", content: "Current deployment context" });
    repository.create({ id: "search-active", layer: "active_memory", content: "Deployment architecture rule" });
    repository.create({ id: "other", layer: "active_memory", content: "Database migration" });

    assert.deepEqual(repository.search("deployment").map((item) => item.id), ["search-working", "search-active"]);
    assert.deepEqual(repository.search("DEPLOYMENT", "active_memory").map((item) => item.id), ["search-active"]);
    assert.deepEqual(repository.search("  ").map((item) => item.id), ["search-working", "search-active", "other"]);
    store.close();
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});
