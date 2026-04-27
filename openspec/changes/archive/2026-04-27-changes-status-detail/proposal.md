# Proposal: Detailed `opsx changes status`

## Goal

Make `opsx changes status` useful as a workflow diagnostic view instead of duplicating `opsx changes list`.

## In Scope

- Keep `opsx changes list` as the compact active-change listing.
- Change `opsx changes status` to print project-level diagnostic information.
- Include active change stage, task progress, gate timestamps, report-file presence, and next-step guidance.
- Support both single changes and grouped changes using existing metadata files.
- Add automated tests for the new status behavior.

## Out of Scope

- No new top-level `opsx status` command.
- No AI workflow execution from the CLI.
- No mutation of gates, reports, tasks, or change metadata.
- No YAML parser dependency; status may use the existing simple metadata format assumptions.

## Depends On

- Existing thin npm launcher and `runtime/bin/changes.sh`.
- Existing `.openspec.yaml` gates convention.

## Done Means

- `opsx changes list` and `opsx changes status` produce intentionally different outputs.
- `status` can identify the most likely next OPSX skill for a change.
- Tests cover gate/report/task-based status output.
