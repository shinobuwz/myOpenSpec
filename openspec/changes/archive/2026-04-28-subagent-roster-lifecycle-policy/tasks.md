## 1. Roster lifecycle contract

- [x] 1.1 [direct] 在 `opsx-subagent` 中增加 Agent Roster 与生命周期策略

  **需求追踪**：[R1], [R2], [R3], [R4], [R5], [R7], [R8] → [U1]
  **执行方式**：[direct]
  **涉及文件**：
  - `skills/opsx-subagent/SKILL.md` — subagent canonical contract
  - `skills/opsx-subagent/references/lifecycle.md` — lifecycle 细节

  **验收标准**：
  - [x] 说明没有通用 list-all subagents API，roster 由主 agent 基于 `spawn_agent`、`wait_agent`、notification 和 `close_agent` 维护。
  - [x] 定义 Agent Roster 字段和状态。
  - [x] 定义 Pre-Spawn Check。
  - [x] 定义 Reuse Policy、Close Policy、Capacity Policy。
  - [x] 明确 gate reviewer 默认不复用，完成且结果被消费后关闭。
  - [x] 明确运行态 roster JSON 路径为 `.opsx/subagents/<session-id>.json` 或 `.opsx/subagents/current.json`。
  - [x] 明确运行态 roster JSON 结构包含 `version` 字段，便于后续 helper 兼容演进。
  - [x] 明确 change 摘要 Markdown 路径为 `openspec/changes/<change>/subagent-roster.md`，且不替代 gates。

  **验证命令 / 方法**：
  - `rg -n "Agent Roster|Pre-Spawn Check|Reuse Policy|Close Policy|Capacity Policy|list-all|spawn_agent|wait_agent|notification|close_agent|gate-reviewer.*不复用|completed no-reuse|\\.opsx/subagents|subagent-roster\\.md|不得作为 gate|\"version\"" skills/opsx-subagent/SKILL.md skills/opsx-subagent/references/lifecycle.md`，预期：全部命中。

  **依赖**：`2026-04-28-subagent-dispatch-model-policy`

- [x] 1.2 [direct] 忽略运行态 roster JSON

  **需求追踪**：[R7] → [U3]
  **执行方式**：[direct]
  **涉及文件**：
  - `.gitignore` — 忽略运行态 roster JSON

  **验收标准**：
  - [x] `.gitignore` 包含 `.opsx/subagents/*.json`。

  **验证命令 / 方法**：
  - `rg -n "^\\.opsx/subagents/\\*\\.json$" .gitignore`，预期：命中。

  **依赖**：Task 1.1

- [x] 1.3 [direct] 增加本 change 的 subagent roster 摘要

  **需求追踪**：[R8] → [U4]
  **执行方式**：[direct]
  **涉及文件**：
  - `openspec/changes/2026-04-28-subagent-roster-lifecycle-policy/subagent-roster.md` — 本 change 的 subagent 使用摘要

  **验收标准**：
  - [x] 摘要记录本 change 的 plan-review、task-analyze、verify、review 和 smoke/reuse 测试中使用的 subagent。
  - [x] 摘要声明该文件不替代 gates、audit-log 或 review-report。

  **验证命令 / 方法**：
  - `rg -n "subagent roster|不替代|plan-review|task-analyze|verify|review|smoke|reuse" openspec/changes/2026-04-28-subagent-roster-lifecycle-policy/subagent-roster.md`，预期：全部命中。

  **依赖**：Task 1.1

## 2. Regression test

- [x] 2.1 [direct] 增加 roster lifecycle 回归测试

  **需求追踪**：[R6], [R7], [R8] → [U2]
  **执行方式**：[direct]
  **涉及文件**：
  - `tests/workflow-discipline.test.mjs` — workflow contract tests

  **验收标准**：
  - [x] 测试检查 Agent Roster、Pre-Spawn Check、Reuse Policy、Close Policy、Capacity Policy。
  - [x] 测试检查无 list-all API 说明和工具状态来源。
  - [x] 测试检查 gate reviewer 默认不复用和 completed no-reuse cleanup。
  - [x] 测试检查 `.opsx/subagents`、`subagent-roster.md` 和“不作为 gate 依据”的规则。
  - [x] 测试检查 runtime roster JSON contract 包含 `version` 字段。

  **验证命令 / 方法**：
  - `npm test -- tests/workflow-discipline.test.mjs`，预期：通过。

  **依赖**：Task 1.1
