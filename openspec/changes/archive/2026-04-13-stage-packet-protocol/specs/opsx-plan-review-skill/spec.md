## 修改需求

### 需求:plan-review assembler 产出 PlanReviewPacket
**Trace**: R13
**Slice**: opsx-plan-review/assembler
`opsx-plan-review` 的主 agent 必须在启动审查前组装 `PlanReviewPacket`（StagePacket 的阶段特化），其 `core_payload` 包含：R 全集（编号 + 一行摘要）、R→U 追踪映射、U 标题列表、artifact 存在性标记（proposal / specs / design）。`optional_refs` 包含：各 spec 文件引用、design.md 引用、proposal.md 引用、命中的 codemap/pitfalls 引用。组装完成后必须校验 Packet Budget（R5）。

#### 场景:正常组装 PlanReviewPacket
- **当** change 目录包含 proposal.md、specs/、design.md
- **那么** assembler 输出的 PlanReviewPacket 的 `core_payload` 包含完整的 R 集合和 R→U 映射
- **并且** `optional_refs` 包含所有存在的产出物文件引用

#### 场景:packet 超过 budget
- **当** 组装后的 PlanReviewPacket 超过 soft_limit 但未超 hard_limit
- **那么** assembler 记录警告，并可选择执行预降维
- **并且** 如执行了预降维，则记录 `budget.truncated_fields`

#### 场景:packet 超过 hard_limit
- **当** 组装后的 PlanReviewPacket 超过 hard_limit
- **那么** assembler 必须按 R5 定义的降维顺序截断后再发送
- **并且** 记录 `budget.truncated_fields`

### 需求:plan-review reviewer 输出 StageResult
**Trace**: R14
**Slice**: opsx-plan-review/reviewer-result
`opsx-plan-review` 的每个 reviewer subagent 必须输出符合 StageResult schema（R2）的结构化结果。`agent_role` 必须标明维度（trace-reviewer / granularity-reviewer / uniqueness-reviewer / design-integrity-reviewer）。findings 中的 `dimension` 必须使用对应的标签（TRACE_GAP / COARSE_R / DUPLICATE_R / GHOST_R / ORPHAN）。

#### 场景:trace-reviewer 发现缺失追踪
- **当** trace-reviewer 发现 R3 在 design 中无 U 映射
- **那么** StageResult.findings 包含一条 `{trace_id: "R3", severity: "critical", dimension: "TRACE_GAP", message: "..."}`

#### 场景:所有维度无问题
- **当** 所有 reviewer 均未发现问题
- **那么** 每个 StageResult 的 `decision` 为 "pass"，`findings` 为空数组

### 需求:plan-review 主 agent 汇总与门控
**Trace**: R15
**Slice**: opsx-plan-review/gate
`opsx-plan-review` 主 agent 必须收集所有 reviewer 的 StageResult，合并 findings，生成汇总报告。如所有 reviewer decision 均为 pass 或 pass_with_warnings 且无 critical finding，则写入 gate 并产出 RunReport 数据。如存在 critical finding，则不写入 gate，要求回 opsx-plan 修正。

#### 场景:通过门控
- **当** 无 critical findings
- **那么** 写入 `.openspec.yaml` 的 `gates.plan-review` 时间戳
- **并且** 将 PlanReviewPacket + 所有 StageResult 写入 RunReport 数据源

#### 场景:未通过门控
- **当** 存在 critical findings
- **那么** 不写入 gate，输出汇总报告列出所有问题
- **并且** 仍将 packet + results 写入 RunReport 数据源（状态为 fail）
