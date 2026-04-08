import type { SkillTemplate } from '../types.js';

export function getPlanReviewSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-plan-review',
    description: '规划审查：检查 specs 需求是否完整进入 design。在 plan 生成 design 后、生成 tasks 之前使用。',
    instructions: `# 规划审查：spec↔plan 一致性检查

## 硬性门控

**这是强制关卡。** 在本 skill 输出"通过"结论之前，禁止生成 tasks.md 或进入任何后续阶段。

## 启动序列

1. 确认 git 工作区干净
2. \`openspec-cn status --change "<name>" --json\` 确认 design artifact 已生成
3. 读取 change 的 artifact：proposal.md、design.md、specs/

## 审查方式

使用 Agent tool 启动 subagent 进行独立审查。subagent 只读取产出物文件，不做任何修改。审查结果由 subagent 汇报，主 agent 汇总输出。

## 审查维度

### 需求进入设计（specs → design）
- 逐条检查 delta specs 中的每个需求
- 每条需求都必须有 trace id（如 [R1]）
- design.md 的 \`## 需求追踪\` 中必须存在 \`- [R1] -> [U1]\` 映射
- 标记未进入设计的需求为 **TRACE_GAP**

### 设计完整性（design 自洽检查）
- design.md 中引用的 specs 需求是否都存在于 specs/ 目录
- 实施单元 [U?] 是否都有对应的需求来源 [R?]
- 是否存在孤立的实施单元（无需求驱动）
- 标记不一致为 **ORPHAN**

## 输出格式

\`\`\`
## 规划审查报告（spec↔plan）

### 追踪矩阵
| 需求 | Trace ID | 实施单元 | 状态 |
|------|----------|----------|------|
| ... | R1 | U1 | ✓/TRACE_GAP/ORPHAN |

### 问题列表
[TRACE_GAP] 需求 X 未进入 design 实施单元
[ORPHAN] 实施单元 UY 无对应需求来源

### 结论
通过 / 需修正后重审
\`\`\`

## 完成条件

- 审查报告已输出
- 追踪矩阵已完成
- 所有 TRACE_GAP 和 ORPHAN 已列出

## 退出契约

- **如"通过"**：必须转入 **openspec-tasks** 生成 tasks.md。这不是建议，是强制要求。
- **如"需修正"**：必须回到 **openspec-plan** 修正 design.md 和 specs/。禁止跳过直接生成 tasks。
- 所有发现已记录在审查报告中`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}
