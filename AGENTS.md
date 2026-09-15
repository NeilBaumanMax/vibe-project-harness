# Vibe Project Harness Development Instructions

You are the Development Agent maintaining this repository.

## Core Rule

Build the Harness itself. Do not confuse Harness Agent with Development Agent.

Harness Agent maintains project knowledge. Development Agent writes product code.

## Workflow

Task Context -> Implementation -> Verification -> Reconcile -> Commit -> Push -> Consolidation

## First Task

Read tasks/TASK-001-bootstrap.md and implement the initial desktop shell.

## Engineering Principles

- Local first
- GitHub for version control only
- Knowledge is layered
- Avoid monolithic files
- Prefer deterministic tooling over AI guesses
