---
name: opsx-subagent
description: Codex 默认、Claude 兼容的 OPSX subagent 派发契约；用于统一 worker、reviewer、explorer 的角色边界和结果处理。
---

# OPSX Subagent Contract

这个 skill 是 OPSX subagent 规则的 canonical contract。其他 `opsx-*` workflow skill 需要说明 subagent 派发、角色边界、结果处理或平台适配时，应引用本 contract，而不是在各自文件里复制一整套规则。

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
