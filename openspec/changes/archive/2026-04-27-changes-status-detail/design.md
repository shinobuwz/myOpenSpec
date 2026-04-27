# Design: Detailed `opsx changes status`

## Context

`runtime/bin/changes.sh` currently maps `list|status` to the same `list_changes` function. That makes `status` a semantic duplicate and hides useful workflow information that already exists in `.openspec.yaml`, `tasks.md`, and report files.

This change keeps the thin CLI boundary: the helper remains a read-only filesystem diagnostic. It does not execute OPSX workflow skills or mutate gates.

## Requirements Trace

- [R1] -> [U1]
- [R2] -> [U1]
- [R3] -> [U1]

## Implementation Units

### [U1] Detailed status rendering in the change helper

关联需求：R1, R2, R3

模块边界：

- `runtime/bin/changes.sh` — split `status` from `list`, add read-only diagnostic rendering helpers.
- `tests/changes-helper.test.mjs` — cover the new `status` output and ensure `list` stays compact.

设计：

- Keep `list_changes` unchanged for compact listing.
- Add `status_changes`, which prints:
  - `Project: <PROJECT_ROOT>`
  - per active change: `Change`, `Stage`, `Tasks`
  - `Gates`: `plan-review`, `task-analyze`, `verify`, `review`
  - `Reports`: `audit-log.md`, `test-report.md`, `review-report.md`
  - `Next`: inferred OPSX skill
- Reuse `change_stage_summary` where useful, but add a raw task-progress helper so status can print stable `done/total` values.
- Read gates with simple awk logic matching the current `.openspec.yaml` structure. This is sufficient because the helper itself writes and consumes the same simple metadata format.
- For grouped changes, print group metadata first and then render each subchange under `subchanges/`.

## Next-Step Inference

The helper uses a conservative ordered decision:

1. Missing `proposal.md` -> `opsx-slice`
2. Missing `design.md` or no specs -> `opsx-plan`
3. Missing `gates.plan-review` -> `opsx-plan-review`
4. Missing `tasks.md` -> `opsx-tasks`
5. Missing `gates.task-analyze` -> `opsx-task-analyze`
6. Missing `gates.verify` -> `opsx-verify`
7. Missing `gates.review` -> `opsx-review`
8. Otherwise -> `opsx-archive`

## Risks / Trade-offs

- Gate parsing is intentionally simple. It handles the current `.openspec.yaml` format but is not a general YAML parser.
- `status` provides guidance, not enforcement. Workflow skills remain responsible for hard gates.
