# Data Model

Entities:

- Project
- Module
- File
- Knowledge Item
- Memory Layer
- Task
- Evidence
- Decision
- Health Metric

## Current Implementation

The runtime schema currently contains:

- `harness_metadata`: internal schema version metadata.
- `knowledge_items`: caller-supplied ID, memory layer, content, creation time and
  last-update time.

Other domain entity tables remain undefined until their behavior and lifecycle
requirements are specified.
