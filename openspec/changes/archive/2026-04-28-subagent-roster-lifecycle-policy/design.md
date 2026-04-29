## 上下文

当前 `opsx-subagent` 已定义 dispatch class 与推荐模型，但对运行期 subagent 的管理仍依赖主 agent 临场判断。实际问题是：多个已完成 reviewer/explorer 没有及时关闭，导致后续 `spawn_agent` 遇到线程数上限。用户希望 `opsx-subagent` 像 `agent-team` 一样统筹管理“当前是否开启了 subagent、有哪些活跃 subagent、是否可以复用、是否应该关闭”。

Codex 当前可用工具包括 `spawn_agent`、`wait_agent`、`send_input`、`resume_agent`、`close_agent`。从当前工具面看，没有一个通用的 “list all subagents / query roster” API；截图中的 Subagents UI 是可见状态，但不是 workflow skill 可调用的数据源。因此 contract 应要求主 agent 在会话内主动维护 roster。

## 目标 / 非目标

**目标：**
- 在 `opsx-subagent` 增加 Agent Roster、Pre-Spawn Check、Reuse Policy、Close Policy 和 Capacity Policy。
- 明确没有通用 list-all API 时的状态来源：`spawn_agent` 返回、`wait_agent` 返回、notification、`close_agent` 返回。
- 把线程上限处理前置为 pre-spawn cleanup，而不是 spawn 失败后的临场补救。
- 规定运行态 roster JSON 写入 `.opsx/subagents/`，并与 OpenSpec change 内的人类可读摘要分离。
- 用测试保护 lifecycle contract。

**非目标：**
- 不实现真实 runtime API 或持久化 agent registry。
- 不在本 change 实现 `opsx subagents status/record/close-stale` 等 runtime helper。
- 不改变 Codex 工具本身的线程上限。
- 不要求所有 completed agent 都长期保留；OPSX reviewer 默认仍偏向完成后关闭。
- 不把 `agent-team` 的 TeamCreate/TaskCreate/SendMessage 机制搬进 OPSX。

## 需求追踪

- [R1] -> [U1]
- [R2] -> [U1]
- [R3] -> [U1]
- [R4] -> [U1]
- [R5] -> [U1]
- [R6] -> [U2]
- [R7] -> [U1], [U3]
- [R8] -> [U1], [U4]

## 实施单元

### [U1] Subagent roster lifecycle contract
- 关联需求: [R1], [R2], [R3], [R4], [R5], [R7], [R8]
- 模块边界:
  - `skills/opsx-subagent/SKILL.md`
  - `skills/opsx-subagent/references/lifecycle.md`
- 验证方式: 静态读取 `opsx-subagent`，确认存在 Agent Roster、Pre-Spawn Check、Reuse Policy、Close Policy、Capacity Policy，以及无 list-all API 的说明。
- 知识沉淀: subagent lifecycle 是横切管理规则，应放在 canonical contract；具体 workflow skill 只引用，不复制。

### [U2] Roster lifecycle regression test
- 关联需求: [R6]
- 模块边界:
  - `tests/workflow-discipline.test.mjs`
- 验证方式: 运行 `npm test -- tests/workflow-discipline.test.mjs`，确认测试覆盖 roster lifecycle 关键词和接口来源。
- 知识沉淀: 对纯文档 contract 的行为约束应用静态测试防漂移。

### [U3] Runtime roster ignore rule
- 关联需求: [R7]
- 模块边界:
  - `.gitignore`
- 验证方式: 静态读取 `.gitignore`，确认 `.opsx/subagents/*.json` 被忽略；静态读取 lifecycle reference，确认 runtime roster JSON 使用 `.opsx/subagents/<session-id>.json` 和 fallback `.opsx/subagents/current.json`，且结构包含 `version` 字段。
- 知识沉淀: 运行态 roster JSON 是调度辅助，不是仓库事实源，必须避免提交。

### [U4] Change-level roster summary
- 关联需求: [R8]
- 模块边界:
  - `openspec/changes/2026-04-28-subagent-roster-lifecycle-policy/subagent-roster.md`
- 验证方式: 静态读取 summary，确认记录本 change 的 subagent 使用摘要，且不替代 gates。
- 知识沉淀: change 级 Markdown 用于人类审计，`.opsx` JSON 用于运行期调度。

## 决策

- 使用“.opsx 运行态 JSON + 会话内软 roster”的组合。会话内 roster 仍是实时决策来源；`.opsx/subagents/<session-id>.json` 作为可覆盖的运行态镜像，用于调试和 helper 演进；无法取得稳定 session id 时使用 `.opsx/subagents/current.json`；JSON 结构必须包含 `version` 字段，便于后续 helper 演进兼容。
- 将人类可读摘要放到 `openspec/changes/<change>/subagent-roster.md`，不混入 `audit-log.md`，因为它不是 gate 结果。
- reviewer 默认不复用，完成并被主 agent 消费后关闭。原因是 gate/release 审查需要独立性。
- explorer / maintenance worker 可以条件复用。原因是同模块连续调查或知识维护复用上下文有价值。
- capacity policy 要求 spawn 前 cleanup，且 spawn 失败后只允许清理 completed no-reuse agents 并重试一次。running agent 不应为释放容量被随意关闭。

## 风险 / 权衡

- [风险] 没有真实 list-all API，roster 可能和 UI 状态不完全一致。  
  缓解措施: 明确 roster 来源只包括主 agent 可观测的工具返回和通知；未知 agent 不作为可管理资源。
- [风险] 复用 agent 会继承旧上下文和偏见。  
  缓解措施: gate reviewer 默认不复用；高风险或 scope 变化时关闭重建。
- [风险] contract 继续变长。  
  缓解措施: 本次只加 lifecycle policy；后续如果继续增长，可迁移到 `skills/opsx-subagent/references/lifecycle.md`。
- [风险] 运行态 JSON 被误当成 gate 事实。  
  缓解措施: contract 明确 `.opsx/subagents/*.json` 不作为 gate 依据，并通过 `.gitignore` 排除。

## 知识沉淀

- `.aiknowledge/codemap/openspec-skills.md` 归档后应记录 `opsx-subagent` 同时维护 dispatch policy 和 roster lifecycle policy。
- `.aiknowledge/pitfalls/misc/subagent-platform-mapping-central-contract.md` 可在归档后扩展：平台映射、模型分发、lifecycle 都属于 central contract，不能分散到各 workflow skill。
