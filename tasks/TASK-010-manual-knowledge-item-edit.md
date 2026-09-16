# TASK-010 Manual Knowledge Item Edit

Status: Completed

## Goal

Allow a Human to edit the content of an existing Knowledge Item from Mission
Control.

## Scope

- Add a dedicated IPC command for content updates.
- Accept only an item ID and text content from the renderer.
- Validate and trim both values in the Electron main process.
- Preserve the item ID, layer and creation timestamp.
- Generate the update timestamp in the main process.
- Return renderer-safe item and refreshed project snapshots.
- Provide focused edit, save and cancel controls on each item.
- Refresh the visible Memory Core list after a successful save.

## Out of Scope

- Layer changes, promotion rules or automatic lifecycle behavior.
- Batch editing, history, versioning or conflict resolution.
- Deleting items or Agent-generated writes.
- Attachments, tags, summaries and relationships.

## Validation

- Empty or non-text IDs and content are rejected without a write.
- Unknown IDs are rejected without a write.
- A valid edit preserves ID, layer and creation time.
- The main process sets the updated timestamp.
- Cancel leaves the stored content unchanged.
- Mission Control renders the updated content after saving.
- The edit persists after the store is reopened.
- All workspace typechecks, builds and tests pass.

## Implementation

- Added a dedicated preload and IPC command for content updates.
- Kept ID/content validation, trimming and update timestamp generation inside the
  Electron main process while preserving identity, layer and creation time.
- Added focused edit, save and cancel controls to each Memory Core item.
- Verified rejection boundaries, save and cancel behavior, timestamp invariants and
  persistence with a production Electron build.
