---
name: openspec-task-analyze
description: 任务分析：检查 tasks 是否完整覆盖 design/specs 需求、是否与 design 一致。在 tasks 生成后、implement 之前使用。
license: MIT
compatibility: 需要 openspec CLI。
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.2.0-cc.4"
---

# 任务分析：plan↔tasks 一致性检查

## 硬性门控

**这是强制关卡。** 在本 skill 输出"可实施"结论之前，禁止进入 openspec-implement 或任何编码活动。

## 启动序列

1. 确认 git 工作区干净
2. `openspec-cn status --change "<name>" --json` 确认 tasks artifact 已生成
3. 确认 openspec-plan-review 已通过（spec↔plan 一致性已验证）
4. 读取 change 的全部 artifact：proposal.md、design.md、specs/、tasks.md

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

### TDD 标签强制审查（ANTI-TDD 模式检测）

以下情况必须标记为 **ANTI-TDD**，与 GAP/MISMATCH 同等级别，阻塞实施：

1. **独立测试 task** — 任何描述含"编写测试"、"添加测试"、"单元测试"的独立 task，且没有对应的实现 task 与之合并
2. **测试后置** — 实现 task 标注 `[direct]`，而同一变更中有后续 task 专门为其补测试
3. **缺失标签** — task 没有 `[test-first|characterization-first|direct]` 中的任一标签
4. **错误标签** — task 涉及函数逻辑/业务规则但标注了 `[direct]`（需逐 task 判断）
5. **无测试路径** — `[test-first]` task 的涉及文件中没有测试文件路径

**判断"涉及函数逻辑"的标准**：task 描述或验收标准中出现"函数"、"计算"、"返回"、"判断"、"处理"、"调用"、"状态"等词，即推定为业务逻辑。

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

- **如"可实施"**：必须转入 **openspec-implement**。这不是建议，是强制要求。
- **如"需补充"**：必须回到 **openspec-plan** 修正 tasks.md。禁止绕过直接进入实施。
- 所有发现已记录在分析报告中
