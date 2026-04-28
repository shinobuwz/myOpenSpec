## 1. Workflow discipline rules

- [x] 1.1 [direct] Add root-cause-before-fix gate to `opsx-bugfix`

  **需求追踪**：[R1] → [U1]
  **执行方式**：[direct]
  **涉及文件**：
  - `skills/opsx-bugfix/SKILL.md` — skill instructions

  **验收标准**：
  - [x] `opsx-bugfix` states that fixes are forbidden before root cause is established.
  - [x] `opsx-bugfix` requires a single hypothesis and minimal validation before implementation.
  - [x] `opsx-bugfix` escalates after repeated failed fixes instead of stacking patches.

  **验证命令 / 方法**：
  - `npm test`，预期：`workflow-discipline.test.mjs` 的 bugfix 断言通过。

  **依赖**：无

- [x] 1.2 [direct] Add fresh-evidence completion gate to `opsx-verify` and `opsx-lite`

  **需求追踪**：[R2] → [U2]
  **执行方式**：[direct]
  **涉及文件**：
  - `skills/opsx-verify/SKILL.md` — verification gate instructions
  - `skills/opsx-lite/SKILL.md` — lightweight workflow instructions

  **验收标准**：
  - [x] `opsx-verify` forbids completion claims without current verification evidence.
  - [x] `opsx-lite` records verification commands and refuses unverified completion claims.

  **验证命令 / 方法**：
  - `npm test`，预期：fresh evidence 断言通过。

  **依赖**：无

- [x] 1.3 [direct] Tighten `opsx-tasks` task quality requirements

  **需求追踪**：[R3] → [U3]
  **执行方式**：[direct]
  **涉及文件**：
  - `skills/opsx-tasks/SKILL.md` — task generation rules

  **验收标准**：
  - [x] Tasks must be bite-sized rather than intent-only.
  - [x] Tasks must include `验证命令 / 方法`.
  - [x] Vague acceptance criteria are explicitly forbidden.
  - [x] Task title lines only keep execution mode; R/U trace mapping lives in `需求追踪`.

  **验证命令 / 方法**：
  - `npm test`，预期：bite-sized task 断言通过。

  **依赖**：无

- [x] 1.4 [direct] Split spec compliance into verify and release risk into review

  **需求追踪**：[R4] → [U4]
  **执行方式**：[direct]
  **涉及文件**：
  - `skills/opsx-verify/SKILL.md` — spec compliance verification semantics
  - `skills/opsx-review/SKILL.md` — release risk review semantics

  **验收标准**：
  - [x] Verify owns Spec Compliance Review.
  - [x] Review owns code quality / release risk.
  - [x] Review reports `VERIFY_DRIFT` and routes back to verify when it detects compliance drift.

  **验证命令 / 方法**：
  - `npm test`，预期：verify/review responsibility split 断言通过。

  **依赖**：无

- [x] 1.5 [direct] Enforce trigger-only descriptions for touched skills

  **需求追踪**：[R5] → [U5]
  **执行方式**：[direct]
  **涉及文件**：
  - `skills/opsx-bugfix/SKILL.md` — description
  - `skills/opsx-verify/SKILL.md` — description
  - `skills/opsx-lite/SKILL.md` — description
  - `skills/opsx-tasks/SKILL.md` — description
  - `skills/opsx-review/SKILL.md` — description
  - `skills/opsx-explore/SKILL.md` — description

  **验收标准**：
  - [x] Touched descriptions do not encode workflow arrows or step-order summaries.
  - [x] Detailed workflow remains in the skill body.

  **验证命令 / 方法**：
  - `npm test`，预期：description discipline 断言通过。

  **依赖**：无

## 2. Regression coverage and knowledge

- [x] 2.1 [test-first] Add regression tests for workflow discipline text

  **需求追踪**：[R1, R2, R3, R4, R5] → [U1, U2, U3, U4, U5]
  **执行方式**：[test-first]
  **涉及文件**：
  - `tests/workflow-discipline.test.mjs` — regression assertions
  - `skills/opsx-*.md` — tested fixtures
  - `runtime/schemas/spec-driven/templates/tasks.md` — task template fixture

  **验收标准**：
  - [x] Tests fail if root-cause, fresh-evidence, bite-sized-task, verify/review responsibility split, or description-discipline text is removed.
  - [x] Tests fail if task template reintroduces R/U tags in title lines.
  - [x] Existing npm packaging tests continue to pass.

  **验证命令 / 方法**：
  - `npm test`，预期：全部测试通过。
  - `npm run test:local-install`，预期：tarball local install and skill prune smoke test 通过。

  **依赖**：Task 1.1-1.5

- [x] 2.2 [direct] Update OPSX skill codemap

  **需求追踪**：[R5] → [U5]
  **执行方式**：[direct]
  **涉及文件**：
  - `.aiknowledge/codemap/openspec-skills.md` — architecture map
  - `.aiknowledge/logs/2026-04.md` — audit log

  **验收标准**：
  - [x] Codemap references `change:2026-04-28-superpowers-discipline`.
  - [x] Codemap documents the verify/review responsibility split.
  - [x] Monthly log records the codemap update.

  **验证命令 / 方法**：
  - `rg "2026-04-28-superpowers-discipline|VERIFY_DRIFT|fresh verification|root cause" .aiknowledge/codemap/openspec-skills.md .aiknowledge/logs/2026-04.md`，预期：命中新规则和 source ref。

  **依赖**：Task 1.1-1.5
