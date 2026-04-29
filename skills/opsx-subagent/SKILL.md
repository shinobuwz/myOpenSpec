---
name: opsx-subagent
description: Codex 默认、Claude 兼容的 OPSX subagent 派发契约；用于统一 worker、reviewer、explorer 的角色边界和结果处理。
---

# OPSX Subagent Contract

这个 skill 是 OPSX subagent 规则的 canonical contract。其他 `opsx-*` workflow skill 需要说明 subagent 派发、角色边界、结果处理或平台适配时，应引用本 contract，而不是在各自文件里复制一整套规则。

## 职责分离

具体 workflow skill 负责定义“要做什么”：

- `opsx-plan-review`、`opsx-task-analyze`、`opsx-verify`、`opsx-review` 提供 reviewer prompt、审查维度和 StageResult 要求。
- `opsx-implement` 提供 task、TDD 循环、文件所有权和验证命令。
- `opsx-explore` 提供调查问题、codemap-first 范围和只读约束。
- `opsx-archive` 提供 knowledge / codemap follow-up 上下文和写入边界。

`opsx-subagent` 负责定义“派给哪类 subagent、用什么默认模型档位、主 agent 如何收口”。不要把具体 stage prompt 复制到这里；这里维护职责类型、平台映射、模型选择、写入边界和 fallback。

## Dispatch Classes

主 agent 先按工作内容选择 dispatch class，再由对应 workflow skill 注入具体 prompt。用户明确指定模型时优先使用；运行环境不支持推荐模型时，回退到可用默认 subagent 模型并说明。

| Dispatch class | 典型工作 | Codex 默认 | 推荐模型 | reasoning | 写入 |
|----------------|----------|------------|----------|-----------|------|
| `retrieval-explorer` | 简单检索、`rg`/glob、跨文件读取、证据摘要、日志或 diff 摘要 | `spawn_agent(agent_type="explorer", model="gpt-5.3-codex", reasoning_effort="low")` | `gpt-5.3-codex` | low | 只读 |
| `implementation-worker` | 按明确 task 实现、补测试、机械重构、局部修复 | `spawn_agent(agent_type="worker", model="gpt-5.4", reasoning_effort="medium")` | `gpt-5.4` | medium | 明确文件所有权内可写 |
| `gate-reviewer` | plan-review、task-analyze、verify、release-risk review | `spawn_agent(agent_type="worker", model="gpt-5.5", reasoning_effort="medium")` | `gpt-5.5` | medium/high | 只读 |
| `maintenance-worker` | 归档后的 knowledge / codemap 更新、文档索引刷新 | `spawn_agent(agent_type="worker", model="gpt-5.3-codex", reasoning_effort="medium")` | `gpt-5.3-codex` | medium | 授权的 `.aiknowledge/` 条目 |
| `long-running-auditor` | 大上下文审计、长链路调查、跨模块一致性盘点 | `spawn_agent(agent_type="worker", model="gpt-5.2", reasoning_effort="medium")` | `gpt-5.2` | medium | 默认只读 |

模型升级 / 降级规则：

- 简单检索、证据收集、日志整理优先用 `retrieval-explorer`，不要占用强模型。
- 明确实现任务默认用 `implementation-worker`；只有跨架构、高风险并发、迁移、schema 或公共接口变更时升级到 `gpt-5.5`。
- gate/release reviewer 默认用 `gate-reviewer`，因为它影响后续 gate；非常小的 artifact-only review 可降到 `gpt-5.4`，但不能降到 economy 档。
- 长上下文、长时间运行且不需要最终设计判断的审计用 `long-running-auditor`。
- 安全、发布、归档、外部写操作的最终判断始终留在主 agent；不能因为 subagent 使用强模型就下放 controller 权限。

## 平台映射

OPSX 默认按 Codex 解释 subagent 语义，并保留 Claude Code 等价映射。

| 角色 | Codex 默认 | Claude Code 兼容 |
|------|------------|------------------|
| implementation worker | `spawn_agent(agent_type="worker", message=...)` | `Task tool` with `subagent_type: "general-purpose"` |
| reviewer worker | `spawn_agent(agent_type="worker", message=...)` | `Task tool` with `subagent_type: "general-purpose"` |
| explorer | `spawn_agent(agent_type="explorer", message=...)` | `Task tool` with `subagent_type: "Explore"` |
| 等待结果 | `wait_agent` | `Task tool` returns the result |
| 释放完成 agent | `close_agent` | no explicit cleanup required |
| 任务状态跟踪 | `update_plan` | `TodoWrite` |

Codex 没有 Claude 风格 named agent registry。需要特定 reviewer 或 implementer 时，主 agent 读取对应 prompt 模板或 skill 片段，填充上下文后放入 `message`。

Claude Code 不暴露同样的模型覆盖语义时，仍按 dispatch class 的职责边界派发；模型选择作为推荐，不应破坏工具兼容性。

## Lifecycle / Roster

详细规则见 `references/lifecycle.md`。主 agent 必须维护会话内 Agent Roster；Codex 当前没有可供 skill 调用的 list-all subagents API，roster 只能来自 `spawn_agent`、`wait_agent`、subagent notification 和 `close_agent` 的可观测结果。

每次 `spawn_agent` 前必须执行 Pre-Spawn Check：检查 running agents、completed reusable agents、completed no-reuse agents 和 capacity pressure。线程接近上限时，先关闭结果已消费的 completed no-reuse agents，再派发新的 subagent。

复用和关闭按 dispatch class 决定：`retrieval-explorer` 和 `maintenance-worker` 可条件复用；`implementation-worker` 仅在同一 task cluster 与 file ownership 下复用；`gate-reviewer` 默认不复用，StageResult 或 review result 被主 agent 消费后关闭。不要为了释放容量随意关闭 running agent。

运行态 JSON roster 写入 `.opsx/subagents/<session-id>.json`；拿不到稳定 session id 时使用 `.opsx/subagents/current.json`。该 JSON 是可覆盖的调度辅助，不得作为 gate 通过依据。人类可读摘要写入 `openspec/changes/<change>/subagent-roster.md`，只记录关键 spawn/reuse/close/capacity 事件，不替代 `audit-log.md`、`review-report.md`、`test-report.md` 或 `.openspec.yaml` gates。

## Controller Boundary

The main agent is the controller. 主 agent 始终拥有 workflow 决策权：

- 解析 change / subchange。
- 校验 `.openspec.yaml` gates。
- 决定是否继续、暂停、回退或升级。
- 汇总 subagent 结果。
- 写入 `audit-log.md`、`.openspec.yaml` gates 和用户可见完成结论。
- 对最终输出负责。

Subagent 只负责被派发的局部任务：

- implementation worker 实施指定 task 或明确文件范围内的改动。
- reviewer worker 审查指定产物、diff 或代码范围。
- explorer 调查指定模块或问题。

Subagent 禁止自行宣称整个 change 已完成、通过、已验证或可归档。局部成功必须由主 agent 转化为 OPSX gate、StageResult、test-report 或 review-report 证据后才可进入下一阶段。

## 写入边界

每次派发 subagent 时，主 agent 必须说明读取范围和写入范围。

共享 artifact 必须串行写入，禁止多个 subagent 并行写：

- `tasks.md`
- `test-report.md`
- `.openspec.yaml`
- `audit-log.md`
- `review-report.md`
- `.aiknowledge/logs/YYYY-MM.md`

只读 reviewer 不得修改文件。implementation worker 只能写被明确分配的业务代码、测试代码或文档文件。knowledge / codemap worker 只能写 `.aiknowledge/` 中被明确授权的条目。

## Prompt Framing

Codex 的 `message` 是用户级输入，不是 system prompt。派发时使用任务委托结构：

```text
Your task is to perform the following. Follow the instructions below exactly.

<agent-instructions>
[filled OPSX prompt, task text, file scope, write scope, output format]
</agent-instructions>

Execute this now. Output only the requested structured result.
```

每个 prompt 至少包含：

- 任务目标。
- 读取文件或上下文。
- 允许写入的文件。
- 禁止越界的文件或行为。
- 验证命令或审查维度。
- 输出格式。

## Implementation Status

Implementation worker 必须用以下状态之一报告：

| Status | 含义 | 主 agent 行为 |
|--------|------|---------------|
| `DONE` | 局部任务完成且验证通过 | 检查 diff 和验证证据后继续 |
| `DONE_WITH_CONCERNS` | 已完成但存在正确性、范围或维护性疑虑 | 主 agent 读取 concerns，决定修正、复审或记录 warning |
| `NEEDS_CONTEXT` | 缺少完成任务所需上下文 | 主 agent 补充上下文后重新派发或暂停询问用户 |
| `BLOCKED` | 当前任务无法完成 | 主 agent 停止推进，判断是否拆分、升级模型、回到 plan/tasks 或询问用户 |

不要忽略 `DONE_WITH_CONCERNS`、`NEEDS_CONTEXT` 或 `BLOCKED`。这些状态都说明主 agent 需要改变上下文、计划或任务边界。

## Reviewer Results

OPSX reviewer 不引入新的 gate source。

- `opsx-plan-review`、`opsx-task-analyze`、`opsx-verify` reviewer 必须输出 StageResult JSON，主 agent 再写 `audit-log.md` 和 gates。
- `opsx-review` reviewer 输出质量 / 发布风险审查结果，主 agent 写 `review-report.md` 和 review gate。
- reviewer 的口头成功描述不能单独作为完成、通过或归档依据。

## Fallback

If subagent support is unavailable, use fallback inline execution:

1. 主 agent 串行执行同等步骤。
2. 明确记录没有 subagent 隔离，质量风险更高。
3. 不跳过 `opsx-plan-review`、`opsx-task-analyze`、`opsx-verify`、`opsx-review` gates。
4. 不用 inline 自查替代 fresh verification evidence。

Fallback 是能力降级，不是 gate 降级。

## 禁止模式

- 让 subagent 写 `.openspec.yaml` gates。
- 让多个 worker 并行写同一文件或共享 artifact。
- 用 implementation worker 的 self-review 代替 verify/review。
- 用 Claude-only `Task` / `subagent_type` 文案描述 OPSX subagent，而没有 Codex `spawn_agent` 映射。
- 让 subagent 在没有边界的情况下全仓库搜索或修改。

## 完成检查

引用本 contract 的 workflow skill 应确认：

- Codex 默认映射清楚。
- Claude Code 兼容映射清楚。
- main agent controller 权限未被下放。
- 写入范围明确。
- reviewer 结果能回到 StageResult / audit-log / review-report。
- fallback 不跳过 gates。
