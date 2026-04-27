## 上下文

OpenSpec 主流程已经变成强门控链路：

`explore → slice → plan → plan-review → tasks → task-analyze → implement → verify → review → archive`

`opsx-ff` 原本试图快速生成规划产物并继续推进实施，但在强门控存在后，它和主流程竞争，且容易被误用为“跳过流程”。用户需要的是另一类能力：小改动快速执行，但仍留下可追溯事实。

## 目标 / 非目标

**目标：**
- 用 `opsx-lite` 替换 `opsx-ff`。
- 为小改动提供轻量流程和升级边界。
- 引入 `.aiknowledge/lite-runs/` 事实留档，用作 `source_refs`。
- 更新 docs/codemap，消除旧 `ff` 引用。

**非目标：**
- 不实现新的 CLI runtime 命令。
- 不改变 `opsx changes` 状态机。
- 不让 lite-run 拥有 proposal/design/spec/tasks/gates。

## 需求追踪

- [R1] -> [U1]
- [R2] -> [U1]
- [R3] -> [U2]
- [R4] -> [U2]
- [R5] -> [U3]

## 实施单元

### [U1] opsx-lite skill
- 关联需求: [R1], [R2]
- 模块边界:
  - `skills/opsx-ff/SKILL.md`
  - `skills/opsx-lite/SKILL.md`
- 验证方式: 检查旧 `opsx-ff` 文件被移除或替换，`opsx-lite` 明确轻量流程、适用范围和升级规则。
- 知识沉淀: 快速入口不能绕过主流程；它必须有清晰升级条件。

### [U2] lite-run 事实留档
- 关联需求: [R3], [R4]
- 模块边界:
  - `.aiknowledge/README.md`
  - `.aiknowledge/lite-runs/README.md`
  - `.aiknowledge/logs/2026-04.md`
- 验证方式: 检查 lite-run 模板包含 Intent/Scope/Changes/Verification/Risks/Knowledge，且说明可作为 `source_refs`。
- 知识沉淀: lite-run 记录事实，不承担规划或门控。

### [U3] 引用更新
- 关联需求: [R5]
- 模块边界:
  - `README.md`
  - `docs/workflows.md`
  - `docs/supported-tools.md`
  - `docs/concepts.md`
  - `skills/opsx-explore/SKILL.md`
  - `.aiknowledge/codemap/openspec-skills.md`
- 验证方式: `rg "opsx-ff|plan / ff|一次性推进完整规划"` 不应命中当前 active docs/skills/codemap，历史 archive 除外。
- 知识沉淀: workflow 改名时必须清理文档和 codemap，否则 agent 会继续触发旧入口。

## 决策

1. 保留轻量入口但改名为 `opsx-lite`。理由是 `ff` 语义不清，且容易暗示 fast-forward 或跳过流程。
2. `opsx-lite` 不创建 OpenSpec change。理由是它服务小改动，如果仍强制 proposal/design/spec/tasks，会退化成主流程别名。
3. `lite-run` 放在 `.aiknowledge/lite-runs/YYYY-MM/`。理由是它是事实留档，可作为长期知识来源，但不属于正式 change。
4. `lite-run` 不参与 `opsx changes status`。理由是 changes runtime 只负责正式 OpenSpec change。

## 风险 / 权衡

- 轻量流程可能被误用于大改动；通过升级规则和禁止条件缓解。
- `opsx-lite` 没有 gates，质量依赖验证命令和 diff review；因此必须强制记录 Verification 和 Risks。
- 删除 `opsx-ff` 可能影响已有习惯；通过 docs 和 codemap 明确迁移到 `opsx-lite`。

## 知识沉淀

归档时应沉淀：轻量 workflow 需要事实留档，但不能复制正式 change 的规划门控，否则会失去轻量价值。
