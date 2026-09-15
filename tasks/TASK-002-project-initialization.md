# TASK-002 Project Initialization

Status: Completed

## Goal

Allow the desktop shell to open a local project and initialize the minimum `.vibe`
project metadata required by later phases.

## Scope

- Select a local project directory through the Electron main process.
- Reuse the TASK-001 project inspector after a project is selected.
- Offer initialization only when the selected project has no `.vibe` directory.
- Require an explicit Human action before writing project files.
- Create a versioned `.vibe/manifest.json` with the minimum project identity and
  schema version.
- Refresh Mission Control after selection or initialization.
- Keep filesystem access behind the preload API.

## Proposed Manifest

```json
{
  "schemaVersion": 1,
  "project": {
    "name": "example-project"
  }
}
```

The manifest must not store machine-specific absolute paths. Memory-layer storage,
SQLite state and runtime data remain outside this task.

## Safety Rules

- Never overwrite an existing `.vibe` directory or manifest.
- Validate that the selected path is an existing directory.
- Write the manifest atomically and report filesystem errors to the renderer.
- Do not modify the selected project's Git configuration.

## Out of Scope

- Memory Engine implementation or memory-layer directories.
- SQLite and Drizzle ORM.
- Blueprint compilation or import.
- Harness Agent integration.
- Git analysis and project health scoring.
- Automatic commits in the selected project.

## Validation

- A directory can be selected and inspected.
- Cancelling directory selection leaves the current project unchanged.
- Initialization creates only the agreed `.vibe` metadata.
- Existing `.vibe` content is never overwritten.
- Initialization failures are visible in Mission Control.
- TypeScript, production build and Electron render smoke checks pass.

## Implementation Plan

1. Extend the shared desktop API with project selection and initialization results.
2. Add focused main-process services for directory selection and atomic initialization.
3. Register narrow IPC handlers and expose them through preload.
4. Add project selection and initialization controls to Mission Control.
5. Verify cancellation, missing, initialized, existing and failure states.
6. Reconcile documentation, commit and push after validation.

## Implementation

- Native directory selection updates the active project for the current session.
- Initialization writes the proposed manifest through the Electron main process.
- Existing `.vibe` directories and conflicting `.vibe` files are never overwritten.
- Mission Control reports selection, initialization and filesystem failures.
- TypeScript, production build and Electron initialization smoke checks pass.
