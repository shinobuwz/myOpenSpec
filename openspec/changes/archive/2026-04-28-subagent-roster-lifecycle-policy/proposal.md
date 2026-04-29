## 为什么

`opsx-subagent` 已经集中维护 subagent 的平台映射、职责模型和模型推荐，但还缺少“运行期统筹管理”规则。实际执行中，当多个 reviewer/explorer/worker 完成后未及时关闭，后续再派发 release-risk reviewer 会遇到线程数上限，只能临场批量 close。这个行为应该变成 contract 层的 pre-spawn roster 管理，而不是靠临时补救。

## 变更内容

- 在 `opsx-subagent` 中新增 Agent Roster / 生命周期管理规则。
- 明确当前 Codex 工具没有通用 list-all subagents API，主 agent 必须基于 `spawn_agent`、`wait_agent`、notification、`close_agent` 的结果维护会话内 roster。
- 增加 pre-spawn check：派发前先检查 subagent support、活跃/已完成 agent、复用机会和容量压力。
- 增加 reuse / close / capacity policy，规定哪些 dispatch class 可以复用、哪些 reviewer 完成后应立即关闭、线程接近上限时如何清理。
- 增加回归测试，防止 roster lifecycle 规则从 `opsx-subagent` 中丢失。

## 功能 (Capabilities)

### 新增功能
- `subagent-roster-lifecycle`: 为 OPSX subagent 定义运行期 roster、复用、关闭和容量管理契约。

### 修改功能

## 依赖

- 依赖 active change `2026-04-28-subagent-dispatch-model-policy` 中新增的 dispatch class 和模型职责分发规则。本 change 在同一 contract 上继续增强生命周期管理。

## 影响

- `skills/opsx-subagent/SKILL.md` — 新增 roster lifecycle contract。
- `tests/workflow-discipline.test.mjs` — 增加 roster lifecycle 回归测试。
