# TASK-006 Explicit Memory Mutations

Status: Completed

## Goal

Add deterministic, caller-directed Knowledge Item mutations without defining an
automatic memory lifecycle policy.

## Scope

- Update the content of an existing Knowledge Item.
- Move an existing item to any valid memory layer.
- Require caller-provided timestamps for both mutations.
- Preserve the original creation timestamp.
- Return `undefined` when the target item does not exist.
- Update layer counts immediately after a move.
- Verify that mutations persist after closing and reopening the store.

## Out of Scope

- Automatic promotion, consolidation, indexing or expiration.
- Restrictions on allowed source-to-target layer transitions.
- Deleting Knowledge Items.
- Mutation history and audit records.
- Desktop UI and IPC mutation APIs.
- Agent-generated mutations.

## Validation

- Content updates preserve ID, layer and creation time.
- Layer moves preserve ID, content and creation time.
- Both mutations apply the supplied update timestamp.
- Invalid target layers are rejected without changes.
- Unknown IDs return `undefined` without creating records.
- Mutations survive store reopen.
- All workspace typechecks, builds and tests pass.

## Implementation

- Added deterministic content updates with caller-provided timestamps.
- Added caller-directed moves across the five valid memory layers.
- Preserved item identity and creation timestamps across mutations.
- Added persistence, count, invalid-layer and missing-item regression tests.
