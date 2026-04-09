---
name: openspec-implement
description: 按 tasks.md 逐项实施，每项强制 TDD 循环。当 OpenSpec change 的 artifact 全部就绪、准备开始编码时使用。
license: MIT
compatibility: 需要 openspec CLI。
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.2.0-cc.4"
---

实施 Skill。按照 tasks.md 逐项实施，每项任务强制执行 TDD 循环。

## 硬性门控

**进入实施前必须确认以下关卡已通过：**
1. openspec-plan-review（spec↔plan 一致性）已通过
2. openspec-task-analyze（plan↔tasks 一致性）已通过

如果任一关卡未通过，**拒绝开始实施**，提示用户先完成对应审查。

## 启动序列

1. 确认 openspec-task-analyze 已通过（检查分析报告结论为"可实施"）
2. 读取当前变更的 `tasks.md`，获取完整任务列表
3. 确认所有产出物（proposal/design/specs）已就绪
4. 读取 `.aiknowledge/codemap/` 中涉及模块的文件，定位代码位置和模块边界
5. 确认测试框架已配置并可运行
6. 找到第一个未完成的任务

## 并行实施策略

在逐项执行前，先分析 tasks.md 的依赖关系，识别可并行的独立任务组：

### 依赖分析

1. 解析 tasks.md 中每个任务的依赖标注（如”依赖 Task 1”、”blockedBy”等）
2. 构建任务依赖 DAG
3. 识别同一层级（无互相依赖）的任务组

### 并行条件

任务组满足**全部**以下条件时，可以并行派遣：
- 组内任务之间无依赖关系
- 组内任务修改的文件路径无重叠（通过任务描述中的文件路径判断）
- 组内至少有 2 个任务

### 并行执行

对可并行的任务组，在**同一条消息**中使用 Agent tool 派遣多个 worktree-isolated subagent：

```
Agent({
  description: “实施 Task N”,
  subagent_type: “general-purpose”,
  isolation: “worktree”,
  prompt: `在隔离 worktree 中实施以下任务：

  任务编号：N
  任务描述：<从 tasks.md 摘取>
  验收标准：<从 tasks.md 摘取>
  执行方式：[test-first|characterization-first|direct]

  上下文文件：
  <列出 proposal.md, design.md, specs/ 的路径>

  执行步骤：
  1. 读取上下文文件理解设计意图
  2. 按执行方式进行 TDD 循环（test-first: 先写失败测试→实现→重构）
  3. 确保所有验收标准有对应测试
  4. git commit 所有变更

  完成后报告：修改了哪些文件、测试结果、commit hash`
})
```

### 合并策略

所有并行 subagent 完成后：
1. 检查每个 subagent 的返回结果（worktree 路径和分支名）
2. 逐个合并 worktree 分支到当前分支（`git merge <worktree-branch>`）
3. 如果合并冲突：暂停，提示用户手动解决
4. 合并成功后在 tasks.md 中标记对应任务为 `[x]`
5. 提交 tasks.md 更新

### 回退机制

- subagent 报告失败 → 不合并该 worktree，标记任务为”需要手动处理”
- 合并冲突 → 暂停并行，回退到串行模式处理剩余任务
- 测试不通过 → 回退该 worktree 的合并（`git revert`）

## 串行流程

对有依赖关系的任务、或并行组执行完毕后的剩余任务，按以下循环逐个执行：

### 1. 展示任务
- 显示当前任务的编号、描述和验收标准
- 解析并展示任务标签：需求 [R?]、实施单元 [U?]、执行方式 [test-first|characterization-first|direct]
- 确认用户理解任务内容

### 2. TDD 循环
- 如果任务是 `[test-first]`：调用 openspec-tdd 执行红绿重构循环
- 如果任务是 `[characterization-first]`：先固化旧行为测试，再修改代码
- 如果任务是 `[direct]`：仅在纯样式、纯配置、纯脚手架场景直接执行
- 确保每个验收标准都有对应的测试或显式的”不需要测试”理由
- 所有验证通过后才算任务完成

### 3. 标记完成
- 在 tasks.md 中将任务标记为已完成
- 记录完成时间和关键实现细节

### 4. 提交
- 将任务相关的所有变更提交到 git
- 提交信息包含任务编号和简要描述

### 5. 下一个
- 自动进入下一个未完成的任务
- 如果所有任务完成，进入完成条件检查

## 暂停条件

在以下情况下暂停实施并通知用户：
- 发现任务描述不清晰，需要澄清
- 发现设计遗漏，需要补充
- 发现任务之间有未记录的依赖
- 遇到超出预期的技术困难

## 完成条件

- tasks.md 中所有任务标记为已完成
- 所有测试通过
- 所有变更已提交到 git

## 退出契约

- 输出实施摘要，包含完成的任务数、测试数和关键实现决策
- **必须**转入 **openspec-verify** 进行三维验证检查。这不是建议，是强制要求。禁止跳过验证直接归档或上线。
