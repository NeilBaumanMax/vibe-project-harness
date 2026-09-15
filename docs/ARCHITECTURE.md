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
The desktop project session owns a single shared Memory Store connection and closes
it when the active project changes or the application quits.
Knowledge Item reads cross IPC as renderer-safe data transfer objects with ISO
timestamp strings; database and repository objects remain in the main process.
The first desktop mutation command accepts Working Set text only. The main process
validates and trims the content, generates its UUID and timestamp, and fixes the
destination layer before writing through the Memory repository.
Manual promotion follows the same boundary: the renderer sends an item ID, while
the main process verifies that the current layer is Working Set and moves it only
to Active Memory with a main-process timestamp.

The application contains:

- Memory Engine
- Context Engine
- Project Analyzer
- Git Integration
- Agent Adapter
- Health Monitor
