# Architecture

Desktop: Electron + React + TypeScript

Core: Node.js + SQLite

The Electron main process owns local filesystem access and project selection. The
renderer receives typed project state through a narrow preload API. Project
initialization creates versioned metadata only; Memory Engine storage remains a
separate Phase 2 concern.

The application contains:

- Memory Engine
- Context Engine
- Project Analyzer
- Git Integration
- Agent Adapter
- Health Monitor
