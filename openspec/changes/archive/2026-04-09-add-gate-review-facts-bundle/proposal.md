## 为什么

当前 `plan-review` 与 `verify` 依赖多个 subagent 独立审查，但每个 subagent 都要重复读取同一批 change 产出物与项目知识，导致 token 消耗高且 prompt 维护分散。需要一个第一版 gate review 框架，把共享事实抽成统一的 facts bundle，同时保留 blind review 带来的独立复核能力。

## 变更内容

- 为 `openspec instructions apply --json` 增加面向 gate review 的 `gateReview` facts bundle 输出，作为 run-scoped 共享事实输入。
- 为 change 引入可选的本地 context 声明层：`context/knowledge-refs.md`、`context/review-scope.md`、`context/artifact-index.md`，缺失时保持优雅降级。
- 调整 `plan-review` 和 `verify` 的工作流约定：subagent 共享 facts bundle，但彼此 blind；`verify` 在 reviewer 结论冲突时可触发可选 arbiter。
- 第一版只覆盖 gate review 场景，不扩展到 explore / implement / review 等其他工作流。

## 功能 (Capabilities)

### 新增功能
- `gate-review-framework`: 定义 change-local context、shared facts bundle、blind subagent 与可选 arbiter 的第一版 gate review 框架。

### 修改功能
- `cli-artifact-workflow`: `instructions apply --json` 需要输出 gate review 所需的共享事实字段与 change-local context 信息。
- `opsx-verify-skill`: verify 需要基于共享 facts bundle 组织 blind reviewers，并在冲突时支持 arbiter。

## 影响

- `src/commands/workflow/shared.ts`
- `src/commands/workflow/instructions.ts`
- `src/core/templates/workflows/plan-review.ts`
- `src/core/templates/workflows/verify.ts`
- `test/commands/artifact-workflow.test.ts`
- `openspec/changes/<change>/context/` 下的可选上下文文件约定
