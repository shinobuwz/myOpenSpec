import type { SkillTemplate } from '../types.js';

export function getTasksSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-tasks',
    description: '生成 tasks.md，将 design/specs 实施单元拆分为可测试任务。由 openspec-plan-review 退出契约触发，对用户透明。',
    instructions: `任务生成 Skill。生成 tasks.md，将 design/specs 中的实施单元拆分为可测试的独立任务。

## 启动序列

1. 确认 openspec-plan-review 已通过（spec↔plan 一致性已验证）
2. \`openspec-cn status --change "<name>" --json\` 确认 design artifact 已生成
3. 读取变更的全部 artifact：proposal.md、design.md、specs/

## 流程

### 生成 tasks.md

- 获取指令：\`openspec-cn instructions tasks --change "<name>" --json\`
- 读取 design.md 和 specs/ 获取上下文
- 按实施单元 [U?] 拆分任务，每个任务带 \`[R?][U?][test-first|characterization-first|direct]\` 标签
- 每个任务有精确文件路径和明确验证方式
- 任务按依赖关系排序，粒度不超过 2 小时工作量
- 写入 tasks.md

### 质量检查

- 每个实施单元 [U?] 至少对应一个 task
- 每个任务有明确验收标准
- 任务依赖关系清晰标注

### 提交

- 生成后单独提交到 git

## 完成条件

- tasks.md 已生成并获得用户确认
- tasks.md 已提交到 git

## 硬性门控

**在生成 tasks.md 后，必须转入 openspec-task-analyze 进行 plan↔tasks 审查。** 在 task-analyze 通过之前，禁止进入实施阶段。

## 退出契约

- 输出 tasks.md 的任务摘要（任务数、覆盖的实施单元列表）
- **必须**转入 **openspec-task-analyze** 审查 plan↔tasks 一致性。这不是建议，是强制要求。`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}
