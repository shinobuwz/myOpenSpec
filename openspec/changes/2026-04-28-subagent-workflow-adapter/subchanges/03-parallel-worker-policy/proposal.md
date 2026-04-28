# Goal

Define and optionally implement a conservative policy for using multiple implementation workers when tasks are provably disjoint, without weakening OPSX gates or corrupting shared workflow artifacts.

# In Scope

- Define when `opsx-implement` may use multiple workers:
  - task clusters are independent
  - write sets do not overlap
  - no shared public interface or migration is being changed concurrently
  - each worker has explicit file ownership
- Define when `opsx-implement` must stay serial:
  - shared `tasks.md` / `test-report.md` updates
  - shared core files or interfaces
  - migrations, schema/config changes, build/package scripts
  - unclear dependency ordering
- Define controller responsibilities for parallel worker integration:
  - main agent updates `tasks.md` and `test-report.md` serially
  - main agent checks `git diff` after each worker result
  - main agent resolves conflicts and runs final verification
- Decide whether this policy is documentation-only for now or changes `opsx-implement` wording to permit disjoint task cluster dispatch.
- Add tests for the serial-by-default and explicit-write-set rules.

# Out of Scope

- Building an automatic task graph scheduler.
- Adding a CLI dispatcher.
- Allowing parallel writes to `tasks.md`, `test-report.md`, `.openspec.yaml`, or `audit-log.md`.
- Allowing subagents to mark gates or archive changes.

# Depends On

- `01-subagent-contract` for shared role and dispatch terminology.
- Preferably `02-workflow-skill-adoption` so `opsx-implement` already references the central contract.

# Done Means

- `opsx-implement` has a clear serial-default policy.
- Any permitted parallelism requires explicit non-overlapping write sets and main-agent integration.
- Tests or documentation checks prevent unbounded “dispatch multiple workers” language.
- Existing verify/review/archive gates remain mandatory after implementation.
