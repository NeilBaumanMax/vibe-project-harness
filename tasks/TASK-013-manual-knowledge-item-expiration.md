# TASK-013 Manual Knowledge Item Expiration

Status: Completed

## Goal

Allow a Human to explicitly mark one Knowledge Item as Expired.

## Scope

- Add a dedicated desktop command for single-item expiration.
- Require explicit confirmation in the renderer.
- Validate existence and current layer in the Electron main process.
- Fix the destination layer to `expired` and generate the update timestamp there.
- Refresh counts and the visible list after the move.

## Out of Scope

- Automatic expiration policy, age thresholds or scheduled cleanup.
- Batch expiration, recovery or deletion.
- Agent-generated lifecycle changes.

## Validation

- Empty, non-text and unknown IDs are rejected.
- Already expired items cannot be expired again.
- Cancelled confirmation performs no mutation.
- A confirmed expiration preserves ID, content and creation time.
- Counts, filters and persistence reflect the expired layer.
- All workspace typechecks, builds and tests pass.

## Implementation

- Added a dedicated preload and IPC command for single-item expiration.
- Kept ID validation, duplicate-expiration checks, destination layer and timestamp
  generation inside the Electron main process.
- Added a confirmation-gated Expire action with count and list refresh.
- Verified layer behavior through the Memory suite and workspace typechecks/builds.
