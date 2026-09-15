# TASK-005 Desktop Memory Status

Status: Completed

## Goal

Connect the read-only Memory Store status to Mission Control without exposing
knowledge mutation in the desktop UI.

## Scope

- Make the desktop workspace depend on the Memory package.
- Open `.vibe/runtime/memory.sqlite3` only for initialized projects.
- Keep one memory-store connection for the active project session.
- Close the connection when switching projects or quitting.
- Report schema version, total items and per-layer counts through typed IPC state.
- Display memory readiness and item totals in Mission Control.
- Make root build and typecheck ordering deterministic across workspaces.

## Out of Scope

- Creating or editing knowledge items from the UI.
- Layer transitions and lifecycle automation.
- Memory browsing, search or indexing.
- Persisting the selected project between app launches.
- Agent integration.

## Validation

- Missing `.vibe` does not create runtime storage.
- An initialized project opens schema version 2 and creates runtime storage.
- Mission Control renders memory readiness and item count.
- Layer counts include zero-valued layers.
- Project switches and app shutdown close the previous database connection.
- All workspace typechecks, builds and tests pass.

## Implementation

- Added the Memory package as an explicit desktop dependency.
- Added session-owned, concurrency-safe Memory Store connection handling.
- Added per-layer count aggregation with zero-valued layers.
- Extended the typed project snapshot with runtime status and counts.
- Added schema and item telemetry to Mission Control.
- Verified the production Electron build against a temporary initialized project.
