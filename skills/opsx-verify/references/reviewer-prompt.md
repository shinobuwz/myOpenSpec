# Verify Reviewer Prompt

用于 `opsx-verify` 的只读 reviewer。reviewer 直接读取 resolved change root 中的产物和 task 声明的文件，不创建 packet 或 JSON 中间层。

## 输入

- `tasks.md`
- `specs/**/*.md`（如存在）
- `design.md`（如存在）
- `test-report.md`（如存在）
- `tasks.md` 中"涉及文件"列出的代码、测试、skill、docs 文件

`target_kind: fast` 时读取 fast artifacts：`item.md`、`evidence.md`、`root-cause.md`（如存在）、`test-report.md` 和相关 diff；不要求 specs/design/tasks 或 formal artifacts。

## 审查维度

### 0. Spec Compliance Review (`VERIFY_SPEC_COMPLIANCE`)

对照 proposal、specs、design、tasks 和实现文件，确认实现满足当前 OpenSpec change。

检查：
- 每个需求是否有实现证据。
- 每个已完成 task 是否有代码或文档证据。
- 是否存在明显范围外实现。
- 是否存在需求遗漏、设计决策未落实、人工验收状态不清。

需求缺口、范围外实现、完成任务无证据均为 `critical`。

### 1. 完整性 (`VERIFY_COMPLETENESS`)

- 统计 `tasks.md` 中 `[x]` 与 `[ ]` 的任务完成度。
- 未完成 task 生成 `critical` finding。
- 从 specs 获取需求列表，并在实现文件中寻找证据。

### 2. 正确性 (`VERIFY_CORRECTNESS`)

- 无 specs 时在 summary 中注明跳过；fast target 没有 specs 属于正常情况。
- 有 specs 时读取需求场景，通过实现文件验证行为证据。

### 3. 一致性 (`VERIFY_CONSISTENCY`)

- 无 design 时在 summary 中注明跳过；fast target 没有 design 属于正常情况。
- 有 design 时检查关键决策是否被实现遵循。

### 4. 测试留档 (`VERIFY_TEST_REPORT`)

- 统计 `[test-first]` 与 `[characterization-first]` task。
- 无 TDD task 时注明 `No TDD tasks — test-report.md check skipped`。
- 有 TDD task 时检查 `test-report.md` 是否存在。
- 每个 `### ♻️ 重构阶段` 必须包含覆盖率字段。
- 裸 `N/A` 覆盖率是 `critical`；数字覆盖率缺少命令或产物引用是 `suggestion`。

### 5. 人工验证 (`VERIFY_MANUAL`)

- 扫描 tasks 中所有 `[manual]` 验收标准。
- 无 manual 项时注明 `No manual ACs`。
- 有 manual 项时检查 `test-report.md` 的待人工验证清单，并统计已勾选 / 未勾选数量。
- 未勾选 manual 项为 `warning`，提示需人工验证后方可确认完整性。

## 输出

输出 1 个 StageResult JSON。字段、finding 结构和 severity 模型以 `docs/stage-packet-protocol.md` 为唯一权威来源。不确定时倾向 `suggestion`，再考虑 `warning`，最后才是 `critical`。
