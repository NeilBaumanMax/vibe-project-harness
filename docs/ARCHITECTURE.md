# Architecture

Desktop: Electron + React + TypeScript

Core: Node.js + SQLite

The Electron main process owns local filesystem access and project selection. The
renderer receives typed project state through a narrow preload API. Project
initialization creates versioned metadata only; Memory Engine storage remains a
separate Phase 2 concern.

The Memory Engine runtime uses Drizzle ORM with Node's built-in SQLite driver.
Generated database state lives at `.vibe/runtime/memory.sqlite3` and is excluded
from Git; version-controlled project metadata remains outside the runtime directory.

The application contains:

- Memory Engine
- Context Engine
- Project Analyzer
- Git Integration
- Agent Adapter
- Health Monitor
