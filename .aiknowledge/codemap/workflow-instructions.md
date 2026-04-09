# workflow-instructions

## 职责
artifact workflow 的 apply 指令生成，包括 gate review facts bundle 的构建。

## 入口
- `src/commands/workflow/instructions.ts` — apply 指令生成命令
- `src/commands/workflow/shared.ts` — 共享类型（GateReviewFacts、ApplyInstructions、TaskItem）

## 关键函数

| 函数 | 文件 | 说明 |
|------|------|------|
| `generateApplyInstructions()` | instructions.ts | 生成 schema 感知的 apply 指令 JSON |
| `buildGateReviewFacts()` | instructions.ts | 构建 gate review 共享事实包 |
| `getContextDeclaration()` | instructions.ts | 读取 change-local context 声明文件 |
| `parseTasksFile()` | instructions.ts | 解析 tasks.md 提取任务状态 |

## 依赖
- `src/core/artifact-graph/` — schema 解析、change context 加载
- `src/utils/change-utils.ts` — 变更名称校验

## 测试
- `test/commands/artifact-workflow.test.ts` — 集成测试覆盖 apply 指令、gateReview facts、context 降级
