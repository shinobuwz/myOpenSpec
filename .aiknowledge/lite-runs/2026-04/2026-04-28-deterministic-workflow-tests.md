---
id: 2026-04-28-deterministic-workflow-tests
created_at: 2026-04-28T06:38:57Z
kind: lite
status: done
source_refs:
  - test:tests/changes-helper.test.mjs
  - test:tests/workflow-discipline.test.mjs
---

# deterministic-workflow-tests

## Intent

Add no-model deterministic tests for OPSX workflow contracts so routine test runs can catch state routing, artifact schema, and gate-prerequisite drift before any agent eval layer is introduced.

## Scope

- `tests/changes-helper.test.mjs`
- `tests/workflow-discipline.test.mjs`

## Changes

- Added a real `opsx changes status` next-step matrix that walks a synthetic change from empty state through proposal, plan, review gates, verify, review, and archive.
- Added artifact template contract checks for proposal, design, spec, and tasks templates.
- Added workflow skill gate-prerequisite checks for `opsx-tasks`, `opsx-implement`, `opsx-archive`, and read-only explore routing constraints.

## Verification

- `npm test` passed: 30 tests, 30 pass, 0 fail.

## Risks

- These tests verify deterministic contracts and CLI routing only. They do not evaluate model-generated output quality or real agent trace quality.

## Knowledge

No new long-term pitfall or codemap update was needed.
