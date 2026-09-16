# Vibe Project Harness

A local-first AI engineering control core for long-lived Vibecoding projects.

## Vision

Human defines goals. Planning AI creates Blueprint. Harness maintains project memory and engineering state. Development Agent performs implementation.

## MVP

- Blueprint import
- .vibe project memory initialization
- Harness Agent integration
- Five-layer memory model
- Project health dashboard
- Dev Agent handoff generation
- Git-aware workflow

## Development

This repository is itself intended to be developed using Vibe Project Harness.

### Desktop shell

Requirements: Node.js 24 and npm.

```bash
npm install
npm run dev
```

The desktop shell inspects the current working directory by default. Set
`VIBE_PROJECT_PATH` before starting the app to inspect another local project.
Mission Control can also open another local directory during the session. When a
project has no `.vibe` directory, initialization creates only
`.vibe/manifest.json`; it does not initialize the Memory Engine.
For initialized projects, Mission Control opens the local memory runtime and reports
its schema version and current knowledge-item total.
The Memory Core panel lists and filters all five memory layers. Human operators can
manually capture text into the active project's Working Set; item identity,
timestamp and destination layer are controlled by the main process.
Working Set items can be explicitly promoted to Active Memory from their item card.
The main process validates the source layer and fixes the destination.
Human operators can also edit item content in place; the main process preserves
identity, layer and creation time while generating the new update timestamp.
Items can be deleted individually after an explicit confirmation.
Memory Core also supports case-insensitive text search within the selected layer
view.

Validation commands:

```bash
npm run typecheck
npm run build
npm test
```
