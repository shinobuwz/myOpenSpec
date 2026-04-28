## ADDED Requirements

### 需求:Gate reviewer skills 必须迁出长 prompt 和 schema 正文
**Trace**: R1
**Slice**: gate-skill-slimming/reviewer-prompts
`opsx-plan-review`、`opsx-task-analyze`、`opsx-verify`、`opsx-review` 必须将完整 reviewer prompt、StageResult 示例、长审查维度说明和风险分类正文迁入 `references/` 或 canonical docs。

#### 场景: agent 打开 gate/reviewer skill 入口
- **当** agent 读取任一 gate/reviewer `SKILL.md`
- **那么** 入口文件只保留触发条件、前置 gate、读写边界、核心审查维度、失败路由和 reference 导航

### 需求:Gate hard rules 必须留在入口
**Trace**: R2
**Slice**: gate-skill-slimming/hard-rules-visible
瘦身后的 gate/reviewer `SKILL.md` 不得把硬门控、失败路由或完成声明前提只放入 references。

#### 场景: agent 未读取 references 即开始执行 gate
- **当** agent 只读取 `SKILL.md`
- **那么** 仍能看到 `plan-review`、`task-analyze`、`verify`、`review` 的前置条件、pass/fail 决策、gate 写入条件、audit/review report 写入责任和下一阶段路由

### 需求:StageResult 和 audit-log 契约必须引用 canonical doc
**Trace**: R3
**Slice**: gate-skill-slimming/stage-result-canonical
非 canonical skill 不得复制完整 StageResult schema 或 audit-log 协议正文。

#### 场景: gate skill 需要输出 reviewer 结构化结果
- **当** `SKILL.md` 需要描述 StageResult、finding 字段或 audit-log 格式
- **那么** 入口文件引用 `docs/stage-packet-protocol.md`，只保留本 stage 的差异和安全规则

### 需求:Subagent 平台映射必须引用 central contract
**Trace**: R4
**Slice**: gate-skill-slimming/subagent-canonical
会派发 reviewer/worker 的 workflow skills 必须引用 `opsx-subagent`，不得复制 Codex/Claude 平台映射表或另一套 controller boundary。

#### 场景: gate/reviewer skill 描述 subagent 派发
- **当** 入口文件提到 reviewer worker、implementation worker 或 archive follow-up worker
- **那么** 它只引用 `skills/opsx-subagent/SKILL.md` 的 contract，并保留本 stage 的输入、输出和写入边界

### 需求:Verify 和 review 职责边界必须保持不变
**Trace**: R5
**Slice**: gate-skill-slimming/verify-review-boundary
瘦身不得改变 `opsx-verify` 与 `opsx-review` 的职责分工。

#### 场景: agent 执行 verify 和 review
- **当** `opsx-verify` 已经完成 Spec Compliance Review
- **那么** `opsx-review` 只做 code quality / release risk review，发现明显需求漂移时输出 `VERIFY_DRIFT` 并路由回 verify
