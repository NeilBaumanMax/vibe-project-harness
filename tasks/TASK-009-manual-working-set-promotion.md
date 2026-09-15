# TASK-009 Manual Working Set Promotion

Status: Completed

## Goal

Allow a Human to explicitly promote a Working Set Knowledge Item into Active
Memory from Mission Control.

## Scope

- Add a dedicated IPC command for Working Set promotion.
- Accept only a Knowledge Item ID from the renderer.
- Validate the ID and current source layer in the Electron main process.
- Fix the destination layer to `active_memory`.
- Generate the update timestamp in the main process.
- Return renderer-safe item and refreshed project snapshots.
- Refresh counts and the visible Memory Core list after promotion.
- Show promotion progress and results in the UI.

## Out of Scope

- Arbitrary source or destination layer selection.
- Automatic promotion rules or scoring.
- Batch promotion.
- Editing, deleting, consolidating, archiving or expiring items in the UI.
- Agent-generated mutations.
- Mutation history and audit records.

## Validation

- Empty or non-text IDs are rejected without a write.
- Unknown items are rejected without a write.
- Items outside Working Set cannot be promoted.
- A valid promotion preserves ID, content and creation time.
- The main process sets the new update time and `active_memory` layer.
- Mission Control refreshes Working Set, Active and total counts.
- The promoted item remains visible under the appropriate filters.
- The promotion persists after the store is reopened.
- All workspace typechecks, builds and tests pass.

## Implementation

- Added a dedicated preload and IPC command for Human-approved promotion.
- Kept ID validation, source-layer validation, the fixed Active destination and
  update timestamp inside the Electron main process.
- Added a Working Set item action with progress feedback and automatic count and
  list refresh.
- Verified invalid input, missing-item and wrong-layer rejection, UI filters,
  timestamp behavior and persistence with a production Electron build.
