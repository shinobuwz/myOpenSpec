/**
 * Bugfix Workflow Templates
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getBugfixSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-bugfix',
    description: '精简 bugfix 工作流。适用于明确缺陷的快速修复：定位问题、判断测试策略、修复、验证、归档并沉淀经验。',
    instructions: `执行精简 bugfix 工作流。目标是在保持 OpenSpec 合规制品的前提下，用最少步骤完成一个明确缺陷的修复。

## 适用条件

- 问题边界相对清晰
- 主要目标是修复缺陷，而不是扩展功能
- 不需要先做大范围需求脑暴或复杂方案比较

## 标准路径

定位问题 → 判断是否需要写测试 → 修复 → 验证 → 归档 → 经验总结

## 步骤

1. **确认 bug 描述**
   - 如果用户没有提供明确症状、期望行为或复现线索，先询问
   - 如果已有活跃 change 且明显对应当前 bug，优先继续该 change

2. **创建或复用 change**
   - 如果需要新建，使用简洁的 bugfix 名称，例如 \`fix-login-timeout\`
   - 运行：
   \`\`\`bash
   openspec-cn new change "<name>"
   \`\`\`

3. **最小合规规划**
   - 只创建修这个 bug 所需的最小 proposal / specs / design / tasks
   - proposal 要写清：问题现象、影响范围、修复边界
   - specs 只写当前 bug 对应的行为切片，使用细粒度 requirement，并添加 \`**Trace**: R<number>\`
   - design 保持最小：至少包含 \`## 需求追踪\` 和一个 \`[U1]\` 实施单元；如果没有架构变化，明确写 "无架构变更"
   - tasks 只拆到修复所需的 2-4 个任务，使用 \`[R?][U?][test-first|characterization-first|direct]\` 标签

4. **决定测试策略**
   - 如果 bug 可通过新增失败测试直接复现，使用 \`[test-first]\`
   - 如果是旧行为不清晰或回归缺陷，先用 \`[characterization-first]\` 固化现状
   - 仅纯样式、纯配置类缺陷使用 \`[direct]\`

5. **实施修复**
   - 优先阅读相关代码、日志、已有测试
   - 实施时保持改动最小，不顺手做无关重构
   - 完成后更新 tasks 复选框

6. **验证**
   - 运行与 bug 相关的测试或验证命令
   - 运行 \`openspec-cn validate <change-name> --type change\` 检查增量规格和 traceability
   - 如果修复无法被测试证明，明确说明验证依据

7. **归档**
   - 确认 specs 已同步或在 archive 时同步
   - 运行 \`/opsx:archive\` 对应流程，完成归档

8. **经验总结**
   - 在 \`openspec/knowledge/pitfalls/\`、\`patterns/\` 或 \`test-recipes/\` 中补一条最小经验
   - 至少记录：触发条件、根因、修法、验证方式、来源 change

## 护栏

- 不为简单 bugfix 强行走完整 brainstorm / plan-review / review 链路，除非修复过程中暴露出更大范围风险
- 不跳过 OpenSpec 制品，只把它们压缩到最小合规粒度
- 不因为是 bugfix 就默认跳过测试；先判断，再选择 test-first / characterization-first / direct
- 不扩展范围；如果修着修着变成功能开发，暂停并切回常规工作流
`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxBugfixCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Bugfix',
    description: '精简 bugfix 工作流：最小合规规划后直接定位、修复、验证与归档',
    category: '工作流',
    tags: ['workflow', 'bugfix', 'fix'],
    content: `执行精简 bugfix 工作流。

适用于明确缺陷的快速修复，不要求手动依次运行 brainstorm、plan、tdd、review 等完整前置流程。你应当在一次工作流中完成：

定位问题 → 判断测试策略 → 修复 → 验证 → 归档 → 经验总结

## 输入

\`/opsx:bugfix\` 后的参数应描述 bug 现象、期望行为或复现线索。例如：

- \`/opsx:bugfix 登录超时后仍显示已登录\`
- \`/opsx:bugfix 修复导出接口空数据时崩溃\`

## 执行要求

1. 如果描述不清楚，先询问最少必要信息
2. 创建或复用一个 bugfix change
3. 生成最小合规 OpenSpec 制品：
   - proposal：问题、影响、边界
   - specs：只写当前 bug 对应的行为切片，带 \`Trace\`
   - design：最小 design，至少有 \`需求追踪\` 和 \`实施单元\`
   - tasks：2-4 个任务，带 \`[R?][U?][mode]\`
4. 根据情况选择：
   - \`[test-first]\`
   - \`[characterization-first]\`
   - \`[direct]\`
5. 完成修复并更新 tasks
6. 运行验证与归档
7. 在 \`openspec/knowledge/\` 中补一条经验

## 护栏

- 不把简单 bugfix 膨胀成完整功能开发流程
- 不跳过 OpenSpec 格式约束
- 不默认跳过测试；必须先判断再决定
- 如果范围升级为功能或架构调整，暂停并建议切回常规流程
`,
  };
}
