# Subagent Lifecycle

OPSX subagent lifecycle is managed by the main agent. Codex 当前没有可供 skill 调用的 list-all subagents API。截图里的 Subagents UI 只能辅助人观察，不能作为 workflow 可读数据源。

## Agent Roster

主 agent 必须在当前会话内维护软 roster，并只基于自己可观测的事件更新：

- `spawn_agent` 返回的 agent id / nickname / agent_type / model。
- `wait_agent` 返回的 running / completed / timed out 状态。
- subagent notification 中的 completed / failed / interrupted 状态。
- `close_agent` 返回和关闭请求结果。

Roster 至少记录：

- `agent_id`、`nickname`、`dispatch_class`、`role`、`model`、`reasoning_effort`
- `scope`、`write_scope`、`stage`、`status`
- `reuse_policy`: `reusable|no-reuse|ask`
- `close_policy`: `close-after-consumed|keep-for-followup|close-on-capacity-pressure`
- `created_for`、`last_result_summary`

状态约定：

```text
not_spawned -> running -> completed_reusable -> running
                         -> completed_no_reuse -> closed
running -> blocked|timed_out -> controller_decision
```

Unknown UI-only agents are not manageable resources. 如果 roster 没有记录某个 agent，主 agent 不应假装能复用或关闭它。

## Runtime JSON

当需要把运行态 roster 写入磁盘时，使用 `.opsx` 下的临时 JSON：

```text
.opsx/subagents/<session-id>.json
.opsx/subagents/current.json
```

优先使用稳定 session id；无法取得时使用 `current.json`。该文件是可覆盖的运行态镜像，用于调试、容量判断和未来 runtime helper，不得作为 OpenSpec gate 通过依据。

建议 JSON 结构：

```json
{
  "version": 1,
  "session_id": "current-session",
  "updated_at": "2026-04-28T00:00:00Z",
  "agents": [
    {
      "agent_id": "019...",
      "nickname": "Ohm",
      "dispatch_class": "retrieval-explorer",
      "role": "explorer",
      "model": "gpt-5.3-codex",
      "status": "closed",
      "scope": ["skills/common/subagent.md"],
      "write_scope": [],
      "reuse_policy": "reusable",
      "close_policy": "close-after-consumed",
      "created_for": "lifecycle smoke",
      "last_result_summary": "Read lifecycle reference",
      "spawned_at": "2026-04-28T00:00:00Z",
      "last_seen_at": "2026-04-28T00:00:00Z",
      "closed_at": "2026-04-28T00:00:00Z"
    }
  ]
}
```

`.opsx/subagents/*.json` 应被 `.gitignore` 忽略，避免提交会话 id、agent id 和临时状态。

## Change Summary

对于使用 subagent 的 OpenSpec change，可记录人类可读摘要：

```text
openspec/changes/<change>/subagent-roster.md
```

该文件记录关键 spawn、reuse、close 和 capacity 事件，适合归档后回看“本 change 用了哪些 subagent、如何释放容量”。它不替代 `audit-log.md`、`review-report.md`、`test-report.md` 或 `.openspec.yaml` gates。

## Pre-Spawn Check

每次调用 `spawn_agent` 前，主 agent 必须先做 pre-spawn check：

1. 确认 subagent support 可用；不可用则按 Fallback 串行执行。
2. 检查 roster 中的 running agents，避免重复派发同一任务。
3. 检查 completed reusable agents；如果 scope、dispatch class 和上下文连续，优先复用。
4. 检查 completed no-reuse agents；如果它们的结果已被消费，先 `close_agent`。
5. 检查 capacity pressure；如果最近发生线程上限错误，或 roster 中 completed agents 较多，先做 completed no-reuse cleanup 再 spawn。

不要等到 `spawn_agent` 因线程上限失败后才无序批量关闭。pre-spawn cleanup 是 controller 的固定职责。

## Reuse Policy

按 dispatch class 决定是否复用：

| Dispatch class | 默认复用 | 规则 |
|----------------|----------|------|
| `retrieval-explorer` | 可以 | 同模块、同问题链路、只读 scope 连续时可复用；需要干净上下文时关闭重建 |
| `implementation-worker` | 有条件 | 仅同一 task cluster、同一 file ownership、无共享 artifact 写入时可复用 |
| `gate-reviewer` | 不复用 | plan-review、task-analyze、verify、release-risk review 默认新建，避免旧判断污染独立审查 |
| `maintenance-worker` | 可以 | 同一次 archive follow-up 的 knowledge/codemap 连续维护可复用 |
| `long-running-auditor` | 可以 | 审计本身依赖长上下文，但 scope 变化时必须重建 |

需要干净上下文时，关闭旧 agent 并新建。只发送“忘掉之前”不可靠，不能替代重建。

## Close Policy

主 agent 在结果被消费后负责关闭无复用价值的 agent：

- `gate-reviewer`: StageResult / review result 已写入 `audit-log.md`、`.openspec.yaml` gates 或 `review-report.md` 后，默认立即关闭。
- `retrieval-explorer`: 调查结论已被主 agent 汇总后，如同模块没有马上继续调查则关闭。
- `implementation-worker`: diff 已检查、验证证据已收集、任务状态已由主 agent 整合后关闭。
- `maintenance-worker`: 授权的 `.aiknowledge/` 写入完成并被主 agent 检查后关闭。
- `BLOCKED` / `NEEDS_CONTEXT`: 如果不再补上下文或重试，关闭并在主流程中处理阻塞。
- 用户明确要求“清理 / 收工 / 释放 subagent”时，关闭所有非必要 agent。

不要为了释放容量随意关闭 running agent。running agent 只能在任务取消、明显卡死、用户要求或 controller 判定继续执行有风险时关闭。

## Capacity Policy

当接近线程上限或 `spawn_agent` 返回 thread limit 错误时，按顺序处理：

1. 关闭 roster 中 `completed_no_reuse` 且结果已消费的 agent。
2. 对 `completed_reusable` 重新判断本轮是否仍会复用；不会复用则关闭。
3. 如果仍无容量，等待 running agent 完成，或改为串行 inline fallback。
4. 只有在用户明确同意或任务已取消时，才关闭 running agent。
5. cleanup 后最多重试一次相同 spawn；再次失败则降级为串行或询问用户。

容量压力不能降低 gate 要求；只能改变执行方式和并发度。
