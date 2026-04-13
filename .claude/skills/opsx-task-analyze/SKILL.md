---
name: opsx-task-analyze
description: 任务分析：检查 tasks 是否完整覆盖 design/specs 需求、是否与 design 一致。在 tasks 生成后、implement 之前使用。
license: MIT
compatibility: 直接文件操作，无需外部 CLI。
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.2.0-cc.4"
---

# 任务分析：plan↔tasks 一致性检查

## 硬性门控

**这是强制关卡。** 在本 skill 输出"可实施"结论之前，禁止进入 opsx-implement 或任何编码活动。

## 启动序列

1. 确认 git 工作区干净
2. 读取 `openspec/changes/<name>/.openspec.yaml` 获取 schema 定义，然后检查各产出物文件是否已存在，确认 tasks artifact 已生成
3. 确认 opsx-plan-review 已通过（spec↔plan 一致性已验证）
4. 渐进加载制品（最小只读范围，禁止全量读取）：

   **从 specs/ 加载：**
   - 每条需求的 `**Trace**: R?` 声明
   - 需求描述（一行摘要）
   - 不读 Given/When/Then 展开内容

   **从 design.md 加载：**
   - `## 需求追踪` 章节（R→U 映射）
   - 实施单元 [U?] 列表及简述
   - 架构/技术选型决策（仅关键约束，不读详细说明）
   - 不读序列图、数据模型、接口定义等实施细节

   **从 tasks.md 加载：**
   - Task ID 及描述
   - `[R?][U?][执行模式]` 标签
   - 涉及的文件路径
   - 验证方式
   - 依赖关系（blockedBy）

   **不加载 proposal.md**（plan-review 阶段已验证，此处无需重读）

## 审查方式

使用 Agent tool 启动 subagent 进行独立审查。subagent 只读取产出物文件，不做任何修改。审查结果由 subagent 汇报，主 agent 汇总输出。

## 审查维度

### 需求覆盖（design/specs → tasks）
- 每个实施单元 [U1] 都必须落到至少一个 task
- 每条需求必须有至少一个带 [R1] 标签的 task 对应
- 每条 Given/When/Then 场景必须有对应的验证方式
- 标记未覆盖的需求为 **GAP**

### 设计一致性（design → tasks）
- design.md 中的架构决策是否在 tasks 中体现
- 技术选型是否与 task 实施方式匹配
- 模块划分是否与 task 粒度对齐
- task 是否使用 `[R?][U?][test-first|characterization-first|direct]` 标签
- 标记不一致为 **MISMATCH**

### tasks 质量检查
- 每个 task 是否有精确文件路径
- 每个 task 是否有明确的验证方式
- task 之间是否有隐含依赖未标注
- task 粒度是否合理（过大需拆分，过小可合并）
- 标记问题为 **QUALITY**

## 输出格式

```
## 任务分析报告

### 覆盖矩阵
| 需求 | 实施单元 | 对应 Task | 状态 |
|------|----------|----------|------|
| R1 | U1 | Task N | ✓/GAP |

### 问题列表
[GAP] 需求 X / 单元 UY 无对应 task
[MISMATCH] design 决策 Y 与 task Z 实施方式冲突
[QUALITY] Task W 缺少 trace / 执行方式 / 验证方式

### 结论
可实施 / 需补充后实施
```

## 完成条件

- 分析报告已输出
- 覆盖矩阵已完成
- 所有 GAP 和 MISMATCH 已列出

## 退出契约

- **如"可实施"**：必须转入 **opsx-implement**。这不是建议，是强制要求。
- **如"需补充"**：必须回到 **opsx-plan** 修正 tasks.md。禁止绕过直接进入实施。
- 所有发现已记录在分析报告中
