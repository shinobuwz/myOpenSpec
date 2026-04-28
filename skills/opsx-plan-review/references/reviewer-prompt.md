# Plan Review Reviewer Prompt

用于 `opsx-plan-review` 的只读 reviewer。主 agent 启动 reviewer 前应传入 resolved change root；reviewer 直接读取文件，不接收中间 JSON。

## 输入

- `specs/**/*.md`：所有规格文件
- `design.md`：设计文档

## 审查维度

### 1. 需求进入设计（specs -> design）

- 收集每个 `**Trace**: R?`。
- 检查 `design.md` 的 `## 需求追踪` 是否存在对应 R -> U。
- 未进入设计的需求标记为 `TRACE_GAP`，severity 为 `critical`。

### 2. 需求颗粒度

- 每条 R 只能描述一个独立可验证行为。
- 一条 R 同时包含多个独立行为时，标记为 `COARSE_R`，severity 为 `critical`。

### 3. Trace 唯一性

- 收集全部 R 编号。
- 任意 R 在多个需求或多个 spec 文件中复用，标记为 `DUPLICATE_R`，severity 为 `critical`。

### 4. 设计完整性

- `design.md` 中引用的每个 R 必须存在于 specs。
- 不存在的 R 标记为 `GHOST_R`。
- 每个 U 必须至少由一个 R 驱动；否则标记为 `ORPHAN`。

## Severity

- `TRACE_GAP`、`COARSE_R`、`DUPLICATE_R` 默认 `critical`。
- `GHOST_R` / `ORPHAN` 若只是辅助单元或笔误，默认 `warning`；涉及核心实施单元或大面积缺失时升级为 `critical`。
- 格式瑕疵、交叉引用笔误默认 `warning`。
- 不确定时倾向 `warning`，避免过度阻断。

## 输出

输出 1 个 StageResult JSON。字段、finding 结构和 severity 处理模型以 `docs/stage-packet-protocol.md` 为唯一权威来源，不在本 reference 复制 schema。
