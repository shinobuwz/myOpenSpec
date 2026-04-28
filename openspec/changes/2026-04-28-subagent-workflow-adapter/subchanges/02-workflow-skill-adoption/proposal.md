# Goal

Migrate existing OPSX workflow skills to consume the central subagent contract instead of each skill carrying independent or Claude-biased subagent instructions.

# In Scope

- Update `opsx-implement` to reference the central contract for implementer dispatch.
- Update `opsx-plan-review`, `opsx-task-analyze`, and `opsx-verify` to reference the central contract for reviewer dispatch while preserving StageResult output.
- Update `opsx-review` to reference the central code-quality/release-risk reviewer role without reintroducing full spec compliance into review.
- Update `opsx-explore` to reference the central explorer dispatch rule.
- Update `opsx-archive` post-archive knowledge/codemap subagent wording.
- Keep existing gate order and audit/report output locations unchanged.
- Add tests that touched skills reference the central contract and preserve verify/review responsibility split.

# Out of Scope

- Changing the number of reviewers per gate.
- Making implementation tasks parallel.
- Changing StageResult schema.
- Changing `.openspec.yaml` gate names or semantics.
- Rewriting existing proposals/designs/tasks in archived changes.

# Depends On

- `01-subagent-contract` must define the central dispatch and role boundary rules first.

# Done Means

- Existing subagent wording in workflow skills is normalized through the central contract.
- No workflow skill contains only Claude Code `Task` / `subagent_type` semantics without Codex default wording.
- `opsx-verify` remains the owner of spec compliance.
- `opsx-review` remains focused on code quality and release risk, using `VERIFY_DRIFT` for obvious compliance drift.
- Tests pass and lock the migration boundaries.
