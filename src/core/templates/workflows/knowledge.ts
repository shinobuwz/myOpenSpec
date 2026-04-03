import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getKnowledgeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-knowledge',
    description: '独立的经验沉淀工作流。将一次修复、开发或排障中的可复用经验整理到知识库。',
    instructions: `执行经验沉淀工作流。目标是把一次具体工作中的可复用信息整理为可检索、可复用的知识条目。

## 适用条件

- 一次 bugfix、feature、review 或排障刚完成
- 过程中出现了值得复用的经验、踩坑或测试方法
- 不需要再创建或修改 change 制品

## 标准路径

收集上下文 → 判断知识类型 → 写入知识条目 → 校验可复用性

## 知识类型

- \`pitfalls/\`：易错点、踩坑、特殊约束
- \`patterns/\`：值得重复使用的实现模式
- \`test-recipes/\`：某类问题的测试套路或回归方法

## 步骤

1. **收集上下文**
   - 读取用户输入、最近修改、相关测试或提交信息
   - 提炼出真正值得复用的信息，而不是一次性过程记录

2. **判断条目类型**
   - 如果重点是“哪里容易出错、为什么出错”，写到 \`pitfalls/\`
   - 如果重点是“以后可以照着做”，写到 \`patterns/\`
   - 如果重点是“以后怎么测、怎么复现、怎么防回归”，写到 \`test-recipes/\`

3. **创建或更新条目**
   - 在 \`openspec/knowledge/\` 对应目录下创建一个简洁的 kebab-case 文件名
   - 优先复用已有条目；只有当主题明显不同才新建

4. **使用统一模板**
   - 建议至少包含：
   \`\`\`md
   # <title>

   ## Trigger
   什么场景会再次遇到

   ## Symptom
   现象是什么

   ## Root Cause
   根因是什么

   ## Fix Pattern
   以后应该如何处理

   ## Verification
   如何验证修复或避免回归

   ## Source
   关联代码、测试、提交或变更
   \`\`\`

5. **校验可复用性**
   - 删除只对这一次会话有意义的表述
   - 确保其他人或未来的自己能独立看懂并复用

## 护栏

- 不把经验总结写成流水账
- 不要求依赖 change/archive 才能沉淀知识
- 不重复创建多个高相似度条目
- 条目应聚焦一个问题或一个模式，避免大而全
`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxKnowledgeCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Knowledge',
    description: '独立沉淀可复用经验到 openspec/knowledge/',
    category: '工作流',
    tags: ['workflow', 'knowledge', 'pitfall', 'pattern', 'testing'],
    content: `执行独立经验沉淀工作流。

适用于一次 bugfix、开发、review 或排障结束后，把可复用经验写入知识库，而不要求先走 archive 或维护 change 文档。

## 输入

\`/opsx:knowledge\` 后可提供一段总结、标题或背景。例如：

- \`/opsx:knowledge iOS 首帧音频前必须先等待 session ready\`
- \`/opsx:knowledge 补一条登录超时问题的回归测试套路\`

## 执行要求

1. 如信息不足，先询问最少必要背景
2. 将内容归类到以下其一：
   - \`pitfalls\`
   - \`patterns\`
   - \`test-recipes\`
3. 在 \`openspec/knowledge/\` 下创建或更新一个条目
4. 使用统一模板整理：
   - \`Trigger\`
   - \`Symptom\`
   - \`Root Cause\`
   - \`Fix Pattern\`
   - \`Verification\`
   - \`Source\`
5. 保持内容简洁、可复用、可检索

## 护栏

- 不把一次性过程记录当作知识沉淀
- 不强制依赖 OpenSpec change 文档
- 不重复制造多个高重合条目
`,
  };
}
