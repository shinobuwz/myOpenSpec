# Auto-Drive 迭代记录机制 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 openspec-auto-drive 添加持久化迭代记录，每轮写 iter-N.md，完成时生成 summary.md，存入 `.aiknowledge/auto-drive/<change-name>/`。

**Architecture:** 只修改 `auto-drive.ts` 的 instructions 字符串，新增"记录机制"节，并在 Phase 6 和退出契约中插入写入指令。属于模板字符串内容变更，无逻辑代码改动。

**Tech Stack:** TypeScript, Vitest (`pnpm test`)

---

### Task 1：在 auto-drive.ts 中新增"## 记录机制"节

**Files:**
- Modify: `src/core/templates/workflows/auto-drive.ts`

- [ ] **Step 1：读取文件，确认当前内容**

  读取 `src/core/templates/workflows/auto-drive.ts`，定位到 `## 引擎循环` 节之前的位置（目前该节在 `## 配置收集` 之后）。

- [ ] **Step 2：在 `## 引擎循环` 之前插入 `## 记录机制` 节**

  找到：
  ```
  ## 引擎循环
  ```

  在其**正前方**插入：

  ```
  ## 记录机制

  每次迭代和最终完成时，将结果写入 `.aiknowledge/auto-drive/<change-name>/`：

  ```
  .aiknowledge/auto-drive/
  └── <change-name>/
      ├── iter-01.md   ← 每轮 Phase 7 完成后写入
      ├── iter-02.md
      └── summary.md   ← 退出契约触发时生成
  \```

  **iter-N.md 格式**（文件名两位数补零，如 iter-01.md）：

  \```markdown
  # 第 N 轮迭代

  **时间**：YYYY-MM-DD HH:MM
  **量化指标**：目标值 X，本轮实测 Y，差距 Z

  ## 本轮方案

  explore/plan 阶段收敛的核心决策（1-3 句）

  ## verify 发现

  - [CRITICAL/WARNING/SUGGESTION] 问题描述

  ## 决策

  达标 / 继续下一轮 / 卡住回退

  ## 卡住原因（如有）

  说明连续 2 轮无改进的表现和回退策略
  \```

  **summary.md 格式**：

  \```markdown
  # Auto-Drive 摘要：<change-name>

  **总轮次**：N
  **最终状态**：达标 / 超出迭代上限 / 手动停止
  **目标**：<用户设定的优化目标>
  **量化标准**：<达标条件>

  ## 指标趋势

  | 轮次 | 实测值 | 达标 |
  |------|--------|------|
  | 1    | Y1     | ✗    |
  | 2    | Y2     | ✓    |

  ## 关键转折

  - 第 N 轮：<什么决策带来了突破或停滞>

  ## 参考文件

  - [第 1 轮](iter-01.md)
  - [第 N 轮](iter-N.md)
  \```

  ## 引擎循环
  ```

  注意：上述插入内容中的三连反引号代码块在模板字符串中需用 `\`\`\`` 转义。

- [ ] **Step 3：构建验证**

  ```bash
  cd /Users/cc/MyHarness/OpenSpec-cn && pnpm build
  ```

  Expected: 无错误

- [ ] **Step 4：运行结构测试**

  ```bash
  cd /Users/cc/MyHarness/OpenSpec-cn && pnpm test test/core/templates/harness-skills.test.ts
  ```

  Expected: PASS（auto-drive 的三个结构测试：有效 SkillTemplate、包含中文、`##` 节数 ≤ 10）

  **注意**：插入新节后 `##` 节数会从当前值增加 1。若超过 10 则需将 `## 记录机制` 改为子节（`###`）。先确认当前节数再决定。

- [ ] **Step 5：提交**

  ```bash
  cd /Users/cc/MyHarness/OpenSpec-cn && git add src/core/templates/workflows/auto-drive.ts && git commit -m "feat: auto-drive 新增记录机制节（iter-N.md + summary.md 格式）"
  ```

---

### Task 2：在 Phase 6 末尾插入 iter-N.md 写入指令

**Files:**
- Modify: `src/core/templates/workflows/auto-drive.ts`

- [ ] **Step 1：定位 Phase 6**

  在 instructions 字符串中，找到：
  ```
  **Phase 6 - 度量**：运行量化标准，检查是否达标
  ```

- [ ] **Step 2：将 Phase 6 扩展为写入触发**

  找到：
  ```
  **Phase 6 - 度量**：运行量化标准，检查是否达标
  ```

  替换为：
  ```
  **Phase 6 - 度量**：运行量化标准，检查是否达标；度量完成后立即写入 iter-N.md（N 为当前轮次，两位数补零），记录：本轮实测值、本轮方案摘要（来自 Phase 2-3）、verify 发现（来自 Phase 5）、达标与否
  ```

- [ ] **Step 3：构建验证**

  ```bash
  cd /Users/cc/MyHarness/OpenSpec-cn && pnpm build
  ```

  Expected: 无错误

- [ ] **Step 4：运行测试**

  ```bash
  cd /Users/cc/MyHarness/OpenSpec-cn && pnpm test test/core/templates/harness-skills.test.ts
  ```

  Expected: PASS

- [ ] **Step 5：提交**

  ```bash
  cd /Users/cc/MyHarness/OpenSpec-cn && git add src/core/templates/workflows/auto-drive.ts && git commit -m "feat: auto-drive Phase 6 度量后写入 iter-N.md"
  ```

---

### Task 3：在退出契约中插入 summary.md 生成指令

**Files:**
- Modify: `src/core/templates/workflows/auto-drive.ts`

- [ ] **Step 1：定位退出契约**

  在 instructions 字符串中，找到：
  ```
  ## 退出契约

  - 输出优化摘要，包含每次迭代的度量结果
  - 输出最终状态和改进幅度
  - 提供后续优化建议
  ```

- [ ] **Step 2：替换退出契约**

  替换为：
  ```
  ## 退出契约

  - 生成 `.aiknowledge/auto-drive/<change-name>/summary.md`，汇总所有 iter-N.md 的指标趋势、关键转折和参考链接
  - 输出最终状态（达标 / 超出迭代上限 / 手动停止）和改进幅度
  - 提示用户 summary.md 的路径：`.aiknowledge/auto-drive/<change-name>/summary.md`
  - 提供后续优化建议
  ```

- [ ] **Step 3：构建验证**

  ```bash
  cd /Users/cc/MyHarness/OpenSpec-cn && pnpm build
  ```

  Expected: 无错误

- [ ] **Step 4：运行全量测试**

  ```bash
  cd /Users/cc/MyHarness/OpenSpec-cn && pnpm test
  ```

  Expected: 全部 PASS

- [ ] **Step 5：提交**

  ```bash
  cd /Users/cc/MyHarness/OpenSpec-cn && git add src/core/templates/workflows/auto-drive.ts && git commit -m "feat: auto-drive 退出契约生成 summary.md"
  ```

---

### Task 4：版本号更新 + 强制安装

**Files:**
- Modify: `package.json`

- [ ] **Step 1：更新版本号**

  在 `package.json` 中，将：
  ```json
  "version": "1.2.0-cc.2",
  ```
  改为：
  ```json
  "version": "1.2.0-cc.3",
  ```

- [ ] **Step 2：构建并强制安装**

  ```bash
  cd /Users/cc/MyHarness/OpenSpec-cn && pnpm build && node bin/openspec.js update --force 2>&1
  ```

  Expected: `✓ 已更新: CodeBuddy Code (CLI) (v1.2.0-cc.3)`

- [ ] **Step 3：提交**

  ```bash
  cd /Users/cc/MyHarness/OpenSpec-cn && git add package.json && git commit -m "chore: bump version to 1.2.0-cc.3"
  ```
