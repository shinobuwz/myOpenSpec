---
id: 2026-04-28-acceptance-criteria-checkbox-sync
created_at: 2026-04-28T07:50:03Z
kind: lite
status: done
source_refs:
  - skill:skills/opsx-implement/SKILL.md
  - test:tests/workflow-discipline.test.mjs
  - change:openspec/changes/archive/2026-04-28-subagent-workflow-adapter-04-subagent-smoke-eval/tasks.md
---

# acceptance-criteria-checkbox-sync

## Intent

Fix an archived subchange whose top-level tasks were complete but internal acceptance criteria remained unchecked, and prevent future implement runs from leaving task-level acceptance state stale.

## Scope

- `openspec/changes/archive/2026-04-28-subagent-workflow-adapter-04-subagent-smoke-eval/tasks.md`
- `skills/opsx-implement/SKILL.md`
- `tests/workflow-discipline.test.mjs`

## Root Cause

`opsx-implement` required marking completed top-level tasks from `[ ]` to `[x]`, but did not explicitly require synchronizing the task's internal acceptance criteria checkboxes. `opsx changes status` also counts top-level task checkboxes only, so the archived change could appear complete even when internal acceptance rows were stale.

The implementation evidence already existed in `test-report.md`; the missing part was artifact state synchronization in `tasks.md`.

## Changes

- Marked all completed internal acceptance criteria and manual acceptance rows in the archived `tasks.md`.
- Updated `opsx-implement` so completed tasks must mark supported internal acceptance criteria as `[x]`.
- Kept evidence discipline explicit: unsupported acceptance criteria must not be checked, and unverified `[manual]` rows may remain `[ ]` only when called out.
- Added a deterministic workflow-discipline test to lock this contract.
- Reinstalled OPSX skills globally with `node bin/opsx.mjs install-skills`.

## Verification

- `node --test tests/workflow-discipline.test.mjs` passed: 11 tests, 11 pass, 0 fail.
- `npm test` passed: 38 tests, 38 pass, 0 fail.
- `rg -n "^- \\[ \\].*(验收标准|\\[manual\\])" openspec/changes/archive/2026-04-28-subagent-workflow-adapter-04-subagent-smoke-eval/tasks.md` returned no matches.

## Risks

The fix updates implementation discipline and deterministic tests. Existing archived changes other than the reported subchange were not bulk-rewritten.
