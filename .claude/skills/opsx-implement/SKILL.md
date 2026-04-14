---
name: opsx-implement
description: 按 tasks.md 逐项实施，每项强制 TDD 循环。当 OpenSpec change 的 artifact 全部就绪、准备开始编码时使用。
---

实施 Skill。按照 tasks.md 逐项实施，每项任务强制执行 TDD 循环。

## 硬性门控

**进入实施前必须确认以下关卡已通过：**
1. opsx-plan-review（spec↔plan 一致性）已通过
2. opsx-task-analyze（plan↔tasks 一致性）已通过

如果任一关卡未通过，**拒绝开始实施**，提示用户先完成对应审查。

## 输入 / 输出边界

**读取：**
- `openspec/changes/<name>/.openspec.yaml`（校验 gates）
- `openspec/changes/<name>/tasks.md`（进度恢复和任务内容）
- `openspec/changes/<name>/design.md`（理解设计意图）
- `openspec/changes/<name>/specs/**/*.md`（理解需求）
- `.aiknowledge/codemap/` 和 `.aiknowledge/pitfalls/`（按需）
- tasks.md 中"涉及文件"字段列出的代码文件

**产出：**
- tasks.md `[ ]` → `[x]`（逐项标记完成）
- 业务代码和测试代码
- `openspec/changes/<name>/test-report.md`（TDD 留档）

## 启动序列

1. 读取 `openspec/changes/<name>/.openspec.yaml`，**校验 `gates.plan-review` 和 `gates.task-analyze` 字段均存在**；任一缺失则拒绝执行并提示缺失的关卡名称
2. 读取当前变更的 `tasks.md`，找到第一个 `[ ]` 任务作为起点，恢复进度
3. 确认所有产出物（proposal/design/specs）已就绪
4. 按需读取 `.aiknowledge/`（index-first，禁止全量扫描）：
   - 先读 `.aiknowledge/codemap/index.md`，识别本次变更涉及的模块
   - 仅读取命中模块的 `<module>.md`（及必要的 `chains/*.md`），定位代码位置和模块边界
   - 先读 `.aiknowledge/pitfalls/index.md`，识别相关领域
   - 仅读取命中领域的 `<domain>/index.md`；如命中具体条目，继续读取 L3 条目文件（`<domain>/<slug>.md`）获取详细修复模式，实施时主动规避已知陷阱
5. 确认测试框架已配置并可运行

## subagent 实施

使用 Agent tool 启动 **1 个** subagent，实施全部任务：

```
Agent({
  description: "实施 <name> 全部任务",
  subagent_type: "general-purpose",
  prompt: `你是 implement agent。

## 输入
读取 openspec/changes/<name>/tasks.md 找到第一个 [ ] 任务作为起点，恢复实施进度。
读取 openspec/changes/<name>/design.md 和 openspec/changes/<name>/specs/**/*.md 理解设计意图和需求。

## 实施规则
按 tasks.md 顺序逐一实施，对每个任务：
1. 读取 design.md 和 specs/ 中对应部分理解设计意图
2. 先校验依赖（blockedBy 中列出的前置任务均已 [x]）；如未完成则暂停并报告 task 依赖异常
3. 按执行方式标签执行：
   - test-first：先写失败测试 → 实现 → 确认测试通过
   - characterization-first：先固化旧行为测试 → 再修改代码
   - direct：纯配置/脚手架场景直接执行
4. 确保每条验收标准有对应测试或显式"不需要测试"理由
5. 每完成一个任务，立即在 tasks.md 中将该任务的 [ ] 改为 [x]
6. 不要求在 implement 阶段执行 git commit；只有用户明确要求时才提交

## 完成后报告
每个任务：修改了哪些文件、测试结果（通过/失败数）、是否产生 commit；并输出最终任务完成情况摘要`
})
```

## 暂停条件

在以下情况下暂停实施并通知用户：
- 发现任务描述不清晰，需要澄清
- 发现设计遗漏，需要补充
- 发现任务之间有未记录的依赖
- 遇到超出预期的技术困难

## 完成条件

- tasks.md 中所有任务标记为已完成（全部 `[x]`）
- 所有测试通过

## 退出契约

- 输出实施摘要，包含完成的任务数、测试数和关键实现决策
- **必须**转入 **opsx-verify** 进行三维验证检查。这不是建议，是强制要求。禁止跳过验证直接归档或上线。
