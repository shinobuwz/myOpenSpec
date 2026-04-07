/**
 * Bugfix Workflow Templates
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getBugfixSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-bugfix',
    description: '精简 bugfix 工作流。适用于明确缺陷的快速修复：定位问题、判断测试策略、修复、验证并沉淀经验。',
    instructions: `执行精简 bugfix 工作流。目标是用最少步骤完成一个明确缺陷的修复，不为简单问题引入多余文档。

## 适用条件

- 问题边界相对清晰
- 主要目标是修复缺陷，而不是扩展功能
- 不需要先做大范围需求脑暴或复杂方案比较

## 标准路径

定位问题 → 判断是否需要写测试 → 修复 → 验证 → 经验总结

## 步骤

1. **确认 bug 描述**
   - 如果用户没有提供明确症状、期望行为或复现线索，先询问
   - 如果问题范围已经扩展成需求变更或架构调整，停止 bugfix 流程并建议改走常规流程

2. **决定测试策略**
   - 如果 bug 可通过新增失败测试直接复现，使用 \`[test-first]\`
   - 如果是旧行为不清晰或回归缺陷，先用 \`[characterization-first]\` 固化现状
   - 仅纯样式、纯配置类缺陷使用 \`[direct]\`

3. **实施修复**
   - 优先阅读相关代码、日志、已有测试
   - 实施时保持改动最小，不顺手做无关重构

4. **验证**
   - 运行与 bug 相关的测试或验证命令
   - 如果修复无法被测试证明，明确说明验证依据

5. **经验总结**
   - 直接在 \`.aiknowledge/pitfalls/<领域>/\` 中补一条最小经验，或调用 \`/opsx:knowledge\`
   - 根据问题本质选择技术领域（memory / concurrency / api / build / testing / performance / security / platform / data / network / lifecycle / config / misc）
   - 至少记录：现象、根因、修复 diff、要点、来源
   - 更新对应领域的 index.md 和顶层 index.md

## 护栏

- 不为简单 bugfix 强行创建 proposal / specs / design / tasks
- 不为简单 bugfix 强行走完整 brainstorm / plan-review / review / archive 链路，除非修复过程中暴露出更大范围风险
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
    description: '精简 bugfix 工作流：直接定位、修复、验证并沉淀经验',
    category: '工作流',
    tags: ['workflow', 'bugfix', 'fix'],
    content: `执行精简 bugfix 工作流。

适用于明确缺陷的快速修复，不要求手动依次运行 brainstorm、plan、tdd、review 等完整前置流程。你应当在一次工作流中完成：

定位问题 → 判断测试策略 → 修复 → 验证 → 经验总结

## 输入

\`/opsx:bugfix\` 后的参数应描述 bug 现象、期望行为或复现线索。例如：

- \`/opsx:bugfix 登录超时后仍显示已登录\`
- \`/opsx:bugfix 修复导出接口空数据时崩溃\`

## 执行要求

1. 如果描述不清楚，先询问最少必要信息
2. 根据情况选择：
   - \`[test-first]\`
   - \`[characterization-first]\`
   - \`[direct]\`
3. 完成修复
4. 运行验证
5. 在 \`.aiknowledge/pitfalls/<领域>/\` 中补一条经验，必要时调用 \`/opsx:knowledge\`

## 护栏

- 不把简单 bugfix 膨胀成完整功能开发流程
- 不强制创建 OpenSpec change 文档
- 不默认跳过测试；必须先判断再决定
- 如果范围升级为功能或架构调整，暂停并建议切回常规流程
`,
  };
}
