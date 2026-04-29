## ADDED Requirements

### 需求:Subagent 契约必须定义会话内 roster
**Trace**: R1
**Slice**: opsx-subagent/roster-source
OPSX subagent 契约必须要求主 agent 在当前会话内维护 Agent Roster，用于记录已派发 subagent 的 id、昵称、dispatch class、scope、写入范围、状态、复用策略和关闭策略。

#### 场景:Codex 没有通用状态列表接口
- **当** 主 agent 需要判断当前有哪些 subagent
- **那么** 契约必须说明当前可用工具没有通用 list-all subagents API，不能依赖事后查询全量状态

#### 场景:roster 基于工具返回值维护
- **当** 主 agent 调用 `spawn_agent`、`wait_agent`、接收 subagent notification 或调用 `close_agent`
- **那么** 主 agent 必须用这些结果更新会话内 roster

### 需求:Subagent 契约必须定义 pre-spawn 检查
**Trace**: R2
**Slice**: opsx-subagent/pre-spawn
OPSX subagent 契约必须要求每次派发新 subagent 前先执行 pre-spawn check，避免已有 completed agent 占满线程、避免错过复用机会。

#### 场景:派发前检查支持状态和容量
- **当** workflow skill 准备派发新 subagent
- **那么** 主 agent 必须先检查 subagent support、running agents、completed reusable agents、completed no-reuse agents 和 capacity pressure

#### 场景:容量压力下先清理再派发
- **当** roster 中已有 completed 且无复用价值的 subagent
- **那么** 主 agent 必须优先 close 这些 subagent，再派发新的 subagent

### 需求:Subagent 契约必须定义复用策略
**Trace**: R3
**Slice**: opsx-subagent/reuse-policy
OPSX subagent 契约必须按 dispatch class 定义默认复用策略，避免把 gate reviewer 的旧上下文复用于新的独立审查，同时允许同模块连续探索或维护复用上下文。

#### 场景:explorer 和 maintenance worker 可以条件复用
- **当** 新任务与已有 `retrieval-explorer` 或 `maintenance-worker` 的模块、scope 和只读/授权写入边界一致
- **那么** 主 agent 可以复用该 subagent

#### 场景:gate reviewer 默认不复用
- **当** 新任务是 plan-review、task-analyze、verify 或 release-risk review
- **那么** 主 agent 必须默认新建只读 reviewer，避免前一轮审查上下文污染独立判断

#### 场景:需要干净上下文时关闭重建
- **当** 新任务高风险、scope 变化明显或旧 agent 可能携带错误假设
- **那么** 主 agent 必须 close 旧 agent 并新建，而不是发送“忘掉之前”之类不可靠指令

### 需求:Subagent 契约必须定义关闭策略
**Trace**: R4
**Slice**: opsx-subagent/close-policy
OPSX subagent 契约必须定义 completed subagent 何时保留、何时关闭，确保线程资源及时释放且不丢失必要上下文。

#### 场景:reviewer 结果被消费后关闭
- **当** reviewer 的 StageResult 或 review result 已被主 agent 写入 `audit-log.md`、`.openspec.yaml` gates 或 `review-report.md`
- **那么** 主 agent 必须关闭该 reviewer，除非同一 reviewer 明确被标记为可复用且不影响独立性

#### 场景:explorer 结论被消费后按复用价值决定
- **当** explorer 的调查结论已被主 agent 汇总进用户可见结论或产物
- **那么** 主 agent 必须在同模块马上继续调查时保留，否则关闭

#### 场景:用户明确要求清理
- **当** 用户明确要求清理、收工或释放 subagent
- **那么** 主 agent 必须关闭所有非必要 subagent

### 需求:Subagent 契约必须定义容量策略
**Trace**: R5
**Slice**: opsx-subagent/capacity-policy
OPSX subagent 契约必须定义线程上限或 spawn 失败时的处理顺序，避免等待到 spawn 失败后才无序批量关闭 agent。

#### 场景:接近上限时先做 pre-spawn cleanup
- **当** 主 agent 判断 roster 中已有多个 completed subagent 或最近发生线程上限错误
- **那么** 主 agent 必须先关闭 completed no-reuse agents，再重试派发

#### 场景:running agent 不应被随意关闭
- **当** 容量压力存在但 agent 仍在 running
- **那么** 主 agent 必须优先等待、串行化或询问用户，不得为了释放容量随意关闭仍在执行的 subagent

### 需求:Roster lifecycle 必须有测试保护
**Trace**: R6
**Slice**: tests/subagent-roster
OPSX 必须用 workflow discipline 测试保护 `opsx-subagent` 中的 roster lifecycle、pre-spawn、reuse、close 和 capacity policy。

#### 场景:测试覆盖 lifecycle 关键字
- **当** 执行 workflow discipline 测试
- **那么** 测试必须检查 `opsx-subagent` 包含 Agent Roster、Pre-Spawn Check、Reuse Policy、Close Policy、Capacity Policy、无 list-all API、`spawn_agent`、`wait_agent`、notification 和 `close_agent` 等规则

### 需求:运行态 roster 必须使用 .opsx 临时 JSON
**Trace**: R7
**Slice**: opsx-subagent/runtime-roster-json
OPSX subagent 契约必须规定运行态 roster JSON 的路径、用途和版本字段；该 JSON 只能作为运行期调度辅助，不得作为 OpenSpec gate 依据。

#### 场景:运行态 roster 写入 .opsx
- **当** 主 agent 需要持久化当前会话 subagent roster
- **那么** 契约必须规定写入 `.opsx/subagents/<session-id>.json`，无法取得稳定 session id 时可使用 `.opsx/subagents/current.json`

#### 场景:运行态 JSON 不进入 git
- **当** `.opsx/subagents/*.json` 记录会话 id、agent id 或临时状态
- **那么** 仓库必须忽略这些 JSON 文件，避免将运行态状态提交

#### 场景:运行态 JSON 不作为 gate
- **当** plan-review、task-analyze、verify 或 review 判断 change 状态
- **那么** 不得把 `.opsx/subagents/*.json` 作为 gate 通过依据

### 需求:Change 内必须支持 subagent roster 摘要
**Trace**: R8
**Slice**: openspec-change/subagent-roster-summary
OPSX subagent 契约必须规定每个使用 subagent 的 OpenSpec change 可以记录人类可读的 `subagent-roster.md` 摘要，用于归档本 change 的关键 spawn/reuse/close 事件。

#### 场景:change 摘要记录关键事件
- **当** subagent 被用于某个 OpenSpec change 的探索、实施、验证或审查
- **那么** 主 agent 可以在 `openspec/changes/<change>/subagent-roster.md` 记录关键 spawn、reuse、close 和 capacity 事件摘要

#### 场景:change 摘要不替代 gate 产物
- **当** `subagent-roster.md` 存在
- **那么** 它不得替代 `audit-log.md`、`review-report.md`、`test-report.md` 或 `.openspec.yaml` gates
