---
name: openspec-bootstrap
description: 会话启动引导。在每次会话开始时注入 skill 发现规则和工作流优先级。当 SessionStart hook 触发时使用。
license: MIT
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.2.0-cc.4"
---

会话启动引导 Skill。在每次会话开始时自动执行，注入 skill 发现规则和工作流优先级。

## 铁律

**1% 规则**：永远不要在没有明确计划的情况下开始编码。先理解需求，再设计方案，最后才写代码。

## 可用 Skill

| Skill | 触发词 | 用途 |
|-------|--------|------|
| openspec-explore | 探索、调查、脑暴、讨论方案 | 探索想法、澄清需求、方案对比与设计收敛 |
| openspec-knowledge | 经验、沉淀、知识库 | 独立沉淀 pitfalls；**归档后强制执行** |
| openspec-plan | 规划、计划、创建变更 | 创建 OpenSpec change 和 artifact |
| openspec-plan-review | plan skill 完成后 | 规划审查：spec↔plan 一致性 |
| openspec-task-analyze | tasks 生成后 | 任务分析：plan↔tasks 一致性 |
| openspec-tdd | 测试、TDD、红绿重构 | 测试先行开发 |
| openspec-implement | 实施、实现、开始编码 | 按 tasks.md 逐项实施 |
| openspec-verify | 验证、检查、质量 | 三维验证检查 |
| openspec-review | 审查、代码审查、review | 独立代码审查 |
| openspec-archive-change | 归档、上线、发布 | 归档 + knowledge + codemap + git |
| openspec-codemap | codemap、架构图、模块地图 | 独立维护 .aiknowledge/codemap/ 架构认知地图 |
| openspec-auto-drive | 自动驱动、auto、优化 | AI 自主驱动完整工作流 |

## 强制流程链

以下流程链中的 **[方括号]** 关卡是强制的，不可跳过：

```
explore → plan → [plan-review] → tasks → [task-analyze] → implement → [verify] → review → archive
                    spec↔plan               plan↔tasks                   tasks↔code
```

**铁律：**
- plan 生成 design 后，**必须**经过 plan-review 审查 spec↔plan 一致性，通过后才能生成 tasks
- tasks 生成后，**必须**经过 task-analyze 审查 plan↔tasks 一致性，通过后才能进入 implement
- implement 完成后，**必须**经过 verify 三维验证 tasks↔code 一致性，通过后才能进入 review
- 任何关卡未通过，必须回退修正，禁止绕过

## 优先级

处理 skill 时遵循以下优先级：
1. **强制关卡不可跳过** - plan-review、task-analyze、verify 是流程中的硬性检查点
2. **流程 skill 优先于实施 skill** - 先确保流程正确，再开始编码
3. **探索优先于规划** - 先理解问题，再制定计划
4. **TDD 优先于裸编码** - 任何产品代码都必须有测试覆盖

## 启动序列

1. 执行 `git status` 检查工作区状态
2. 执行 `ls openspec/changes/ | grep -v archive` 获取当前变更列表；若无输出则说明无活动变更
3. 读取现有状态，判断是否有未完成的工作流

## 完成条件

- skill 发现规则已注入会话上下文
- agent 已确认可用 skill 列表

## 退出契约

- 提交所有变更到 git
- 输出结构化摘要，包含完成的工作和下一步建议

## 合理化借口防护

| 借口 | 正确做法 |
|------|----------|
| "这个改动很小，不需要测试" | 所有改动都需要测试 |
| "先写代码再补测试" | 先写测试再写代码 |
| "设计太复杂了，先写代码看看" | 先完成设计，再开始编码 |
| "这只是个原型" | 原型也需要遵循流程 |
| "时间紧迫" | 流程是为了节省时间，不是浪费时间 |
