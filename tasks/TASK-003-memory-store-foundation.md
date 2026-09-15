# TASK-003 Memory Store Foundation

Status: Completed

## Goal

Establish the local SQLite and Drizzle foundation for the Phase 2 Memory Engine
without defining knowledge-item behavior prematurely.

## Scope

- Use the existing `packages/memory` boundary.
- Use Node's built-in SQLite driver with Drizzle ORM.
- Store generated runtime state at `.vibe/runtime/memory.sqlite3`.
- Create an internal schema-version metadata table.
- Define the five Blueprint memory-layer identifiers as a shared type.
- Refuse to open memory storage for a project without a `.vibe` directory.
- Provide deterministic package tests for creation, reopen and layer validation.

## Out of Scope

- Knowledge Item, Evidence, Decision or Task tables.
- Memory promotion, consolidation, indexing or expiration behavior.
- Embeddings or semantic search.
- Desktop UI integration.
- Harness Agent integration.
- Version-control operations.

## Validation

- TypeScript passes for all workspaces.
- Production builds pass for all workspaces.
- Opening an initialized temporary project creates the runtime database.
- Reopening the database preserves schema version 1.
- Opening an uninitialized project fails without creating `.vibe`.
- The exported layer guard accepts exactly the five Blueprint layers.

## Implementation

- Added the `@vibe-project-harness/memory` workspace package.
- Added a Node SQLite connection wrapped by Drizzle ORM.
- Added an internal schema-version table and runtime database path contract.
- Added deterministic tests for create, reopen, initialization guard and layers.
- Added memory build, typecheck and test commands to the root workflow and CI.
