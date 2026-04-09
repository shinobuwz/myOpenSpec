---
name: "OPSX: 验证"
description: 在归档前验证实现是否与变更产出物匹配
category: 工作流
tags: [workflow, verify, experimental]
---

验证实现是否与变更产出物（规范、任务、设计）匹配。

**输入**：可选择在 `/opsx:verify` 后指定变更名称（例如，`/opsx:verify add-auth`）。如果省略，检查是否可以从对话上下文中推断出来。如果模糊或不明确，你必须提示可用的变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 `openspec-cn list --json` 获取可用变更。使用 **AskUserQuestion tool** 让用户选择。
   将任务未完成的变更标记为 "(进行中)"。

2. **检查状态** — `openspec-cn status --change "<name>" --json`

3. **加载产出物** — `openspec-cn instructions apply --change "<name>" --json`，读取所有 contextFiles

4. **三维并行验证**：使用 Agent tool 同时派遣 3 个 subagent 并行执行完整性/正确性/一致性检查，汇总报告

5. **生成报告**：摘要记分卡 + CRITICAL/WARNING/SUGGESTION 分级问题列表 + 最终评估

**优雅降级**：仅有 tasks.md → 只派遣完整性 subagent；tasks+规范 → 完整性+正确性；全产出物 → 三维并行全验

**退出**：无 CRITICAL → 可归档；有 CRITICAL → 修复后重验
