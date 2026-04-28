# Context

OPSX currently has deterministic workflow tests under `npm test`, but model-backed behavior is only manually inspected. The subagent smoke path was proven viable with a real `codex exec --json` run: the JSONL trace exposed `spawn_agent`, `wait`, `close_agent`, a retry warning, and a final structured JSON message.

This change adds an optional eval layer that is deliberately separate from default tests. The goal is to verify runtime subagent availability and controller behavior without making normal CI depend on model calls.

# Goals / Non-Goals

**Goals:**
- Provide a manual `npm run eval:subagent` smoke command.
- Keep `npm test` deterministic and model-free.
- Judge smoke eval results from JSONL trace evidence.
- Preserve repository state by running Codex in read-only sandbox and checking `git status`.

**Non-Goals:**
- Benchmark multiple models or prompts.
- Judge semantic quality beyond the smoke contract.
- Test Claude Code `Task` behavior.
- Change OPSX gate order, skill dispatch rules, or parallel worker policy.

# Requirements Trace

- [R1] -> [U1], [U4]
- [R2] -> [U2], [U3]
- [R3] -> [U2], [U5]
- [R4] -> [U3], [U4]
- [R5] -> [U3]

# Implementation Units

### [U1] Eval assets
- 关联需求: [R1]
- 模块边界:
  - `evals/subagent-smoke/prompt.md` — model eval prompt
  - `evals/subagent-smoke/output.schema.json` — final response schema
- 验证方式: `npm test` validates fixtures and parser behavior; manual eval consumes the assets.
- 知识沉淀: Model eval prompt and schema should remain narrow and smoke-oriented.

### [U2] Trace parser
- 关联需求: [R2], [R3]
- 模块边界:
  - `scripts/lib/subagent-trace-parser.mjs` — parse Codex JSONL trace events into pass/warn/fail facts
- 验证方式: fixture-driven `node --test` coverage for pass, fail, retry warning, malformed final JSON, and non-JSON line handling.
- 知识沉淀: Trace evidence is the authority; final model JSON is only one signal.

### [U3] Eval runner
- 关联需求: [R2], [R4], [R5]
- 模块边界:
  - `scripts/eval-subagent-smoke.mjs` — invoke `codex exec`, save JSONL, call parser, check git state
- 验证方式: parser unit tests cover classification logic; manual `npm run eval:subagent` validates runtime integration.
- 知识沉淀: Current local Codex CLI accepts `--json`, `--ephemeral`, `--sandbox read-only`, `-m`, and `-C`; do not include approval flags by default.

### [U4] Package and temporary output wiring
- 关联需求: [R1], [R4]
- 模块边界:
  - `package.json` — add `eval:subagent` script
  - `.gitignore` — ignore temporary eval output path
- 验证方式: `npm test` remains model-free; `git status --short` stays clean after manual eval except for intentional source changes during implementation.
- 知识沉淀: Model-backed eval is a manual command, not default CI.

### [U5] Deterministic parser tests and fixtures
- 关联需求: [R3]
- 模块边界:
  - `tests/subagent-trace-parser.test.mjs` — parser unit tests
  - `evals/subagent-smoke/fixtures/*.jsonl` — deterministic trace samples
- 验证方式: `npm test`.
- 知识沉淀: Fixtures should represent observed Codex event shapes and failure modes.

# Decisions

1. Use a source-level eval runner instead of default test integration.
   - Rationale: Model calls are non-deterministic, cost-bearing, and depend on local auth/runtime. They should not block normal unit tests.

2. Treat JSONL trace as primary evidence.
   - Rationale: Final model text can claim a subagent was used even when no tool call happened. The parser must inspect `collab_tool_call` events and receiver thread state.

3. Classify retry success as pass with warning.
   - Rationale: The observed runtime produced an initial fork-configuration error and then a successful non-forked spawn. That indicates the smoke goal succeeded, but the retry should remain visible.

4. Store eval output under `.tmp/opsx-evals/`.
   - Rationale: Trace logs are diagnostic artifacts, not source. They may contain local paths and should not be committed.

# Risks / Trade-offs

- [Risk] Codex JSONL event shape may change. -> Mitigation: parser tests use focused fixtures and fail clearly when expected fields disappear.
- [Risk] `codex exec` availability depends on local installation and auth. -> Mitigation: eval command is optional and reports command failures as eval failures.
- [Risk] Read-only sandbox may still emit non-JSON log lines. -> Mitigation: parser tolerates non-JSON lines as warnings while preserving classification.
- [Risk] Published npm package may not include dev-only eval assets. -> Mitigation: scope this as repository-level eval tooling, not runtime package behavior.

# Migration Plan

No migration is required. Existing `npm test` behavior remains unchanged except for additional deterministic parser tests.

# Knowledge Capture

If this change reveals stable Codex JSONL event-shape assumptions, capture them as a pitfall or codemap update during archive.

# Open Questions

- Whether future changes should add a Claude Code `Task` smoke eval in a separate subchange.
- Whether model eval output should later be summarized into an HTML report.
