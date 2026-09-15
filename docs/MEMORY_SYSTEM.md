# Vibe Memory System

## Working Set
Current task working memory.

## Active Memory
Frequently used architectural and project rules.

## Consolidated Memory
Compressed semantic knowledge.

## Indexed Archive
Historical information available on demand.

## Expired / Garbage
Knowledge candidates for removal.

## Runtime Foundation

The five layer identifiers are defined by the Memory package. Its generated SQLite
database is local runtime state under `.vibe/runtime`; promotion, consolidation,
indexing and expiration behavior are not yet implemented.

Knowledge items can currently be created, read and listed by layer. Callers provide
IDs and may provide timestamps, keeping ingestion deterministic and separate from
future lifecycle policy.

Mission Control reports runtime readiness, schema version and aggregate item
counts. A Human can manually capture text into the Working Set; the desktop main
process owns validation, identity, timestamp and the fixed destination layer.

The repository supports explicit content updates and caller-directed layer moves.
These operations require caller-supplied timestamps and do not apply automatic
lifecycle policy.

The desktop Memory Core can list stored items and filter them across all five
layers. Reads and manual Working Set capture are mediated by typed IPC. Editing,
moving and deleting items remain unavailable in the UI.
