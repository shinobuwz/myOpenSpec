# OpenSpec Harness Workflow Skills 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 OpenSpec-cn 添加 8 个工作流 skill（bootstrap, brainstorm, plan, tdd, implement, verify, review, ship）和 1 个自动驱动 skill（auto-drive），通过 TypeScript 模板管线生成，集成 TDD 铁律和 Auto-Opt 引擎。

**Architecture:** 新 skill 以 TypeScript workflow 模板文件注册到现有 `getSkillTemplates()` 管线。每个 skill 的 instructions 内容为中文，通过 `openspec-cn init` 生成到 `.claude/skills/openspec-*/SKILL.md`。Auto-Opt 引擎作为独立 skill + command 驱动完整工作流循环。

**Tech Stack:** TypeScript, Vitest, OpenSpec-cn CLI, Claude Code Skills API

---

## 文件结构

### 新建文件

```
src/core/templates/workflows/
├── bootstrap.ts          # 启动引导 skill 模板
├── brainstorm.ts         # 脑暴 skill 模板
├── plan.ts               # 规划 skill 模板（与现有 ff-change 互补）
├── tdd.ts                # 测试先行 skill 模板
├── implement.ts          # 实施 skill 模板（增强版 apply-change）
├── verify.ts             # 验证 skill 模板（增强版 verify-change）
├── review.ts             # 代码审查 skill 模板
├── ship.ts               # 归档上线 skill 模板（增强版 archive-change）
└── auto-drive.ts         # 自动驱动 skill + command 模板

test/core/templates/
└── harness-skills.test.ts  # 新 skill 模板测试
```

### 修改文件

```
src/core/templates/skill-templates.ts       # 添加 export
src/core/shared/skill-generation.ts         # 注册到 getSkillTemplates() 和 getCommandTemplates()
test/core/shared/skill-generation.test.ts   # 更新计数和名称断言
```

---

### Task 1: 搭建测试基础设施

**Files:**
- Create: `test/core/templates/harness-skills.test.ts`
- Modify: `test/core/shared/skill-generation.test.ts`

- [ ] **Step 1: 编写新 skill 模板的失败测试**

```typescript
// test/core/templates/harness-skills.test.ts
import { describe, it, expect } from 'vitest';

// 先导入不存在的模块——确认测试失败
import { getBootstrapSkillTemplate } from '../../../src/core/templates/workflows/bootstrap.js';
import { getBrainstormSkillTemplate } from '../../../src/core/templates/workflows/brainstorm.js';
import { getPlanSkillTemplate } from '../../../src/core/templates/workflows/plan.js';
import { getTddSkillTemplate } from '../../../src/core/templates/workflows/tdd.js';
import { getImplementSkillTemplate } from '../../../src/core/templates/workflows/implement.js';
import { getVerifySkillTemplate } from '../../../src/core/templates/workflows/verify.js';
import { getReviewSkillTemplate } from '../../../src/core/templates/workflows/review.js';
import { getShipSkillTemplate } from '../../../src/core/templates/workflows/ship.js';
import { getAutoDriveSkillTemplate, getAutoDriveCommandTemplate } from '../../../src/core/templates/workflows/auto-drive.js';

describe('harness workflow skill templates', () => {
  const templateGetters = [
    { name: 'bootstrap', fn: getBootstrapSkillTemplate },
    { name: 'brainstorm', fn: getBrainstormSkillTemplate },
    { name: 'plan', fn: getPlanSkillTemplate },
    { name: 'tdd', fn: getTddSkillTemplate },
    { name: 'implement', fn: getImplementSkillTemplate },
    { name: 'verify', fn: getVerifySkillTemplate },
    { name: 'review', fn: getReviewSkillTemplate },
    { name: 'ship', fn: getShipSkillTemplate },
    { name: 'auto-drive', fn: getAutoDriveSkillTemplate },
  ];

  for (const { name, fn } of templateGetters) {
    describe(name, () => {
      it('should return valid SkillTemplate', () => {
        const t = fn();
        expect(t.name).toBe(`openspec-${name}`);
        expect(t.description).toBeTruthy();
        expect(t.instructions).toBeTruthy();
        expect(t.description.length).toBeLessThanOrEqual(1024);
      });

      it('should have Chinese instructions', () => {
        const t = fn();
        // 检查 instructions 包含中文字符
        expect(t.instructions).toMatch(/[\u4e00-\u9fff]/);
      });

      it('should have instructions under 100 logical sections', () => {
        const t = fn();
        // 准则：SKILL.md 做地图不做百科，用 ## 标题计数
        const sectionCount = (t.instructions.match(/^##\s/gm) || []).length;
        expect(sectionCount).toBeLessThanOrEqual(10);
      });
    });
  }

  describe('auto-drive command', () => {
    it('should return valid CommandTemplate', () => {
      const t = getAutoDriveCommandTemplate();
      expect(t.name).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.category).toBe('工作流');
      expect(t.tags).toContain('auto');
      expect(t.content).toBeTruthy();
    });
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /Users/cc/MyHarness/OpenSpec-cn && npx vitest run test/core/templates/harness-skills.test.ts`
Expected: FAIL — 模块不存在

- [ ] **Step 3: Commit 测试骨架**

```bash
cd /Users/cc/MyHarness/OpenSpec-cn
git add test/core/templates/harness-skills.test.ts
git commit -m "test: add failing tests for harness workflow skill templates"
```

---

### Task 2: 实现 bootstrap skill 模板

**Files:**
- Create: `src/core/templates/workflows/bootstrap.ts`

- [ ] **Step 1: 编写 bootstrap.ts**

```typescript
// src/core/templates/workflows/bootstrap.ts
import type { SkillTemplate } from '../types.js';

export function getBootstrapSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-bootstrap',
    description: '会话启动引导。在每次会话开始时注入 skill 发现规则和工作流优先级。当 SessionStart hook 触发时使用。',
    instructions: `# OpenSpec 工作流启动引导

## 铁律

如果有 1% 的可能性某个 skill 适用于当前任务，你**必须**调用它。

## 可用 Skill

| Skill | 触发条件 | 用途 |
|-------|---------|------|
| openspec-explore | "看看"、"调研"、"分析" | 探索问题空间，不写代码 |
| openspec-brainstorm | "做"、"加"、"实现"、"构建" | 需求澄清 → 方案选择 |
| openspec-plan | 脑暴确认后 / 直接指定任务 | 创建 OpenSpec change + 全套 artifact |
| openspec-tdd | 任何需要写产品代码时 | 红绿重构循环 |
| openspec-implement | tasks.md 就绪后 | 逐项实施 + TDD |
| openspec-verify | 实施完成后 | 三维检查 |
| openspec-review | 验证通过后 | subagent 代码审查 |
| openspec-ship | 审查通过后 | sync + archive + git |
| openspec-auto-drive | "自动"、"自驱动"、"迭代" | Auto-Opt 全流程引擎 |

## 优先级

流程类 skill（explore → brainstorm → plan）优先于实施类 skill（tdd → implement）。

## 启动序列

每个 skill 调用时必须先：
1. 确认 git 仓库状态
2. \`openspec-cn list --json\` 查看活跃 change
3. 读取相关状态

## 退出契约

每个 skill 结束时必须：
1. 所有变更已 git commit
2. 输出结构化总结（做了什么、下一步）

## 合理化借口防护

| 你的想法 | 现实 |
|---------|------|
| "这太简单了不需要 skill" | 简单任务最容易出纰漏。检查 skill。 |
| "我先探索一下代码" | skill 告诉你如何探索。先调用。 |
| "让我先快速改一下" | 没有 TDD 的修改是负债。先调用。 |
| "这只是个 bug 修复" | bug 修复更需要测试先行。先调用。 |`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}
```

- [ ] **Step 2: 运行 bootstrap 相关测试**

Run: `cd /Users/cc/MyHarness/OpenSpec-cn && npx vitest run test/core/templates/harness-skills.test.ts -t "bootstrap"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/core/templates/workflows/bootstrap.ts
git commit -m "feat: add bootstrap skill template"
```

---

### Task 3: 实现 brainstorm skill 模板

**Files:**
- Create: `src/core/templates/workflows/brainstorm.ts`

- [ ] **Step 1: 编写 brainstorm.ts**

```typescript
// src/core/templates/workflows/brainstorm.ts
import type { SkillTemplate } from '../types.js';

export function getBrainstormSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-brainstorm',
    description: '交互式需求澄清和方案设计。当用户想要构建新功能、做出架构决策或启动非平凡任务时使用。',
    instructions: `# 脑暴：从想法到设计

## 启动序列

1. 确认 git 仓库状态
2. \`openspec-cn list --json\` 检查活跃 change
3. 读取 \`openspec/specs/\` 了解已有规格

## 硬性门控

设计未被用户确认前，**禁止写任何代码或创建任何文件**。

## 流程

### 1. 理解
- 检查项目上下文（文件、OpenSpec specs、git log）
- 评估范围：如果涉及多个独立子系统，先分解再逐个设计
- **一次只问一个问题**，优先选择题

### 2. 探索方案
- 提出 **2-3 个方案**，附带权衡分析
- 标明推荐方案和理由
- 用 ASCII 图辅助说明架构

### 3. 确认设计
- 逐段呈现，每段确认
- 覆盖：架构、组件、数据流、错误处理、测试策略
- YAGNI——删除不必要的功能

### 4. 转入规划
- 用户确认后，调用 **openspec-plan** skill
- 如果用户想继续探索，建议 **openspec-explore**

## 退出契约

- 产出：用户确认的设计方向（口头确认即可，不要求文件）
- 下一步：明确转入哪个 skill

## 关键原则

- 一次一个问题，不要轰炸
- 选择题优于开放题
- 探索替代方案，不要直奔第一个想法
- 逐段验证，不要一次性呈现巨型设计`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}
```

- [ ] **Step 2: 运行 brainstorm 相关测试**

Run: `cd /Users/cc/MyHarness/OpenSpec-cn && npx vitest run test/core/templates/harness-skills.test.ts -t "brainstorm"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/core/templates/workflows/brainstorm.ts
git commit -m "feat: add brainstorm skill template"
```

---

### Task 4: 实现 plan skill 模板

**Files:**
- Create: `src/core/templates/workflows/plan.ts`

- [ ] **Step 1: 编写 plan.ts**

```typescript
// src/core/templates/workflows/plan.ts
import type { SkillTemplate } from '../types.js';

export function getPlanSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-plan',
    description: '创建 OpenSpec change 并生成全套 artifact（proposal/design/specs/tasks）。当需求已明确、准备进入规划阶段时使用。',
    instructions: `# 规划：创建 OpenSpec Change

## 启动序列

1. 确认 git 仓库状态
2. \`openspec-cn list --json\` 检查是否已有相关 change
3. 确认用户需求已通过脑暴澄清（或用户直接指定）

## 流程

### 1. 创建 Change

\`\`\`bash
openspec-cn new change "<name>"
\`\`\`

### 2. 依序生成 Artifact

按 schema DAG 依赖顺序，逐个生成：

对每个待生成的 artifact：
\`\`\`bash
openspec-cn status --change "<name>" --json
openspec-cn instructions <artifact-id> --change "<name>" --json
\`\`\`

- 使用返回的 \`template\` 作为输出结构
- \`context\` 和 \`rules\` 仅作为 AI 约束，**不复制进产出文件**
- 读取 \`dependencies\` 中已完成的 artifact 作为上下文
- 写入 \`outputPath\` 指定的路径

### 3. tasks.md 质量要求

每个 task 必须包含：
- 精确文件路径
- 预期行为描述
- 验证方式（测试命令或检查条件）

### 4. 逐步提交

每个 artifact 写完后：
\`\`\`bash
git add <artifact-file>
git commit -m "spec(<change-name>): add <artifact-id>"
\`\`\`

## 完成条件

- \`openspec-cn status --change "<name>" --json\` 显示所有 apply 前置 artifact 为 \`done\`
- 所有 artifact 文件已 commit

## 退出契约

- 展示 change 状态总结
- 建议转入 **openspec-implement** 开始实施`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}
```

- [ ] **Step 2: 运行 plan 相关测试**

Run: `cd /Users/cc/MyHarness/OpenSpec-cn && npx vitest run test/core/templates/harness-skills.test.ts -t "plan"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/core/templates/workflows/plan.ts
git commit -m "feat: add plan skill template"
```

---

### Task 5: 实现 tdd skill 模板

**Files:**
- Create: `src/core/templates/workflows/tdd.ts`

- [ ] **Step 1: 编写 tdd.ts**

```typescript
// src/core/templates/workflows/tdd.ts
import type { SkillTemplate } from '../types.js';

export function getTddSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-tdd',
    description: '测试先行铁律。强制红绿重构循环，自动探测多语言测试框架。任何需要编写产品代码的时刻必须使用。',
    instructions: `# 测试先行

## 铁律

**没有失败的测试就不写产品代码。** 如果先写了代码再补测试，代码必须删除重来。

## 启动序列

1. 确认 git 工作区干净
2. 探测测试框架（见下方）

## 测试框架探测

扫描项目根目录，按以下优先级匹配：

| 标志文件 | 框架 | 运行命令 |
|---------|------|---------|
| CMakeLists.txt 或 *.cpp | gtest/catch2 | \`cmake --build . && ctest\` |
| pyproject.toml 或 pytest.ini | pytest | \`pytest\` |
| package.json | 读 scripts.test | \`npm test\` 或 \`npx vitest\` |
| build.gradle 或 pom.xml | JUnit | \`gradle test\` 或 \`mvn test\` |
| *.xcodeproj | XCTest | \`xcodebuild test\` |

多框架共存时，按当前修改文件的语言选择。

## 红绿重构循环

**RED** — 写最小失败测试 → 运行 → 确认失败且失败原因正确
**GREEN** — 写最小实现使测试通过 → 运行 → 确认通过
**REFACTOR** — 改善代码结构 → 运行 → 确认仍通过

每轮循环完成后 git commit。

## 完成条件

- 新测试存在且通过
- 产品代码通过所有测试
- 代码已 commit

## 反模式（详见 @anti-patterns.md）

1. 测试 mock 行为而非真实行为
2. 在产品代码中加仅测试用方法
3. 不理解依赖就 mock
4. mock 不完整导致误绿
5. 测试作为事后补充

## 合理化借口防护

| 你的想法 | 现实 |
|---------|------|
| "这个改动太小不需要测试" | 小改动最容易引入回归。写测试。 |
| "我先写实现再补测试效率更高" | 事后补的测试验证的是你写的代码，不是需求。删掉重来。 |
| "这是重构，不需要新测试" | 重构前确认已有测试覆盖，没有就先补。 |
| "测试环境太难搭" | 这说明架构有问题。记录为技术债务。 |`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}
```

- [ ] **Step 2: 运行 tdd 相关测试**

Run: `cd /Users/cc/MyHarness/OpenSpec-cn && npx vitest run test/core/templates/harness-skills.test.ts -t "tdd"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/core/templates/workflows/tdd.ts
git commit -m "feat: add tdd skill template"
```

---

### Task 6: 实现 implement skill 模板

**Files:**
- Create: `src/core/templates/workflows/implement.ts`

- [ ] **Step 1: 编写 implement.ts**

```typescript
// src/core/templates/workflows/implement.ts
import type { SkillTemplate } from '../types.js';

export function getImplementSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-implement',
    description: '按 tasks.md 逐项实施，每项强制 TDD 循环。当 OpenSpec change 的 artifact 全部就绪、准备开始编码时使用。',
    instructions: `# 实施：逐项 TDD 执行

## 启动序列

1. 确认 git 工作区干净
2. \`openspec-cn instructions apply --change "<name>" --json\`
3. 检查 \`state\`：若 \`blocked\` 则提示先完成 artifact；若 \`all_done\` 则提示归档
4. 读取所有 \`contextFiles\`（proposal/design/specs）

## 流程

对每个待完成 task：

1. **展示** task 内容
2. **TDD** — 调用 openspec-tdd skill 的红绿重构循环
3. **标记** — 在 tasks.md 中将 \`- [ ]\` 改为 \`- [x]\`
4. **提交** — \`git commit -m "feat(<change-name>): <task描述>"\`
5. **下一个** — 继续下一项 task

## 暂停条件

遇到以下情况**立即暂停**，不要强行继续：
- task 描述不明确
- 发现 design 与实际冲突
- 测试无法通过且原因不在当前 task 范围内
- 需要修改已锁定的 artifact

## 完成条件

- tasks.md 中所有项目标记为 \`[x]\`
- 所有测试通过
- 所有变更已 commit

## 退出契约

- 展示完成进度（X/Y tasks）
- 如全部完成，建议转入 **openspec-verify**`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}
```

- [ ] **Step 2: 运行 implement 相关测试**

Run: `cd /Users/cc/MyHarness/OpenSpec-cn && npx vitest run test/core/templates/harness-skills.test.ts -t "implement"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/core/templates/workflows/implement.ts
git commit -m "feat: add implement skill template"
```

---

### Task 7: 实现 verify skill 模板

**Files:**
- Create: `src/core/templates/workflows/verify.ts`

注意：此文件名与现有 `verify-change.ts` 不同，是增强版。

- [ ] **Step 1: 编写 verify.ts**

```typescript
// src/core/templates/workflows/verify.ts
import type { SkillTemplate } from '../types.js';

export function getVerifySkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-verify',
    description: '三维验证检查（完整性/正确性/一致性）。当实施完成或用户想要检查 change 质量时使用。增强版 verify-change。',
    instructions: `# 验证：三维质量检查

## 启动序列

1. 确认 git 工作区干净
2. \`openspec-cn status --change "<name>" --json\`
3. \`openspec-cn instructions apply --change "<name>" --json\` 获取 contextFiles
4. 读取所有 artifact

## 三维检查

### 完整性
- tasks.md 中全部 \`[x]\`
- delta specs 中每条需求 → 搜索代码库确认有对应实现
- 无遗漏的 artifact

### 正确性
- 每条需求有对应测试用例
- 运行全部测试 → 必须通过
- 如有验证命令 → 运行并确认

### 一致性
- design.md 中的架构决策 → 检查代码是否遵循
- 命名/模式/分层与设计匹配

## 输出格式

\`\`\`
## 验证报告
### 记分卡
完整性: ✓/✗  正确性: ✓/✗  一致性: ✓/✗

### 问题列表
[严重] ...
[警告] ...
[建议] ...

### 结论
可归档 / 需修复后归档
\`\`\`

## 完成条件

- 验证报告已输出
- 如有严重问题，已明确列出

## 退出契约

- 如"可归档"，建议转入 **openspec-review** 或 **openspec-ship**
- 如"需修复"，建议回到 **openspec-implement**`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}
```

- [ ] **Step 2: 运行 verify 相关测试**

Run: `cd /Users/cc/MyHarness/OpenSpec-cn && npx vitest run test/core/templates/harness-skills.test.ts -t "verify"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/core/templates/workflows/verify.ts
git commit -m "feat: add verify skill template"
```

---

### Task 8: 实现 review skill 模板

**Files:**
- Create: `src/core/templates/workflows/review.ts`

- [ ] **Step 1: 编写 review.ts**

```typescript
// src/core/templates/workflows/review.ts
import type { SkillTemplate } from '../types.js';

export function getReviewSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-review',
    description: '使用 subagent 进行独立代码审查，输出质量指标和分级问题。当验证通过后需要更深入的代码质量评估时使用。',
    instructions: `# 代码审查

## 启动序列

1. 确认 git 工作区干净
2. \`git diff main...HEAD\`（或相关 base branch）获取变更范围
3. 读取 change 的 design.md 了解设计意图

## 审查方式

使用 **Agent tool** 派遣 subagent 执行审查。subagent 必须：
- 独立阅读实际代码（不信任实施者报告）
- 对照 design.md 检查架构一致性
- 检查测试覆盖和质量

## 审查维度

| 维度 | 检查内容 |
|------|---------|
| 安全 | 注入漏洞、敏感数据泄露、OWASP Top 10 |
| 性能 | N+1 查询、不必要的计算、内存泄漏 |
| 可维护性 | 命名、职责单一、耦合度 |
| 测试 | 覆盖率、边界条件、mock 合理性 |

## 问题分级

- **CRITICAL** — 必须修复才能归档
- **WARNING** — 建议修复
- **SUGGESTION** — 记录备忘

## 完成条件

- 审查报告已输出，包含质量指标和问题列表
- CRITICAL 问题已明确标注

## 退出契约

- 如无 CRITICAL，建议转入 **openspec-ship**
- 如有 CRITICAL，建议回到 **openspec-implement** 修复`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}
```

- [ ] **Step 2: 运行 review 相关测试**

Run: `cd /Users/cc/MyHarness/OpenSpec-cn && npx vitest run test/core/templates/harness-skills.test.ts -t "review"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/core/templates/workflows/review.ts
git commit -m "feat: add review skill template"
```

---

### Task 9: 实现 ship skill 模板

**Files:**
- Create: `src/core/templates/workflows/ship.ts`

- [ ] **Step 1: 编写 ship.ts**

```typescript
// src/core/templates/workflows/ship.ts
import type { SkillTemplate } from '../types.js';

export function getShipSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-ship',
    description: '归档上线：sync delta specs、archive change、执行 git 操作。当代码审查通过后准备交付时使用。',
    instructions: `# 归档上线

## 启动序列

1. 确认 git 工作区干净
2. \`openspec-cn status --change "<name>" --json\` 检查完整性
3. 检查 tasks.md 完成度

## 流程

### 1. 预检
- 所有 artifact 状态为 \`done\`
- tasks.md 无未完成项（\`- [ ]\`）
- 如有未完成项，警告并确认是否继续

### 2. Sync Delta Specs
- 检查 \`openspec/changes/<name>/specs/\` 是否有 delta specs
- 如有，与 \`openspec/specs/\` 中的 main specs 对比
- 执行智能合并（新增/修改/删除/重命名）
- 提示用户确认 sync

### 3. Archive
\`\`\`bash
mv openspec/changes/<name> openspec/changes/archive/$(date +%Y-%m-%d)-<name>
\`\`\`

### 4. Git 操作（可选）
- 提交归档变更
- 可选：创建 PR、打 tag

## 完成条件

- delta specs 已 sync 到 main specs
- change 已移动到 archive
- 归档变更已 commit

## 退出契约

- 展示归档摘要（schema、archive 路径、sync 状态）
- 工作流完成`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}
```

- [ ] **Step 2: 运行 ship 相关测试**

Run: `cd /Users/cc/MyHarness/OpenSpec-cn && npx vitest run test/core/templates/harness-skills.test.ts -t "ship"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/core/templates/workflows/ship.ts
git commit -m "feat: add ship skill template"
```

---

### Task 10: 实现 auto-drive skill + command 模板

**Files:**
- Create: `src/core/templates/workflows/auto-drive.ts`

- [ ] **Step 1: 编写 auto-drive.ts**

```typescript
// src/core/templates/workflows/auto-drive.ts
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getAutoDriveSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-auto-drive',
    description: '自动驱动引擎（Auto-Opt）。设定目标和量化标准后 AI 自主驱动完整 OpenSpec 工作流循环。当用户想要自动迭代优化时使用。',
    instructions: `# 自动驱动（Auto-Opt 引擎）

## 启动序列

1. git 状态预检（干净工作区、无 stale lock、非 detached HEAD）
2. \`openspec-cn list --json\` 检查现有 change

## 配置收集

通过 AskUserQuestion 交互式收集：
- **目标**：要完成什么
- **范围**：可修改的文件（glob）
- **指标**：coverage / errors / lint-score / 自定义
- **方向**：higher 或 lower
- **验证命令**：提取指标的命令
- **守卫命令**（可选）：pass/fail 检查
- **门控**：none / design / all
- **最大迭代**（可选）：默认无限

## 引擎循环

每轮迭代执行：

**Phase 1 审视** — 读取 OpenSpec change 状态 + \`git log --oneline -20\` + 结果日志
**Phase 2 决策** — 根据当前阶段选择动作（创建 change / 填写 artifact / 实施 task / 验证 / 归档）
**Phase 3 执行** — 执行单一原子动作
**Phase 4 提交** — \`git commit\`（验证前提交，便于回滚）
**Phase 5 度量** — 运行验证命令，提取指标
**Phase 6 裁决** — 改善→KEEP / 未改善→DISCARD(\`git revert\`) / 崩溃→修复或 revert
**Phase 7 记录** — 追加 TSV 日志行

详见 @loop-protocol.md 和 @results-logging.md

## 门控

- \`none\`：全自主
- \`design\`：design.md 生成后暂停审批
- \`all\`：proposal/design/实施前/归档前均暂停

## 卡住恢复

连续 5+ 次 DISCARD：重新读取文件和目标 → 审视日志 → 组合策略 → 反向策略 → 激进变更

## 完成条件

- 有界模式：达到最大迭代次数
- 无界模式：用户中断或指标达标

## 退出契约

- 输出总结（迭代次数、指标变化、KEEP/DISCARD 统计）
- 结果日志可在 \`autoresearch-results.tsv\` 中查看`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getAutoDriveCommandTemplate(): CommandTemplate {
  return {
    name: 'OpenSpec: 自动驱动',
    description: '启动 Auto-Opt 引擎，自主驱动完整 OpenSpec 工作流循环',
    category: '工作流',
    tags: ['workflow', 'auto', 'optimize', 'iterate'],
    content: `启动 Auto-Opt 自动驱动引擎。

**输入**：\`/openspec:auto\` 之后的参数作为目标描述。如果省略，交互式收集配置。

调用 **openspec-auto-drive** skill 执行。`,
  };
}
```

- [ ] **Step 2: 运行 auto-drive 相关测试**

Run: `cd /Users/cc/MyHarness/OpenSpec-cn && npx vitest run test/core/templates/harness-skills.test.ts -t "auto-drive"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/core/templates/workflows/auto-drive.ts
git commit -m "feat: add auto-drive skill and command template"
```

---

### Task 11: 注册新 skill 到生成管线

**Files:**
- Modify: `src/core/templates/skill-templates.ts`
- Modify: `src/core/shared/skill-generation.ts`

- [ ] **Step 1: 更新 skill-generation.test.ts 中的计数断言**

在 `test/core/shared/skill-generation.test.ts` 中：
- 将 `expect(templates).toHaveLength(11)` 改为 `expect(templates).toHaveLength(20)`
- 在 `should include all expected skills` 测试中添加 9 个新的 `expect(dirNames).toContain(...)` 断言
- 在 `getCommandTemplates` 相关测试中添加 auto-drive command 的断言

- [ ] **Step 2: 运行更新后的测试确认失败**

Run: `cd /Users/cc/MyHarness/OpenSpec-cn && npx vitest run test/core/shared/skill-generation.test.ts`
Expected: FAIL — 计数不匹配，新 skill 未注册

- [ ] **Step 3: 更新 skill-templates.ts 添加 export**

在 `src/core/templates/skill-templates.ts` 中添加：
```typescript
export { getBootstrapSkillTemplate } from './workflows/bootstrap.js';
export { getBrainstormSkillTemplate } from './workflows/brainstorm.js';
export { getPlanSkillTemplate } from './workflows/plan.js';
export { getTddSkillTemplate } from './workflows/tdd.js';
export { getImplementSkillTemplate } from './workflows/implement.js';
export { getVerifySkillTemplate } from './workflows/verify.js';
export { getReviewSkillTemplate } from './workflows/review.js';
export { getShipSkillTemplate } from './workflows/ship.js';
export { getAutoDriveSkillTemplate, getAutoDriveCommandTemplate } from './workflows/auto-drive.js';
```

- [ ] **Step 4: 更新 skill-generation.ts 注册新 skill**

在 `src/core/shared/skill-generation.ts` 的 `getSkillTemplates()` 函数的 `all` 数组中追加：
```typescript
{ template: getBootstrapSkillTemplate(), dirName: 'openspec-bootstrap', workflowId: 'bootstrap' },
{ template: getBrainstormSkillTemplate(), dirName: 'openspec-brainstorm', workflowId: 'brainstorm' },
{ template: getPlanSkillTemplate(), dirName: 'openspec-plan', workflowId: 'plan' },
{ template: getTddSkillTemplate(), dirName: 'openspec-tdd', workflowId: 'tdd' },
{ template: getImplementSkillTemplate(), dirName: 'openspec-implement', workflowId: 'implement' },
{ template: getVerifySkillTemplate(), dirName: 'openspec-verify-enhanced', workflowId: 'verify-enhanced' },
{ template: getReviewSkillTemplate(), dirName: 'openspec-review', workflowId: 'review' },
{ template: getShipSkillTemplate(), dirName: 'openspec-ship', workflowId: 'ship' },
{ template: getAutoDriveSkillTemplate(), dirName: 'openspec-auto-drive', workflowId: 'auto-drive' },
```

在 `getCommandTemplates()` 函数的 `all` 数组中追加：
```typescript
{ template: getAutoDriveCommandTemplate(), id: 'auto-drive' },
```

需要在文件顶部添加对应的 import。

- [ ] **Step 5: 运行全部测试确认通过**

Run: `cd /Users/cc/MyHarness/OpenSpec-cn && npx vitest run test/core/shared/skill-generation.test.ts test/core/templates/harness-skills.test.ts`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add src/core/templates/skill-templates.ts src/core/shared/skill-generation.ts test/core/shared/skill-generation.test.ts
git commit -m "feat: register 9 harness workflow skills in generation pipeline"
```

---

### Task 12: 运行完整测试套件验证无回归

**Files:** None (verification only)

- [ ] **Step 1: 运行完整测试套件**

Run: `cd /Users/cc/MyHarness/OpenSpec-cn && npx vitest run`
Expected: ALL PASS, no regressions

- [ ] **Step 2: 验证 skill 生成**

Run: `cd /tmp && mkdir test-harness && cd test-harness && git init && openspec-cn init`
Expected: `.claude/skills/` 下出现所有 20 个 skill 目录（11 个原有 + 9 个新增）

- [ ] **Step 3: 检查生成的 SKILL.md 内容**

Run: `cat /tmp/test-harness/.claude/skills/openspec-tdd/SKILL.md`
Expected: 包含中文 instructions、正确的 YAML frontmatter

- [ ] **Step 4: 清理并 commit**

```bash
rm -rf /tmp/test-harness
cd /Users/cc/MyHarness/OpenSpec-cn
git add -A
git commit -m "test: verify full pipeline with harness skills"
```

---

## 自审检查

1. **Spec 覆盖**：proposal 中列出的 10 个 skill，plan 中实现了 9 个（explore 使用现有 `openspec-explore`，无需新建）+ 1 个 command = 完整覆盖
2. **Placeholder 扫描**：所有 step 包含完整代码，无 TBD/TODO
3. **类型一致性**：所有 SkillTemplate 使用相同的 `name`/`description`/`instructions` 结构，所有 dirName 使用 `openspec-` 前缀
4. **准则遵循**：每个 skill instructions 控制在合理长度，包含启动序列和退出契约，用 `@file` 指针引用详细参考
