# TASK-014 Manual Knowledge Item Restore

Status: Completed

## Goal

Allow a Human to restore one Expired Knowledge Item to Working Set.

## Scope

- Add a dedicated desktop command for single-item restoration.
- Require explicit confirmation in the renderer.
- Validate existence and the current `expired` layer in the main process.
- Fix the destination layer to `working_set` and generate the update timestamp there.
- Refresh counts and the visible list after the move.

## Out of Scope

- Automatic recovery, batch restoration or restore history.
- Restoring directly to Active or another layer.
- Agent-generated lifecycle changes.

## Validation

- Empty, non-text and unknown IDs are rejected.
- Non-Expired items cannot be restored.
- Cancelled confirmation performs no mutation.
- A confirmed restore preserves ID, content and creation time.
- Counts, filters and persistence reflect the Working Set destination.
- All workspace typechecks, builds and tests pass.

## Implementation

- Added a dedicated preload and IPC command for restoring Expired items.
- Kept source-layer validation, fixed Working Set destination and timestamp
  generation inside the Electron main process.
- Added a confirmation-gated Restore action with count and list refresh.
- Verified typechecks, production build and the existing Memory test suite.
