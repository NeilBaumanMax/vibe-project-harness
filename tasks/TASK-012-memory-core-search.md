# TASK-012 Memory Core Search

Status: Completed

## Goal

Allow a Human to find Knowledge Items by text within the existing Memory Core
layer view.

## Scope

- Add deterministic case-insensitive content search in the Memory Repository.
- Support search with or without the existing layer filter.
- Pass the query through the typed IPC boundary.
- Refresh visible results as the query changes.

## Out of Scope

- Full-text indexes, semantic retrieval, embeddings or remote search.
- Search across files, projects or metadata beyond item content.
- Ranking, pagination or saved searches.

## Validation

- Matching content is returned in stable creation order.
- Search respects an optional layer filter and is case-insensitive.
- Empty search behaves like the existing list operation.
- Renderer query crosses IPC without exposing the database.
- All workspace typechecks, builds and tests pass.

## Implementation

- Added a repository content search with stable ordering and optional layer scope.
- Extended the typed IPC list command to carry the search query.
- Added a focused Memory Core search field that refreshes results as text changes.
- Verified matching, case-insensitivity, empty-query behavior and layer filtering
  with the Memory test suite and workspace typechecks.
