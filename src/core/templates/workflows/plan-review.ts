import type { SkillTemplate } from '../types.js';

export function getPlanReviewSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-plan-review',
    description: '规划审查：检查 tasks 是否完整覆盖 specs 需求、是否与 design 一致。在 plan→tasks 生成后、implement 之前使用。',
    instructions: `# 规划审查：plan↔tasks 一致性检查

## 启动序列

1. 确认 git 工作区干净
2. \`openspec-cn status --change "<name>" --json\` 确认 tasks artifact 已生成
3. 读取 change 的全部 artifact：proposal.md、design.md、specs/、tasks.md

## 审查维度

### 需求覆盖（specs → tasks）
- 逐条检查 delta specs 中的每个需求
- 每条需求必须有至少一个 task 对应
- 每条 Given/When/Then 场景必须有对应的验证方式
- 标记未覆盖的需求为 **GAP**

### 设计一致性（design → tasks）
- design.md 中的架构决策是否在 tasks 中体现
- 技术选型是否与 task 实施方式匹配
- 模块划分是否与 task 粒度对齐
- 标记不一致为 **MISMATCH**

### tasks 质量检查
- 每个 task 是否有精确文件路径
- 每个 task 是否有明确的验证方式
- task 之间是否有隐含依赖未标注
- task 粒度是否合理（过大需拆分，过小可合并）
- 标记问题为 **QUALITY**

## 输出格式

\`\`\`
## 规划审查报告

### 覆盖矩阵
| 需求 | 对应 Task | 状态 |
|------|----------|------|
| ... | Task N | ✓/GAP |

### 问题列表
[GAP] 需求 X 无对应 task
[MISMATCH] design 决策 Y 与 task Z 实施方式冲突
[QUALITY] Task W 缺少验证方式

### 结论
可实施 / 需补充后实施
\`\`\`

## 完成条件

- 审查报告已输出
- 覆盖矩阵已完成
- 所有 GAP 和 MISMATCH 已列出

## 退出契约

- 如"可实施"，建议转入 **openspec-implement**
- 如"需补充"，建议回到 **openspec-plan** 修正 tasks.md
- 所有发现已记录在审查报告中`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}
