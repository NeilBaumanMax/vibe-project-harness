# TASK-007 Memory Core Read View

Status: Completed

## Goal

Expose a safe, read-only Knowledge Item view in Mission Control.

## Scope

- Add a typed IPC method that lists items from the active project session.
- Convert database dates to ISO strings before crossing the process boundary.
- Keep the renderer isolated from the database and Memory Store objects.
- Display all Knowledge Items in a dedicated Memory Core panel.
- Filter the list across the five defined memory layers.
- Display zero-valued layer counts and an explicit empty state.
- Keep the new UI in a focused component rather than expanding the main app file.

## Out of Scope

- Creating, updating, moving or deleting items from the UI.
- Search, pagination and semantic retrieval.
- Automatic refresh for writes made outside the application.
- Lifecycle policy and Agent integration.

## Validation

- An initialized empty project renders an empty Memory Core state.
- Stored items cross IPC with ISO timestamps and render in the list.
- Layer filters return only matching items.
- Missing or failed memory runtimes do not attempt item reads.
- All workspace typechecks, builds and tests pass.
- A production Electron render smoke check passes with seeded memory data.

## Implementation

- Added a read-only, active-project item-list IPC endpoint.
- Added renderer-safe item snapshots with ISO timestamps.
- Added a focused Memory Core panel with counts, filters and empty states.
- Verified all-layer and Active-layer rendering against seeded SQLite data.
