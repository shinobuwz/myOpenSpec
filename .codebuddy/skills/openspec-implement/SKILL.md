---
name: openspec-implement
description: 按 tasks.md 逐项实施，每项强制 TDD 循环。当 OpenSpec change 的 artifact 全部就绪、准备开始编码时使用。
license: MIT
compatibility: 需要 openspec CLI。
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.2.0-cc.3"
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

## 流程

对每个任务重复以下循环：

### 1. 展示任务
- 显示当前任务的编号、描述和验收标准
- 解析并展示任务标签：需求 [R?]、实施单元 [U?]、执行方式 [test-first|characterization-first|direct]
- 确认用户理解任务内容

### 2. TDD 循环
- 如果任务是 `[test-first]`：调用 openspec-tdd 执行红绿重构循环
- 如果任务是 `[characterization-first]`：先固化旧行为测试，再修改代码
- 如果任务是 `[direct]`：仅在纯样式、纯配置、纯脚手架场景直接执行
- 确保每个验收标准都有对应的测试或显式的“不需要测试”理由
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
