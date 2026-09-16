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
Working Set items can be promoted to Active Memory only through an explicit Human
action. The main process validates the current layer and owns the update timestamp.
Humans can edit Knowledge Item content in place. Edits preserve the item identity,
layer and creation time while updating the last-update timestamp in the main
process.
Humans can permanently delete one item after an explicit confirmation. Automatic
cleanup and expiration policy are not part of this operation.

The repository supports explicit content updates and caller-directed layer moves.
These operations require caller-supplied timestamps and do not apply automatic
lifecycle policy.

The desktop Memory Core can list stored items and filter them across all five
layers. Reads and manual Working Set capture are mediated by typed IPC. Editing,
manual content edits, and promotion are mediated by typed IPC. Arbitrary layer
moves are unavailable in the UI; deletion requires explicit confirmation and is
mediated by typed IPC.
The Memory Core supports deterministic case-insensitive search over item content,
combined with the existing layer filter. Semantic retrieval and indexing remain
unimplemented.
Humans can mark one item as Expired after confirmation. This is an explicit move;
automatic expiration policy and recovery are not implemented.
An Expired item can be restored to Working Set after confirmation. Restoration is
explicit and single-item; no automatic recovery policy exists.
