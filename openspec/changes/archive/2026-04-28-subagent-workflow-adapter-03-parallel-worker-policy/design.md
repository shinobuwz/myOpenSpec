# Parallel Worker Policy Design

## 上下文

`01-subagent-contract` 已提供 Codex 默认、Claude 兼容的 `opsx-subagent` canonical contract，`02-workflow-skill-adoption` 已让各 workflow skill 引用该 contract。当前 `opsx-implement` 仍明确写成单 worker 策略，这保证了安全性，但没有描述未来何时可以把 disjoint task clusters 交给多个 implementation workers。

本 subchange 定义保守并行策略：默认串行，只有在任务簇独立且写入边界可证明不重叠时，主 agent 才可以派发多个 worker。共享 workflow artifact 和 gate ownership 始终留在主 agent。

## 目标 / 非目标

**目标：**
- 在 `opsx-implement` 中定义 serial-by-default policy。
- 定义允许 parallel implementation workers 的全部必要条件。
- 定义必须保持串行的高风险文件和场景。
- 定义主 agent 在多 worker 结果整合中的 controller responsibilities。
- 增加 deterministic tests 防止策略文案漂移成默认并行或无边界并行。

**非目标：**
- 不构建 automatic task graph scheduler。
- 不新增 CLI dispatcher。
- 不允许 subagent 并行写 `tasks.md`、`test-report.md`、`.openspec.yaml`、`audit-log.md` 或 `review-report.md`。
- 不允许 subagent 标记 gates、verify、review 或 archive。

## 需求追踪

- [R1] -> [U1] [U4]
- [R2] -> [U2] [U4]
- [R3] -> [U3] [U4]

## 实施单元

### [U1] Establish serial-default implementation policy
- 关联需求: [R1]
- 模块边界: `skills/opsx-implement/SKILL.md`
- 设计: 将现有 "1 个 worker 实施全部任务" 扩展为 "默认串行" 策略。默认路径仍是一个 worker 或 inline fallback 按 tasks 顺序执行；只有后续并行资格检查全部满足，才允许多 worker。文案必须避免把多 worker 描述成常规或自动行为。
- 验证方式: deterministic test 检查 `opsx-implement` 包含 serial-by-default / 默认串行语义，并拒绝无条件多 worker 文案。
- 知识沉淀: 归档时更新 codemap，记录 `opsx-implement` 的并行策略是显式例外而非默认行为。

### [U2] Define conservative parallel eligibility
- 关联需求: [R2]
- 模块边界: `skills/opsx-implement/SKILL.md`
- 设计: 增加 "允许并行的必要条件"：任务簇独立、写入集合不重叠、无共享 public interface / migration / schema / config / package/build script 并发修改、每个 worker 有明确 file ownership。任何条件无法证明时回退串行。
- 验证方式: deterministic test 检查 skill 文案包含 disjoint write sets、explicit file ownership 和 high-risk serial fallback 约束。
- 知识沉淀: 如发现新高风险共享 artifact，可追加到同一策略段和测试断言。

### [U3] Preserve main-agent integration ownership
- 关联需求: [R3]
- 模块边界: `skills/opsx-implement/SKILL.md`
- 设计: 明确主 agent 串行整合 worker 结果：逐个检查 diff，串行更新 `tasks.md` / `test-report.md`，处理 `DONE_WITH_CONCERNS` / `NEEDS_CONTEXT` / `BLOCKED`，运行最终验证并继续 `opsx-verify`。worker 不写 gates，不宣称整个 change 完成。
- 验证方式: deterministic test 检查 `tasks.md`、`test-report.md`、`.openspec.yaml`、`audit-log.md`、`review-report.md` 被列为共享 artifact 串行写入，且最终 verify gate 仍保留。
- 知识沉淀: 复用 `opsx-subagent` controller boundary，不复制平台映射。

### [U4] Add workflow discipline regression tests
- 关联需求: [R1] [R2] [R3]
- 模块边界: `tests/workflow-discipline.test.mjs`
- 设计: 扩展现有 workflow discipline tests，添加一组只读 deterministic assertions：检查 serial default、parallel eligibility、shared artifact serial integration、gate retention 和禁止无边界多 worker 语义。
- 验证方式: `node --test tests/workflow-discipline.test.mjs` 与 `npm test`。
- 知识沉淀: 这类测试不调用模型，只测试 workflow skill 的静态契约是否稳定。

## 决策

- **默认串行，显式例外**：并行 worker 的收益只在 disjoint task clusters 中成立；默认并行会放大共享 artifact 竞争和 gate ownership 漂移。
- **条件必须全部满足**：只要 independence、write-set、ownership 或 dependency ordering 无法证明，就回到串行。
- **共享 artifact 永远串行**：`tasks.md`、`test-report.md`、`.openspec.yaml`、`audit-log.md`、`review-report.md` 是 workflow truth sources，不允许多个 worker 并行写。
- **主 agent 负责整合和 gates**：worker 局部完成不是 change 完成；最终状态只能由主 agent 基于 diff、测试、verify/review gates 转化为可归档结论。

## 风险 / 权衡

- 并行条件写得过宽会让实现 worker 争用同一 artifact；因此测试必须覆盖 shared artifact 禁止并行写。
- 并行条件写得过窄会降低效率，但不会破坏正确性；本 subchange 优先保证 workflow 安全。
- deterministic tests 只能验证文案契约，不能证明模型一定正确遵守；模型内表现仍由 `eval:subagent` smoke eval 和实际 trace evidence 补充验证。

## 知识沉淀

- 更新 `.aiknowledge/codemap/openspec-skills.md`，记录 `opsx-implement` 已从固定单 worker 扩展为 serial-by-default + explicit disjoint parallel eligibility。
- 如归档时发现新的复用经验，优先复核 `misc/subagent-platform-mapping-central-contract.md` 或新增 misc pitfall。
