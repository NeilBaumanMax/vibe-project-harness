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
