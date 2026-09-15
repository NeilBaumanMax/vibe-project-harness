# TASK-004 Knowledge Item Persistence

Status: Completed

## Goal

Persist the first Memory Engine domain entity without implementing lifecycle or
AI behavior.

## Scope

- Add schema version 2 with a `knowledge_items` table.
- Migrate existing schema version 1 databases transactionally.
- Store an item ID, memory layer, content and created/updated timestamps.
- Enforce the five memory layers in SQLite and at the repository boundary.
- Provide create, get-by-ID and ordered list operations.
- Allow callers to supply IDs and timestamps for deterministic ingestion.

## Out of Scope

- Updating, deleting or moving items between layers.
- Promotion, consolidation, indexing and expiration policies.
- Summaries, embeddings, tags or relationships.
- Desktop UI and IPC integration.
- Agent-generated knowledge.

## Validation

- Fresh databases initialize at schema version 2.
- Existing version 1 databases migrate to version 2 without data loss.
- Knowledge items can be created, retrieved and filtered by layer.
- Invalid layers are rejected without writing records.
- All workspace typechecks, builds and tests pass.

## Implementation

- Added a transactional schema v1-to-v2 migration.
- Added the `knowledge_items` Drizzle schema with a SQLite layer constraint.
- Added deterministic create, get-by-ID and ordered list repository operations.
- Added tests for persistence, layer filtering, invalid input and legacy migration.
