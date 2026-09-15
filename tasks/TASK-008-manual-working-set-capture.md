# TASK-008 Manual Working Set Capture

Status: Completed

## Goal

Allow a Human to capture a Knowledge Item into the active project's Working Set
from Mission Control.

## Scope

- Add a dedicated IPC command for Working Set capture.
- Accept only text from the renderer.
- Validate and trim content in the Electron main process.
- Generate the item ID and timestamp in the main process.
- Fix the target layer to `working_set`.
- Return renderer-safe item and refreshed project snapshots.
- Refresh counts and the visible Memory Core list after capture.
- Disable empty submissions and show save progress and results.

## Out of Scope

- Choosing the destination layer during capture.
- Editing, moving or deleting items in the UI.
- Automatic Agent writes.
- Attachments, tags, summaries and relationships.
- Lifecycle automation.

## Validation

- Empty or non-text IPC input is rejected without a write.
- A valid submission creates exactly one Working Set item.
- IDs and timestamps are generated outside the renderer.
- Mission Control refreshes the total and Working Set counts.
- The new item appears without restarting the application.
- The item persists after the store is reopened.
- All workspace typechecks, builds and tests pass.

## Implementation

- Added a dedicated preload and IPC command for Human Working Set capture.
- Kept input validation, trimming, UUID generation, timestamps and the fixed layer
  inside the Electron main process.
- Added a focused capture form that refreshes project counts and the visible item
  list after a successful write.
- Verified rejection boundaries, single-item creation, renderer refresh and
  persistence after reopening the SQLite store with a production Electron build.
