## 1. Trace parser

- [x] 1.1 [test-first] Add fixture-driven parser regression coverage

  **需求追踪**：[R2, R3] → [U2, U5]
  **执行方式**：[test-first]
  **涉及文件**：
  - `tests/subagent-trace-parser.test.mjs` — parser regression tests
  - `evals/subagent-smoke/fixtures/*.jsonl` — deterministic trace samples
  - `scripts/lib/subagent-trace-parser.mjs` — parser implementation

  **验收标准**：
  - [x] success-with-retry fixture is classified as pass with retry warning
  - [x] no-spawn fixture is classified as fail
  - [x] no-wait-completed fixture is classified as fail
  - [x] malformed final JSON fixture is classified as fail
  - [x] non-JSON trace lines are tolerated and reported as warnings

  **验证命令 / 方法**：
  - `node --test tests/subagent-trace-parser.test.mjs`，预期：parser fixture tests pass

  **依赖**：无

- [x] 1.2 [test-first] Implement trace evidence classification

  **需求追踪**：[R2, R3] → [U2]
  **执行方式**：[test-first]
  **涉及文件**：
  - `scripts/lib/subagent-trace-parser.mjs` — parser implementation
  - `tests/subagent-trace-parser.test.mjs` — regression tests

  **验收标准**：
  - [x] Parser detects successful `spawn_agent` events with receiver thread ids
  - [x] Parser detects `wait` events with completed subagent state
  - [x] Parser detects `close_agent` completion when present
  - [x] Parser extracts the final structured JSON result from the final agent message
  - [x] Parser produces `pass`, `fail`, or `inconclusive` plus warning and reason lists from trace evidence

  **验证命令 / 方法**：
  - `node --test tests/subagent-trace-parser.test.mjs`，预期：parser fixture tests pass

  **依赖**：Task 1.1

## 2. Eval runner

- [x] 2.1 [test-first] Add runner command and state guard coverage

  **需求追踪**：[R1, R4, R5] → [U3, U4]
  **执行方式**：[test-first]
  **涉及文件**：
  - `tests/subagent-trace-parser.test.mjs` — runner helper coverage
  - `scripts/eval-subagent-smoke.mjs` — runner implementation

  **验收标准**：
  - [x] Runner command includes `codex exec`, `--json`, `--ephemeral`, `--sandbox read-only`, `-m <model>`, and `-C <repo>`
  - [x] Runner command does not include `--ask-for-approval` or `-a`
  - [x] Runner blocks pass when before/after `git status --short` values differ
  - [x] Runner default model is `gpt-5.3-codex`

  **验证命令 / 方法**：
  - `node --test tests/subagent-trace-parser.test.mjs`，预期：runner helper assertions pass

  **依赖**：Task 1.2

- [x] 2.2 [test-first] Implement the optional subagent smoke runner

  **需求追踪**：[R1, R2, R4, R5] → [U3, U4]
  **执行方式**：[test-first]
  **涉及文件**：
  - `scripts/eval-subagent-smoke.mjs` — runner implementation
  - `scripts/lib/subagent-trace-parser.mjs` — parser integration
  - `tests/subagent-trace-parser.test.mjs` — regression tests

  **验收标准**：
  - [x] Runner saves Codex JSONL trace output under `.tmp/opsx-evals/`
  - [x] Runner reports trace path, classification, warnings, and reasons
  - [x] Runner exits non-zero for fail results
  - [x] Runner exits zero for pass and pass-with-warning results
  - [x] Runner checks repository status before and after the eval run

  **验证命令 / 方法**：
  - `node --test tests/subagent-trace-parser.test.mjs`，预期：runner integration helpers pass

  **依赖**：Task 2.1

## 3. Eval assets and scripts

- [x] 3.1 [direct] Wire eval assets, package script, and temporary output ignore

  **需求追踪**：[R1, R4] → [U1, U4]
  **执行方式**：[direct]
  **涉及文件**：
  - `evals/subagent-smoke/prompt.md` — smoke eval prompt
  - `evals/subagent-smoke/output.schema.json` — final JSON schema
  - `package.json` — `eval:subagent` script
  - `.gitignore` — `.tmp/` ignore rule

  **验收标准**：
  - [x] `npm test` does not invoke `codex exec`
  - [x] `npm run eval:subagent -- --help` prints runner usage without invoking a model
  - [x] `eval:subagent` defaults to `gpt-5.3-codex`
  - [x] temporary eval output path is ignored by git

  **验证命令 / 方法**：
  - `npm test`，预期：all deterministic tests pass without model invocation
  - `npm run eval:subagent -- --help`，预期：usage output and exit 0

  **依赖**：Task 2.2

- [x] 3.2 [direct] Run the real subagent smoke eval

  **需求追踪**：[R1, R2, R4, R5] → [U1, U3, U4]
  **执行方式**：[direct]
  **涉及文件**：
  - `scripts/eval-subagent-smoke.mjs` — manual eval runner
  - `.tmp/opsx-evals/` — ignored runtime trace output

  **验收标准**：
  - [x] [manual] Running `npm run eval:subagent -- --model gpt-5.3-codex` reports pass or pass-with-warning from trace evidence
  - [x] [manual] The run reports a trace file path under `.tmp/opsx-evals/`
  - [x] [manual] The run does not leave tracked working-tree changes beyond implementation files

  **验证命令 / 方法**：
  - `npm run eval:subagent -- --model gpt-5.3-codex`，预期：PASS or PASS_WITH_WARNINGS with trace evidence

  **依赖**：Task 3.1
