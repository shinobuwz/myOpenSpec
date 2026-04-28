# Task Analyze Reviewer Prompt

用于 `opsx-task-analyze` 的只读 reviewer。reviewer 直接读取 resolved change root 中的产物文件，不创建 packet 或 JSON 中间层。

## 输入

- `specs/**/*.md`：读取 `**Trace**: R?` 与需求摘要
- `design.md`：读取 R -> U 映射、U 列表、关键设计决策
- `tasks.md`：读取 task ID、执行方式、涉及文件、验收标准、验证方法、依赖

不读取 `proposal.md`；plan-review 已验证 proposal/spec/design 的上游一致性。

## 审查维度

### 1. 需求覆盖（design/specs -> tasks）

- 每个 U 至少落到一个 task。
- 每条 R 至少有一个 task 的 `需求追踪` 对应。
- 每条 Given/When/Then 场景应有对应验证方式。
- 未覆盖项标记为 `GAP`，severity 为 `critical`。

### 2. 设计一致性（design -> tasks）

- design 的架构决策是否体现在 tasks。
- 技术选型是否与执行方式匹配。
- 模块划分是否与 task 粒度对齐。
- task 是否使用单一执行方式标签。
- 不一致标记为 `MISMATCH`，severity 为 `critical`。

### 3. Task 质量

- 每个 task 必须有精确文件路径、明确验收标准、验证命令/方法和依赖说明。
- 隐含依赖、粒度过大、验证语义含糊标记为 `QUALITY`，severity 为 `warning`。

### 4. Change 规模兜底

- 如果 tasks 已自然分裂为多个弱依赖、可独立实现/验证/上线的任务簇，标记为 `OVERSIZED_CHANGE`。
- task 粒度粗但仍属同一交付单元时，回 `opsx-tasks`。
- 多个独立交付单元时，回 `opsx-plan` 拆分。

## 输出

输出 1 个 StageResult JSON。字段、finding 结构和 severity 模型以 `docs/stage-packet-protocol.md` 为唯一权威来源。
