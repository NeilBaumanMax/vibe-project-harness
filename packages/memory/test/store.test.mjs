import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { isMemoryLayer, MEMORY_LAYERS, openMemoryStore } from "../dist/index.js";

test("opens a project-local runtime database and preserves its schema version", async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), "vibe-memory-store-"));

  try {
    await mkdir(join(projectRoot, ".vibe"));

    const firstStore = await openMemoryStore(projectRoot);
    assert.equal(firstStore.status.schemaVersion, 2);
    assert.deepEqual(firstStore.status.layers, MEMORY_LAYERS);
    await access(join(projectRoot, ".vibe", "runtime", "memory.sqlite3"));
    firstStore.close();

    const reopenedStore = await openMemoryStore(projectRoot);
    assert.equal(reopenedStore.status.schemaVersion, 2);
    reopenedStore.close();
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

test("refuses to open storage before project initialization", async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), "vibe-memory-store-"));

  try {
    await assert.rejects(openMemoryStore(projectRoot), /\.vibe is missing/);
    await assert.rejects(access(join(projectRoot, ".vibe")));
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

test("recognizes only the five blueprint memory layers", () => {
  assert.equal(MEMORY_LAYERS.length, 5);
  assert.equal(isMemoryLayer("working_set"), true);
  assert.equal(isMemoryLayer("expired"), true);
  assert.equal(isMemoryLayer("unknown"), false);
});
