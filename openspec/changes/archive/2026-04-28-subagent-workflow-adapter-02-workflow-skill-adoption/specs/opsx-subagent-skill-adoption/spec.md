## 新增需求

### 需求: Workflow skills must reference the central subagent contract
**Trace**: R1
**Slice**: opsx-subagent/skill-adoption
任何需要说明 subagent 派发、角色边界、写入边界、结果处理或平台适配的 OPSX workflow skill，必须引用 `opsx-subagent` canonical contract，而不是在本 skill 中维护另一套完整平台规则。

#### 场景: Skill dispatches a subagent
- **当** workflow skill 需要描述 implementation worker、reviewer worker 或 explorer 的派发方式
- **那么** skill 必须指向 `opsx-subagent` 作为 canonical contract，并只保留本 stage 特有的输入、输出和 gate 规则

### 需求: Implement skill must adopt the implementation worker contract
**Trace**: R2
**Slice**: opsx-subagent/implement-adoption
`opsx-implement` 必须引用 `opsx-subagent` 的 implementation worker 契约，同时保留现有 gate 前置条件、TDD 循环、`tasks.md` 状态更新和 `test-report.md` 留档规则。

#### 场景: Implement dispatches work
- **当** `opsx-implement` 派发 implementation worker
- **那么** worker 派发必须使用 `opsx-subagent` 的 Codex-first / Claude-compatible 映射，并由主 agent 继续负责 gates、任务状态和最终完成声明

### 需求: Reviewer gate skills must preserve StageResult ownership
**Trace**: R3
**Slice**: opsx-subagent/reviewer-adoption
`opsx-plan-review`、`opsx-task-analyze` 和 `opsx-verify` 必须引用 `opsx-subagent` 的 reviewer contract，并继续要求 reviewer 输出 StageResult JSON；主 agent 仍是写入 `audit-log.md` 和 `.openspec.yaml` gates 的唯一 controller。

#### 场景: Reviewer stage completes
- **当** reviewer subagent 输出审查结果
- **那么** 结果必须能被主 agent 汇总为 StageResult / audit-log 证据，且 reviewer 不得直接写 gates

### 需求: Review skill must remain release-risk focused
**Trace**: R4
**Slice**: opsx-subagent/review-adoption
`opsx-review` 必须引用 `opsx-subagent` 的 reviewer contract，但仍只负责 code quality / release risk；完整 spec compliance 仍归 `opsx-verify` 所有，review 只在发现明显漂移时输出 `VERIFY_DRIFT`。

#### 场景: Review sees a compliance issue
- **当** `opsx-review` 发现明显需求遗漏、范围外实现或任务状态漂移
- **那么** 它必须输出 `VERIFY_DRIFT` 并路由回 `opsx-verify`，不得在 review 阶段重新承担完整 compliance gate

### 需求: Explore skill must adopt the explorer contract
**Trace**: R5
**Slice**: opsx-subagent/explorer-adoption
`opsx-explore` 在需要大范围调查时必须引用 `opsx-subagent` 的 explorer contract，同时保留 codemap-first 搜索协议、只读边界和交互问询降级规则。

#### 场景: Explore needs broad codebase investigation
- **当** `opsx-explore` 需要跨文件搜索或调查模块结构
- **那么** explorer 派发必须指向 `opsx-subagent`，并且仍先读取 codemap/pitfalls 再决定搜索范围

### 需求: Archive follow-up workers must adopt the central contract
**Trace**: R6
**Slice**: opsx-subagent/archive-adoption
`opsx-archive` 在归档后触发 knowledge / codemap 后续 worker 时，必须引用 `opsx-subagent` 的 controller 和写入边界，确保归档移动、group 路由更新、knowledge/codemap 写入各自有明确 owner。

#### 场景: Archive dispatches post-archive work
- **当** `opsx-archive` 归档 subchange 后触发 knowledge 或 codemap 后续处理
- **那么** 后续 worker 的写入范围必须限定在被授权的 `.aiknowledge/` 条目，不能改写归档产物或父 group route

### 需求: Tests must lock the adoption boundary
**Trace**: R7
**Slice**: opsx-subagent/adoption-tests
测试必须覆盖 touched workflow skills 对 `opsx-subagent` 的引用、Codex-first / Claude-compatible 边界、verify/review 职责分离，以及禁止只出现 Claude-only subagent wording 的回归。

#### 场景: Skill wording drifts back to Claude-only semantics
- **当** touched workflow skill 重新出现只描述 `Task` / `subagent_type` 而没有 central contract 或 Codex `spawn_agent` 映射的文案
- **那么** deterministic workflow discipline test 必须失败

## 修改需求

## 移除需求
