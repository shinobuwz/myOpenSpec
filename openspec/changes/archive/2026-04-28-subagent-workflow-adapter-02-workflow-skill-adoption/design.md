# Workflow Skill Adoption Design

## 上下文

`01-subagent-contract` 已归档，并提供 `skills/opsx-subagent/SKILL.md` 作为 canonical subagent contract。当前多个 workflow skill 仍直接描述 "Agent tool"、Claude Code `Task` / `subagent_type` 或本地复制的派发规则，容易导致 Codex 默认语义、Claude 兼容语义和 stage owner 边界漂移。

本 subchange 只做 adoption：把各 workflow skill 的 subagent 文案收敛为引用 `opsx-subagent`，并保留每个 stage 自己的输入、输出、gate 和产物责任。

## 目标 / 非目标

**目标：**
- 让 `opsx-implement`、`opsx-plan-review`、`opsx-task-analyze`、`opsx-verify`、`opsx-review`、`opsx-explore`、`opsx-archive` 引用中央 subagent contract。
- 保留 StageResult、audit-log、review-report、test-report 和 `.openspec.yaml` gates 的现有 owner。
- 用 deterministic tests 防止 touched skill 回退到 Claude-only 或无 controller 边界的 subagent 文案。

**非目标：**
- 不改变 reviewer 数量。
- 不允许 implementation tasks 自动并行。
- 不改变 StageResult schema。
- 不改变 `.openspec.yaml` gate 名称或含义。
- 不重写已归档 change 的历史产物。

## 需求追踪

- [R1] -> [U1] [U2] [U3] [U4] [U5] [U6]
- [R2] -> [U1]
- [R3] -> [U2]
- [R4] -> [U3]
- [R5] -> [U4]
- [R6] -> [U5]
- [R7] -> [U6]

## 实施单元

### [U1] 更新 implementation worker adoption
- 关联需求: [R1] [R2]
- 模块边界: `skills/opsx-implement/SKILL.md`
- 设计: 将 implementation worker 派发说明改为引用 `opsx-subagent`，明确主 agent 仍负责 gate 校验、`tasks.md` / `test-report.md` 状态整合和最终完成声明。本 subchange 不引入多 worker 并行策略。
- 验证方式: deterministic test 检查 `opsx-implement` 引用 `opsx-subagent`，保留 TDD、任务验收标准同步和 verify exit contract。

### [U2] 更新 StageResult reviewer gate adoption
- 关联需求: [R1] [R3]
- 模块边界: `skills/opsx-plan-review/SKILL.md`, `skills/opsx-task-analyze/SKILL.md`, `skills/opsx-verify/SKILL.md`
- 设计: 三个 reviewer gate 统一引用 `opsx-subagent` reviewer contract；保留各自审查维度和 StageResult JSON 输出要求。主 agent 仍是 `audit-log.md` 和 gates 的唯一写入方。
- 验证方式: deterministic test 检查三类 gate skill 均引用中央 contract，且 StageResult / audit-log gate 规则仍存在。

### [U3] 更新 release-risk review adoption
- 关联需求: [R1] [R4]
- 模块边界: `skills/opsx-review/SKILL.md`
- 设计: 将 subagent 审查说明改为引用 central reviewer contract；保留 "verify owns compliance, review owns release risk" 边界和 `VERIFY_DRIFT` 路由。
- 验证方式: deterministic test 检查 review 不重新承担完整 spec compliance，并保留 `VERIFY_DRIFT`。

### [U4] 更新 explorer adoption
- 关联需求: [R1] [R5]
- 模块边界: `skills/opsx-explore/SKILL.md`
- 设计: 大范围调查时的 explorer 派发改为引用 `opsx-subagent` explorer contract；保留 codemap-first、pitfalls index-first、只读边界和普通文本问询 fallback。
- 验证方式: deterministic test 检查 explorer 派发引用中央 contract，并保留 codemap-first 搜索协议和 request_user_input fallback 文案。

### [U5] 更新 archive follow-up adoption
- 关联需求: [R1] [R6]
- 模块边界: `skills/opsx-archive/SKILL.md`
- 设计: 归档后的 knowledge / codemap 后续 worker 改为引用 `opsx-subagent` controller / write-boundary contract；明确 archive 自身仍负责目录移动和父 group route 更新，后续 worker 只处理授权的 `.aiknowledge/` 写入。
- 验证方式: deterministic test 检查 archive 文案引用中央 contract，且 grouped subchange archive 规则仍要求顶层 archive 和父 group 路由收敛。

### [U6] 增加 adoption 回归测试
- 关联需求: [R1] [R7]
- 模块边界: `tests/workflow-discipline.test.mjs`
- 设计: 扩展 workflow discipline tests，集中断言 touched skills 引用 `opsx-subagent`，不存在无 contract 的 Claude-only subagent 派发文案，并保留 verify/review 责任分离。
- 验证方式: `node --test tests/workflow-discipline.test.mjs` 与 `npm test`。

## 决策

- **引用 contract，而不是复制 contract**：目标是减少漂移；每个 workflow skill 只保留本 stage 独有的职责和输出格式。
- **Stage owner 不变**：reviewer 可以产出 StageResult，但 gates、audit-log 和用户可见通过结论仍由主 agent 写入。
- **串行实现策略不变**：并行 worker 策略留给 `03-parallel-worker-policy`；本 subchange 不扩大 implement 并发能力。
- **group focus 是路由提示，不是互斥锁**：parent group 可以并行存在多个 subchange，实际完成状态属于各 subchange 的 `.openspec.yaml` gates 和产物；`active_subchange` / `suggested_focus` 只是 `opsx changes resolve` 的默认焦点。

## 风险 / 权衡

- 如果只删除旧文案而不补 contract 引用，使用者会不知道 Codex/Claude 映射在哪里；因此每个 touched skill 必须显式提到 `opsx-subagent`。
- 如果 adoption 时顺手改变 worker 数量或 gate owner，会把 `02` 扩成策略变更；这些留给 `03`。
- 如果 tests 只检查单个 skill，后续某个 workflow skill 可能回流 Claude-only wording；因此测试应覆盖所有 touched workflow skills。

## 知识沉淀

- 预计更新 `.aiknowledge/codemap/openspec-skills.md`，记录 workflow skills 已采用 central subagent contract。
- 如果实现中发现新的平台文案漂移模式，可复核或新增 `.aiknowledge/pitfalls/misc/subagent-platform-mapping-central-contract.md` 相关经验。
