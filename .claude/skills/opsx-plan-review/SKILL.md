---
name: opsx-plan-review
description: 规划审查：检查 specs 需求是否完整进入 design。在 plan 生成 design 后、生成 tasks 之前使用。
license: MIT
compatibility: 需要 openspec CLI。
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.2.0-cc.4"
---

# 规划审查：spec↔plan 一致性检查

## 硬性门控

**这是强制关卡。** 在本 skill 输出"通过"结论之前，禁止生成 tasks.md 或进入任何后续阶段。

## 启动序列

1. 确认 git 工作区干净
2. `openspec-cn status --change "<name>" --json` 确认 design artifact 已生成
3. `openspec-cn instructions apply --change "<name>" --json` 读取 `gateReview` facts bundle
4. 读取 change 的 artifact：proposal.md、design.md、specs/

## 审查方式

使用 Agent tool 启动 subagent 进行独立审查。subagent 共享同一个 `gateReview` facts bundle 作为事实底座，但不得共享彼此的 findings、主 agent 怀疑点或预设严重级别。subagent 只读取共享 facts、指定产出物文件和当前维度的审查清单，不做任何修改。审查结果由 subagent 汇报，主 agent 汇总输出。

## 审查维度

### 需求进入设计（specs → design）
- 逐条检查 delta specs 中的每个需求
- 每条需求都必须有 trace id（如 [R1]）
- design.md 的 `## 需求追踪` 中必须存在 `- [R1] -> [U1]` 映射
- 标记未进入设计的需求为 **TRACE_GAP**

### 需求颗粒度审查
- 检查每条需求是否只描述一个独立的可验证行为
- 如果一条需求同时包含多个独立行为（如"实现 X 并支持 Y 格式并处理 Z 场景"），标记为 **COARSE_R**
- **COARSE_R** 需回 specs 拆分为更细的独立需求，每条只描述一个行为，再重新审查

### 设计完整性（design 自洽检查）
- 收集 design.md 需求追踪中所有出现的 R 编号（如 `[R1]`、`[R2]`）
- 收集 specs/ 目录中所有 `**Trace**: R?` 声明的 R 编号
- 对比两者：design 中的每个 R 编号必须在 specs 中有对应的 `**Trace**: R?` 声明，否则标记为 **GHOST_R**
- 实施单元 [U?] 是否都有对应的需求来源 [R?]，否则标记为 **ORPHAN**
- 注：**GHOST_R** = design 引用了 specs 中不存在的 R 编号；**ORPHAN** = 实施单元 U 没有任何 R 驱动

## 输出格式

```
## 规划审查报告（spec↔plan）

### 追踪矩阵
| 需求 | Trace ID | 实施单元 | 状态 |
|------|----------|----------|------|
| ... | R1 | U1 | ✓/TRACE_GAP/GHOST_R/ORPHAN/COARSE_R |

### 问题列表
[TRACE_GAP] 需求 X 未进入 design 实施单元
[GHOST_R] RY 在 design 中出现但 specs/ 中无对应 **Trace**: RY 声明
[ORPHAN] 实施单元 UZ 无对应需求来源（无 R 驱动）
[COARSE_R] RX 颗粒度过粗，包含多个独立行为，需回 specs 拆分

### 结论
通过 / 需修正后重审
```

## 完成条件

- 审查报告已输出
- 追踪矩阵已完成
- 所有 TRACE_GAP、GHOST_R、ORPHAN 和 COARSE_R 已列出

## 退出契约

- **如"通过"**：必须转入 **opsx-tasks** 生成 tasks.md。这不是建议，是强制要求。
- **如"需修正"**：必须回到 **opsx-plan** 修正 design.md 和 specs/。禁止跳过直接生成 tasks。COARSE_R 问题需在 specs 中将粗粒度需求拆分为多条独立需求后重新审查。
- 所有发现已记录在审查报告中
