# Tasks

## 1. Gate/Reviewer Entry Slimming

- [ ] 1.1 [characterization-first] Lock gate skill slimming invariants

  **需求追踪**：[R1], [R2], [R3], [R4], [R5], [R10], [R12] → [U1], [U4]
  **执行方式**：[characterization-first]
  **涉及文件**：
  - `tests/skill-slimming.test.mjs` — 结构回归测试
  - `tests/workflow-discipline.test.mjs` — workflow 硬规则回归测试
  - `scripts/check-skill-slimming.mjs` — duplicate/oversized 检查（按需）

  **验收标准**：
  - [ ] 测试能证明 gate/reviewer `SKILL.md` 保留前置 gate、失败路由、report 写入责任和 canonical reference 导航。
  - [ ] 测试能证明 `opsx-plan-review`、`opsx-task-analyze`、`opsx-verify` 不再复制完整 StageResult schema。
  - [ ] 现有 verify/review 职责边界、fresh evidence、subagent central contract 断言继续保留。

  **验证命令 / 方法**：
  - `node --test tests/skill-slimming.test.mjs tests/workflow-discipline.test.mjs`，预期：先红后绿，最终通过

  **依赖**：无

- [ ] 1.2 [characterization-first] Slim plan-review and task-analyze entries

  **需求追踪**：[R1], [R2], [R3], [R4] → [U1]
  **执行方式**：[characterization-first]
  **涉及文件**：
  - `skills/opsx-plan-review/SKILL.md` — 入口文案
  - `skills/opsx-plan-review/references/*.md` — reviewer prompt / dimensions / templates
  - `skills/opsx-task-analyze/SKILL.md` — 入口文案
  - `skills/opsx-task-analyze/references/*.md` — reviewer prompt / dimensions / templates
  - `tests/skill-slimming.test.mjs`
  - `tests/workflow-discipline.test.mjs`

  **验收标准**：
  - [ ] 两个入口保留各自硬门控、读写边界、StageResult canonical 引用、audit-log 写入和下一阶段路由。
  - [ ] 完整 prompt、追踪矩阵模板、问题列表模板、输出 JSON 示例迁入 references。
  - [ ] `node scripts/check-skill-slimming.mjs --json --fail-on-duplicates` 不再因这两个 skill 复制 StageResult schema 失败。

  **验证命令 / 方法**：
  - `node --test tests/skill-slimming.test.mjs tests/workflow-discipline.test.mjs`，预期：通过
  - `node scripts/check-skill-slimming.mjs --json --fail-on-duplicates`，预期：不包含这两个 skill 的 duplicate finding

  **依赖**：Task 1.1

- [ ] 1.3 [characterization-first] Slim verify and review entries

  **需求追踪**：[R1], [R2], [R3], [R4], [R5] → [U1]
  **执行方式**：[characterization-first]
  **涉及文件**：
  - `skills/opsx-verify/SKILL.md` — 入口文案
  - `skills/opsx-verify/references/*.md` — compliance/reviewer prompt / dimensions
  - `skills/opsx-review/SKILL.md` — 入口文案
  - `skills/opsx-review/references/*.md` — release-risk taxonomy / review prompt
  - `tests/skill-slimming.test.mjs`
  - `tests/workflow-discipline.test.mjs`

  **验收标准**：
  - [ ] `opsx-verify` 入口保留 fresh evidence 铁律、Spec Compliance Review、verify gate 写入条件和转入 review 的退出契约。
  - [ ] `opsx-review` 入口保留 code quality / release risk 边界、`VERIFY_DRIFT` 路由、review-report 写入和 review gate 写入条件。
  - [ ] 完整审查维度、风险分类、prompt 和 StageResult 示例迁入 references 或 canonical docs。

  **验证命令 / 方法**：
  - `node --test tests/skill-slimming.test.mjs tests/workflow-discipline.test.mjs`，预期：通过
  - `node scripts/check-skill-slimming.mjs --json --fail-on-duplicates`，预期：不再因 `opsx-verify` 复制 StageResult schema 失败

  **依赖**：Task 1.2

## 2. Execution Support Entry Slimming

- [ ] 2.1 [characterization-first] Slim tasks, tdd, and report templates

  **需求追踪**：[R6], [R8] → [U2]
  **执行方式**：[characterization-first]
  **涉及文件**：
  - `skills/opsx-tasks/SKILL.md` — 入口文案
  - `skills/opsx-tasks/references/*.md` — tasks template / forbidden patterns
  - `skills/opsx-tdd/SKILL.md` — 入口文案
  - `skills/opsx-tdd/references/*.md` — test-report template / anti-patterns
  - `skills/opsx-report/SKILL.md` — 入口文案
  - `skills/opsx-report/references/*.md` — RunReport template / CSS details
  - `tests/skill-slimming.test.mjs`
  - `tests/workflow-discipline.test.mjs`

  **验收标准**：
  - [ ] `opsx-tasks` 入口保留测试不是独立 task、TDD 标签决策、bite-sized、字段完整性和验证命令要求。
  - [ ] `opsx-tdd` 入口保留先写测试、红绿重构、`[manual]` 处理和覆盖率说明规则。
  - [ ] `opsx-report` 入口保留读取 audit/test/review reports 的来源规则和输出边界，长 HTML/CSS 模板迁入 references。

  **验证命令 / 方法**：
  - `node --test tests/skill-slimming.test.mjs tests/workflow-discipline.test.mjs`，预期：通过

  **依赖**：Task 1.3

- [ ] 2.2 [characterization-first] Slim implement and archive worker guidance

  **需求追踪**：[R4], [R7], [R8], [R9] → [U3]
  **执行方式**：[characterization-first]
  **涉及文件**：
  - `skills/opsx-implement/SKILL.md` — 入口文案
  - `skills/opsx-implement/references/*.md` — worker prompt / execution details
  - `skills/opsx-archive/SKILL.md` — 入口文案
  - `skills/opsx-archive/references/*.md` — archive routing / follow-up worker prompts
  - `tests/skill-slimming.test.mjs`
  - `tests/workflow-discipline.test.mjs`
  - `tests/archive-skill.test.mjs`

  **验收标准**：
  - [ ] `opsx-implement` 入口保留 plan-review/task-analyze gates、serial-by-default、disjoint write sets、共享 artifact 主 agent 串行写入和验收勾选证据规则。
  - [ ] `opsx-archive` 入口保留 verify/review gates、不可绕过、grouped subchange 顶层 archive 路径和父 group route 更新规则。
  - [ ] worker prompt 正文、详细流程和长示例迁入 references。

  **验证命令 / 方法**：
  - `node --test tests/skill-slimming.test.mjs tests/workflow-discipline.test.mjs tests/archive-skill.test.mjs`，预期：通过

  **依赖**：Task 2.1

## 3. Validation And Inventory

- [ ] 3.1 [direct] Update inventory and validation evidence

  **需求追踪**：[R10], [R11], [R12] → [U4]
  **执行方式**：[direct]
  **涉及文件**：
  - `docs/skill-slimming-inventory.md` — 03 后库存
  - `openspec/changes/2026-04-28-skill-md-slimming/subchanges/03-migrate-gate-skills/test-report.md` — 验证留档
  - `openspec/changes/2026-04-28-skill-md-slimming/subchanges/03-migrate-gate-skills/tasks.md` — 完成状态

  **验收标准**：
  - [ ] 库存文档反映 03 后最新总行数、oversized、duplicate candidates 和剩余风险。
  - [ ] `node scripts/check-skill-slimming.mjs --json --fail-on-duplicates` 通过。
  - [ ] `npm test` 通过，并在 `test-report.md` 记录 red/green/refactor 或 direct 验证证据。
  - [ ] 所有完成 task 和验收标准均按证据勾选。

  **验证命令 / 方法**：
  - `node scripts/check-skill-slimming.mjs --json --fail-on-duplicates`，预期：通过
  - `npm test`，预期：通过

  **依赖**：Task 2.2
