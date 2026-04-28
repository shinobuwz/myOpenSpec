# Goal

Add an optional model-backed subagent smoke eval that verifies Codex can actually spawn, wait for, and close a subagent in the local runtime, while keeping normal `npm test` deterministic and model-free.

# In Scope

- Add a manual eval entrypoint such as `npm run eval:subagent` that defaults to `gpt-5.3-codex`.
- Add an eval prompt and output schema for the subagent smoke scenario.
- Add a runner that invokes `codex exec --json --ephemeral --sandbox read-only` and saves JSONL trace output under a temporary eval output path.
- Add a trace parser that classifies:
  - successful `spawn_agent` with receiver thread ids
  - `wait` returning a completed subagent result
  - `close_agent` completion when available
  - retry warnings when an initial spawn fails but a later spawn succeeds
  - final structured JSON pass / fail / inconclusive result
- Add deterministic parser fixtures and tests that run under normal `npm test` without invoking a model.
- Check that the working tree is unchanged before and after the eval run.

# Out of Scope

- Running model-backed evals as part of default `npm test`.
- Adding a broad benchmark suite across many tasks or models.
- Judging subagent answer quality beyond the smoke contract.
- Testing Claude Code `Task` behavior in this subchange.
- Changing OPSX workflow gate order or existing skill dispatch rules.
- Implementing multi-worker scheduling or parallel worker policy.

# Depends On

- `01-subagent-contract` for shared subagent terminology and controller boundaries.
- The local Codex CLI must support `codex exec --json --ephemeral --sandbox read-only`.

# Done Means

- `npm test` includes deterministic tests for the trace parser and fixtures.
- `npm run eval:subagent` runs the real Codex smoke eval using `gpt-5.3-codex` by default.
- The eval reports `PASS`, `WARN`, `FAIL`, or `INCONCLUSIVE` from trace evidence rather than only trusting final natural-language output.
- The runner preserves normal repository state and fails or warns if the working tree changes.
- Documentation or command help makes clear that model-backed evals are optional and not part of default CI.
