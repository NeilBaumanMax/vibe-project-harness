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

Validation commands:

```bash
npm run typecheck
npm run build
npm test
```
