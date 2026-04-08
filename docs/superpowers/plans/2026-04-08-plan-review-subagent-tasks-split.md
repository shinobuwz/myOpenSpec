# plan-review/task-analyze Subagent 化 + plan 拆分 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** plan-review 和 task-analyze 改用 subagent 独立执行；plan 职责收窄到 design+specs，tasks 生成独立为 openspec-tasks skill，由 plan-review 退出契约触发。

**Architecture:** 7 个 task，每个 task 修改 1-2 个文件，最后一个 task 更新 parity 测试哈希。所有修改均为模板字符串内容变更，无逻辑代码改动。

**Tech Stack:** TypeScript, Vitest (`pnpm test`), `pnpm build`

---

### Task 1：plan-review.ts — 加 subagent 审查方式 + 更新退出契约

**Files:**
- Modify: `src/core/templates/workflows/plan-review.ts`

- [ ] **Step 1：在"启动序列"与"审查维度"之间插入"审查方式"节**

  在 `plan-review.ts` 的 instructions 字符串中，找到：

  ```
  ## 审查维度
  ```

  在其前面插入：

  ```
  ## 审查方式

  使用 Agent tool 启动 subagent 进行独立审查。subagent 只读取产出物文件，不做任何修改。审查结果由 subagent 汇报，主 agent 汇总输出。

  ## 审查维度
  ```

- [ ] **Step 2：更新退出契约 — 通过时指向 openspec-tasks**

  找到：

  ```
  - **如"通过"**：必须进入 tasks 生成阶段（openspec-plan 继续生成 tasks.md）。这不是建议，是强制要求。
  ```

  替换为：

  ```
  - **如"通过"**：必须转入 **openspec-tasks** 生成 tasks.md。这不是建议，是强制要求。
  ```

- [ ] **Step 3：构建验证**

  ```bash
  pnpm build
  ```

  Expected: 无错误

- [ ] **Step 4：运行结构测试确认 plan-review skill 仍然有效**

  ```bash
  pnpm test test/core/templates/harness-skills.test.ts
  ```

  Expected: PASS（plan-review 相关测试全部通过）

- [ ] **Step 5：提交**

  ```bash
  git add src/core/templates/workflows/plan-review.ts
  git commit -m "feat: plan-review 改用 subagent 审查，退出契约指向 openspec-tasks"
  ```

---

### Task 2：task-analyze.ts — 加 subagent 审查方式

**Files:**
- Modify: `src/core/templates/workflows/task-analyze.ts`

- [ ] **Step 1：在"启动序列"与"审查维度"之间插入"审查方式"节**

  在 `task-analyze.ts` 的 instructions 字符串中，找到：

  ```
  ## 审查维度
  ```

  在其前面插入：

  ```
  ## 审查方式

  使用 Agent tool 启动 subagent 进行独立审查。subagent 只读取产出物文件，不做任何修改。审查结果由 subagent 汇报，主 agent 汇总输出。

  ## 审查维度
  ```

- [ ] **Step 2：构建验证**

  ```bash
  pnpm build
  ```

  Expected: 无错误

- [ ] **Step 3：运行结构测试**

  ```bash
  pnpm test test/core/templates/harness-skills.test.ts
  ```

  Expected: PASS

- [ ] **Step 4：提交**

  ```bash
  git add src/core/templates/workflows/task-analyze.ts
  git commit -m "feat: task-analyze 改用 subagent 审查"
  ```

---

### Task 3：plan.ts — 移除 tasks 生成，收窄职责

**Files:**
- Modify: `src/core/templates/workflows/plan.ts`

- [ ] **Step 1：从"指令循环"中删除 tasks.md 产出物**

  在 instructions 字符串中，找到并删除整个 tasks.md 块：

  ```
  **tasks.md** - 任务列表
  - 将实施工作拆分为独立的、可测试的任务
  - 每个任务有清晰的完成标准
  - 任务按依赖关系排序
  ```

- [ ] **Step 2：删除"任务质量检查"节**

  找到并删除：

  ```
  ### 3. 任务质量检查
  - 每个任务不超过 2 小时的工作量
  - 每个任务有明确的验收标准
  - 任务之间的依赖关系清晰
  ```

- [ ] **Step 3：更新"硬性门控"**

  找到：

  ```
  **在 design.md 和 specs/ 生成后，必须转入 openspec-plan-review 进行 spec↔plan 审查。** 在 plan-review 通过之前，禁止生成 tasks.md。

  **在 tasks.md 生成后，必须转入 openspec-task-analyze 进行 plan↔tasks 审查。** 在 task-analyze 通过之前，禁止进入实施阶段。
  ```

  替换为：

  ```
  **在 design.md 和 specs/ 生成后，必须转入 openspec-plan-review 进行 spec↔plan 审查。** plan-review 通过后由 openspec-tasks 生成 tasks.md，禁止在 plan skill 内部生成 tasks.md。
  ```

- [ ] **Step 4：更新"退出契约"**

  找到：

  ```
  - 输出变更摘要，包含所有产出物的简要描述
  - **必须**转入 **openspec-plan-review** 审查 spec↔plan 一致性。这不是建议，是强制要求。
  - plan-review 通过后生成 tasks.md，再**必须**转入 **openspec-task-analyze** 审查 plan↔tasks 一致性
  ```

  替换为：

  ```
  - 输出变更摘要（proposal.md、design.md、specs/ 概述）
  - **必须**转入 **openspec-plan-review** 审查 spec↔plan 一致性。这不是建议，是强制要求。
  ```

- [ ] **Step 5：构建验证**

  ```bash
  pnpm build
  ```

  Expected: 无错误

- [ ] **Step 6：运行结构测试**

  ```bash
  pnpm test test/core/templates/harness-skills.test.ts
  ```

  Expected: PASS

- [ ] **Step 7：提交**

  ```bash
  git add src/core/templates/workflows/plan.ts
  git commit -m "refactor: plan skill 职责收窄至 design+specs，移除 tasks 生成"
  ```

---

### Task 4：新建 tasks.ts + 注册 + 补测试

**Files:**
- Create: `src/core/templates/workflows/tasks.ts`
- Modify: `src/core/templates/skill-templates.ts`
- Modify: `test/core/templates/harness-skills.test.ts`

- [ ] **Step 1：先写测试（TDD — 红）**

  在 `test/core/templates/harness-skills.test.ts` 中：

  添加 import（与其他 import 对齐）：

  ```typescript
  import { getTasksSkillTemplate } from '../../../src/core/templates/workflows/tasks.js';
  ```

  在 `templateGetters` 数组中添加（放在 `plan-review` 之后）：

  ```typescript
  { name: 'tasks', fn: getTasksSkillTemplate },
  ```

- [ ] **Step 2：确认测试失败（红）**

  ```bash
  pnpm test test/core/templates/harness-skills.test.ts
  ```

  Expected: FAIL — `Cannot find module '.../tasks.js'`

- [ ] **Step 3：创建 tasks.ts（绿）**

  创建 `src/core/templates/workflows/tasks.ts`：

  ```typescript
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
  ```

- [ ] **Step 4：注册到 skill-templates.ts**

  在 `src/core/templates/skill-templates.ts` 中，在 `getPlanReviewSkillTemplate` 的 export 行之后添加：

  ```typescript
  export { getTasksSkillTemplate } from './workflows/tasks.js';
  ```

- [ ] **Step 5：构建验证**

  ```bash
  pnpm build
  ```

  Expected: 无错误

- [ ] **Step 6：确认测试通过（绿）**

  ```bash
  pnpm test test/core/templates/harness-skills.test.ts
  ```

  Expected: PASS — tasks skill 通过所有结构检查：
  - `t.name === 'openspec-tasks'`
  - description 非空且 ≤ 1024 字符
  - instructions 包含中文字符
  - instructions 中 `##` 节数 ≤ 10

- [ ] **Step 7：提交**

  ```bash
  git add src/core/templates/workflows/tasks.ts \
          src/core/templates/skill-templates.ts \
          test/core/templates/harness-skills.test.ts
  git commit -m "feat: 新增 openspec-tasks skill，注册并补充结构测试"
  ```

---

### Task 5：ff-change.ts — 更新编排逻辑

**Files:**
- Modify: `src/core/templates/workflows/ff-change.ts`

- [ ] **Step 1：更新 FF_CHANGE_INSTRUCTIONS 的步骤 b**

  在 `FF_CHANGE_INSTRUCTIONS` 字符串中，找到：

  ```
     b. **[关卡1] design 生成后，立即执行 plan-review（spec↔plan 审查）**
        - 调用 **openspec-plan-review** skill
        - 如果审查未通过（有 TRACE_GAP 或 ORPHAN）：必须修正 design 后重审，**禁止继续生成 tasks**
        - 审查通过后，继续生成 tasks
  ```

  替换为：

  ```
     b. **[关卡1] design 生成后，立即执行 plan-review（spec↔plan 审查）**
        - 调用 **openspec-plan-review** skill（subagent 独立执行）
        - 如果审查未通过（有 TRACE_GAP 或 ORPHAN）：必须修正 design 后重审，**禁止继续生成 tasks**
        - 审查通过后，调用 **openspec-tasks** 生成 tasks.md（plan-review 退出契约自动触发，无需单独调用）
  ```

- [ ] **Step 2：更新 FF_CHANGE_INSTRUCTIONS 的步骤 c**

  找到：

  ```
     c. **[关卡2] tasks 生成后，立即执行 task-analyze（plan↔tasks 审查）**
        - 调用 **openspec-task-analyze** skill
        - 如果审查未通过（有 GAP、MISMATCH 或严重 QUALITY 问题）：必须修正 tasks 后重审，**禁止进入实施**
        - 审查通过后，继续实施
  ```

  替换为：

  ```
     c. **[关卡2] task-analyze 由 openspec-tasks 退出契约自动触发**
        - openspec-tasks 生成 tasks.md 后，自动调用 **openspec-task-analyze** skill（subagent 独立执行）
        - 如果审查未通过（有 GAP、MISMATCH 或严重 QUALITY 问题）：必须修正 tasks 后重审，**禁止进入实施**
        - 审查通过后，继续实施
  ```

- [ ] **Step 3：同步更新 getOpsxFfCommandTemplate 的护栏说明**

  在 `getOpsxFfCommandTemplate` 的 content 字符串中，找到：

  ```
  - **三道关卡是强制的**：design 后 plan-review，tasks 后 task-analyze，实施后 verify
  ```

  替换为：

  ```
  - **三道关卡是强制的**：design 后由 plan-review（subagent）审查，tasks 由 openspec-tasks 生成后自动触发 task-analyze（subagent），实施后 verify
  ```

- [ ] **Step 4：构建验证**

  ```bash
  pnpm build
  ```

  Expected: 无错误

- [ ] **Step 5：提交**

  ```bash
  git add src/core/templates/workflows/ff-change.ts
  git commit -m "feat: ff-change 编排更新，显式调用 openspec-tasks"
  ```

---

### Task 6：continue-change.ts — 补充 design/tasks 门控

**Files:**
- Modify: `src/core/templates/workflows/continue-change.ts`

- [ ] **Step 1：在 skill template 的产出物创建后逻辑中添加门控**

  在 `getContinueChangeSkillTemplate` 的 instructions 字符串中，找到：

  ```
     - 展示创建了什么，以及现在解锁了什么
     - 创建一个产出物后停止
  ```

  替换为：

  ```
     - 展示创建了什么，以及现在解锁了什么
     - **[门控]** 如果刚创建的产出物 ID 为 `design`：在停止前自动调用 **openspec-plan-review**（subagent 独立执行 spec↔plan 审查）。审查通过后展示进度并停止；未通过则提示修正后重审。
     - **[门控]** 如果刚创建的产出物 ID 为 `tasks`：在停止前自动调用 **openspec-task-analyze**（subagent 独立执行 plan↔tasks 审查）。审查通过后展示进度并停止；未通过则提示修正后重审。
     - 其余产出物：创建后直接展示进度并停止。
  ```

- [ ] **Step 2：在 command template 中同步相同的门控说明**

  在 `getOpsxContinueCommandTemplate` 的 content 字符串中，找到：

  ```
     - 显示创建的内容以及现在解锁的内容
     - 创建一个产出物后停止
  ```

  替换为：

  ```
     - 显示创建的内容以及现在解锁的内容
     - **[门控]** 如果刚创建的产出物 ID 为 `design`：停止前自动调用 **openspec-plan-review**（subagent）。通过后停止；未通过则提示修正。
     - **[门控]** 如果刚创建的产出物 ID 为 `tasks`：停止前自动调用 **openspec-task-analyze**（subagent）。通过后停止；未通过则提示修正。
     - 其余产出物：创建后直接展示进度并停止。
  ```

- [ ] **Step 3：构建验证**

  ```bash
  pnpm build
  ```

  Expected: 无错误

- [ ] **Step 4：提交**

  ```bash
  git add src/core/templates/workflows/continue-change.ts
  git commit -m "feat: continue-change 在 design/tasks 产出物后内置门控审查"
  ```

---

### Task 7：更新 parity 测试哈希

**Files:**
- Modify: `test/core/templates/skill-templates-parity.test.ts`

parity 测试追踪了 `getContinueChangeSkillTemplate`、`getOpsxContinueCommandTemplate`、`getFfChangeSkillTemplate`、`getOpsxFfCommandTemplate` 的内容哈希。Task 5 和 Task 6 修改了这四个函数，需要更新期望哈希。

- [ ] **Step 1：运行 parity 测试，捕获新哈希**

  ```bash
  pnpm test test/core/templates/skill-templates-parity.test.ts 2>&1 | grep -A 40 "Expected\|Received\|received"
  ```

  Expected: 测试失败，输出 "Expected" 和 "Received" 两个对象的差异，其中 "Received" 包含四个函数的新哈希值。

- [ ] **Step 2：用新哈希更新 EXPECTED_FUNCTION_HASHES**

  在 `test/core/templates/skill-templates-parity.test.ts` 中，用 Step 1 捕获到的 Received 值替换 `EXPECTED_FUNCTION_HASHES` 中的以下四项：

  ```typescript
  getContinueChangeSkillTemplate: '<新哈希>',
  getFfChangeSkillTemplate: '<新哈希>',
  getOpsxContinueCommandTemplate: '<新哈希>',
  getOpsxFfCommandTemplate: '<新哈希>',
  ```

  同时用新哈希更新 `EXPECTED_GENERATED_SKILL_CONTENT_HASHES` 中对应的两项：

  ```typescript
  'openspec-continue-change': '<新哈希>',
  'openspec-ff-change': '<新哈希>',
  ```

- [ ] **Step 3：确认 parity 测试通过**

  ```bash
  pnpm test test/core/templates/skill-templates-parity.test.ts
  ```

  Expected: PASS

- [ ] **Step 4：运行全量测试确认无回归**

  ```bash
  pnpm test
  ```

  Expected: 全部 PASS

- [ ] **Step 5：提交**

  ```bash
  git add test/core/templates/skill-templates-parity.test.ts
  git commit -m "test: 更新 parity 哈希以反映 ff-change/continue-change 门控改动"
  ```
