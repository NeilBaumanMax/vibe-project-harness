# TASK-011 Manual Knowledge Item Delete

Status: Completed

## Goal

Allow a Human to permanently delete one Knowledge Item from Mission Control after
an explicit confirmation.

## Scope

- Add a dedicated Memory Repository delete operation and regression test.
- Add a dedicated preload and IPC command for single-item deletion.
- Validate the item ID in the Electron main process.
- Require an explicit browser confirmation before issuing the command.
- Refresh counts and the visible Memory Core list after deletion.

## Out of Scope

- Automatic cleanup or expiration policy.
- Batch deletion, undo, trash or recovery.
- Agent-generated deletion.
- Deleting projects, manifests or runtime directories.

## Validation

- Empty or non-text IDs are rejected without a write.
- Unknown IDs are rejected without a write.
- Cancelled confirmation performs no deletion.
- A confirmed deletion removes exactly one item.
- Counts and the visible list refresh after deletion.
- The removal persists after the store is reopened.
- All workspace typechecks, builds and tests pass.

## Implementation

- Added `deleteById` to the Memory Repository with persistence coverage.
- Added a dedicated preload and IPC command with main-process ID validation.
- Added a per-item Delete action that requires explicit confirmation and refreshes
  counts and the visible list.
- Verified cancelled confirmation, invalid and unknown IDs, confirmed deletion and
  persistence with a production Electron build.
