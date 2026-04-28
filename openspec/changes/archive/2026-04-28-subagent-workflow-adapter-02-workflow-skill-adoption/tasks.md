## 1. Workflow Skill Adoption

- [x] 1.1 [test-first] Adopt central contract in implementation workflow

  **需求追踪**：[R1] [R2] [R7] → [U1] [U6]
  **执行方式**：[test-first]
  **涉及文件**：
  - `tests/workflow-discipline.test.mjs` — workflow discipline regression tests
  - `skills/opsx-implement/SKILL.md` — implementation workflow skill

  **验收标准**：
  - [x] 测试先断言 `opsx-implement` 引用 `opsx-subagent` 作为 implementation worker 的 canonical contract
  - [x] 测试先断言 `opsx-implement` 保留 TDD 循环、`tasks.md` 顶层任务状态和内部验收标准同步规则
  - [x] `opsx-implement` 说明主 agent 仍负责 gates、`tasks.md` / `test-report.md` 整合和最终完成声明
  - [x] 本 subchange 不在 `opsx-implement` 中引入多 worker 并行策略

  **验证命令 / 方法**：
  - `node --test tests/workflow-discipline.test.mjs`，预期：新增断言先失败，skill 更新后通过

  **依赖**：无

- [x] 1.2 [test-first] Adopt central contract in StageResult reviewer gates

  **需求追踪**：[R1] [R3] [R7] → [U2] [U6]
  **执行方式**：[test-first]
  **涉及文件**：
  - `tests/workflow-discipline.test.mjs` — workflow discipline regression tests
  - `skills/opsx-plan-review/SKILL.md` — plan-review gate skill
  - `skills/opsx-task-analyze/SKILL.md` — task-analyze gate skill
  - `skills/opsx-verify/SKILL.md` — verify gate skill

  **验收标准**：
  - [x] 测试先断言三个 reviewer gate skill 均引用 `opsx-subagent` reviewer contract
  - [x] 三个 reviewer gate skill 均保留 StageResult JSON 输出要求
  - [x] 三个 reviewer gate skill 均保留由主 agent 写入 `audit-log.md` 和 `.openspec.yaml` gates 的规则
  - [x] reviewer 文案不允许退化成只有 Claude Code `Task` / `subagent_type` 的平台说明

  **验证命令 / 方法**：
  - `node --test tests/workflow-discipline.test.mjs`，预期：新增断言先失败，skill 更新后通过

  **依赖**：Task 1.1

- [x] 1.3 [test-first] Adopt central contract in review, explore, and archive workflows

  **需求追踪**：[R1] [R4] [R5] [R6] [R7] → [U3] [U4] [U5] [U6]
  **执行方式**：[test-first]
  **涉及文件**：
  - `tests/workflow-discipline.test.mjs` — workflow discipline regression tests
  - `skills/opsx-review/SKILL.md` — release-risk review skill
  - `skills/opsx-explore/SKILL.md` — exploration skill
  - `skills/opsx-archive/SKILL.md` — archive skill

  **验收标准**：
  - [x] 测试先断言 `opsx-review`、`opsx-explore` 和 `opsx-archive` 均引用 `opsx-subagent`
  - [x] `opsx-review` 保留 code quality / release risk 边界，并在明显合规漂移时输出 `VERIFY_DRIFT`
  - [x] `opsx-explore` 保留 codemap-first 搜索协议、只读边界和普通文本问询 fallback
  - [x] `opsx-archive` 保留 grouped subchange 顶层归档规则和父 group route 收敛规则
  - [x] archive 后续 knowledge / codemap worker 的写入范围限定在被授权的 `.aiknowledge/` 条目

  **验证命令 / 方法**：
  - `node --test tests/workflow-discipline.test.mjs`，预期：新增断言先失败，skill 更新后通过

  **依赖**：Task 1.2

## 2. Knowledge And Distribution

- [x] 2.1 [direct] Refresh knowledge map and installed OPSX skills

  **需求追踪**：[R1] [R7] → [U6]
  **执行方式**：[direct]
  **涉及文件**：
  - `.aiknowledge/codemap/openspec-skills.md` — OPSX skill architecture knowledge
  - `.aiknowledge/logs/2026-04.md` — monthly knowledge audit log
  - `skills/opsx-implement/SKILL.md` — installed skill source
  - `skills/opsx-plan-review/SKILL.md` — installed skill source
  - `skills/opsx-task-analyze/SKILL.md` — installed skill source
  - `skills/opsx-verify/SKILL.md` — installed skill source
  - `skills/opsx-review/SKILL.md` — installed skill source
  - `skills/opsx-explore/SKILL.md` — installed skill source
  - `skills/opsx-archive/SKILL.md` — installed skill source

  **验收标准**：
  - [x] codemap 说明 workflow skills 已采用 `opsx-subagent` central contract
  - [x] 月度日志追加本次 codemap 更新记录，source ref 指向当前 subchange
  - [x] `node bin/opsx.mjs install-skills` 已运行并成功
  - [x] 全量 `npm test` 通过

  **验证命令 / 方法**：
  - `rg -n "opsx-subagent|central subagent contract|StageResult" .aiknowledge/codemap/openspec-skills.md .aiknowledge/logs/2026-04.md`，预期：能定位 adoption 约束
  - `node bin/opsx.mjs install-skills`，预期：安装成功
  - `npm test`，预期：全部通过

  **依赖**：Task 1.3
