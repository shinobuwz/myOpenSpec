# workflow-templates

## 职责
skill 模板生成，定义 plan-review 和 verify 等工作流的 prompt 指令。

## 入口
- `src/core/templates/workflows/plan-review.ts` — plan-review skill 模板
- `src/core/templates/workflows/verify.ts` — verify skill 模板 + opsx:verify 命令模板

## 关键导出

| 函数 | 文件 | 说明 |
|------|------|------|
| `getPlanReviewSkillTemplate()` | plan-review.ts | 返回 plan-review skill 的指令模板 |
| `getVerifySkillTemplate()` | verify.ts | 返回 verify skill 的指令模板 |
| `getOpsxVerifyCommandTemplate()` | verify.ts | 返回 opsx:verify 命令模板 |

## gate review 契约
- 所有 reviewer 共享同一个 `gateReview` facts bundle 作为事实底座
- reviewer 之间 blind：不得共享 findings、怀疑点或预设 severity
- arbiter 仅在 reviewer 结论冲突时触发，范围限定为冲突点

## 依赖
- `src/core/templates/types.ts` — SkillTemplate、CommandTemplate 类型
