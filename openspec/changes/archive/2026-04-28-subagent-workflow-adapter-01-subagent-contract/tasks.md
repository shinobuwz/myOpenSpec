## 1. Central Subagent Contract

- [x] 1.1 [test-first] Add opsx-subagent contract skill with regression coverage

  **需求追踪**：[R1] [R2] [R3] [R4] [R5] [R6] → [U1] [U3] [U4]
  **执行方式**：[test-first]
  **涉及文件**：
  - `tests/workflow-discipline.test.mjs` — 回归测试
  - `skills/opsx-subagent/SKILL.md` — canonical subagent contract

  **验收标准**：
  - [ ] 测试先断言 `skills/opsx-subagent/SKILL.md` 存在并包含 Codex `spawn_agent(agent_type="worker"` 与 `spawn_agent(agent_type="explorer"` 映射
  - [ ] 测试先断言 contract 包含 Claude Code `Task` tool 兼容映射
  - [ ] 测试先断言 contract 包含 main agent/controller 权限边界、共享 artifact 写入边界、fallback 和 `DONE_WITH_CONCERNS` / `NEEDS_CONTEXT` / `BLOCKED` status
  - [ ] `skills/opsx-subagent/SKILL.md` 创建后能通过上述测试
  - [ ] contract 明确 reviewer 仍输出 StageResult 或 review-report 证据，不引入新的 gate source

  **验证命令 / 方法**：
  - `npm test`，预期：新增测试先失败，创建 contract 后全部通过

  **依赖**：无

- [x] 1.2 [direct] Update supported tools documentation for opsx-subagent

  **需求追踪**：[R2] [R3] [R6] → [U2]
  **执行方式**：[direct]
  **涉及文件**：
  - `docs/supported-tools.md` — 工具支持与 skill 清单文档

  **验收标准**：
  - [ ] `docs/supported-tools.md` 保留 Codex 默认入口和 Claude Code 兼容入口
  - [ ] skill 清单新增 `opsx-subagent`，且用途描述为 subagent 派发契约 / 平台适配
  - [ ] 文档说明 canonical subagent 规则位于 `opsx-subagent`，而不是只在 supported-tools 中维护

  **验证命令 / 方法**：
  - `npm test`，预期：supported-tools skill 清单与 `skills/opsx-*` 目录一致

  **依赖**：Task 1.1

## 2. Knowledge Map

- [x] 2.1 [direct] Update codemap for opsx-subagent

  **需求追踪**：[R6] → [U5]
  **执行方式**：[direct]
  **涉及文件**：
  - `.aiknowledge/codemap/index.md` — codemap 模块索引
  - `.aiknowledge/codemap/openspec-skills.md` — OPSX skill 架构知识
  - `.aiknowledge/logs/2026-04.md` — 月度知识审计日志

  **验收标准**：
  - [ ] `openspec-skills.md` 的 skill 清单包含 `opsx-subagent`
  - [ ] `openspec-skills.md` 的隐式约束说明 Codex-first subagent contract 由 `opsx-subagent` 承载
  - [ ] 月度日志追加本次 codemap 更新记录，source ref 指向当前 change
  - [ ] 如 `codemap/index.md` 的模块说明需要更新，必须同步保持 `openspec-skills` 为 active

  **验证命令 / 方法**：
  - `rg -n "opsx-subagent|Codex-first|spawn_agent" .aiknowledge/codemap .aiknowledge/logs/2026-04.md`，预期：能定位新增 skill 和 contract 约束
  - `npm test`，预期：全部通过

  **依赖**：Task 1.2
