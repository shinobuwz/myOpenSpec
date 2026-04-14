---
name: opsx-plan-review
description: 规划审查：检查 specs 需求是否完整进入 design。在 plan 生成 design 后、生成 tasks 之前使用。
---

# 规划审查：spec↔plan 一致性检查

## 硬性门控

**这是强制关卡。** 在本 skill 输出"通过"结论之前，禁止生成 tasks.md 或进入任何后续阶段。

## 输入 / 输出边界

**读取：**
- `openspec/changes/<name>/.openspec.yaml`
- `openspec/changes/<name>/specs/**/*.md`
- `openspec/changes/<name>/design.md`
- 命中的 `.aiknowledge/codemap/` 和 `.aiknowledge/pitfalls/`（按需）

**产出：**
- `openspec/changes/<name>/audit-log.md`（追加）
- `openspec/changes/<name>/.openspec.yaml` 的 `gates.plan-review`（仅通过时）
- 不读取 / 不写入任何 `context/` 目录文件
- 不写入 `run-report-data.json`

## 启动序列

1. 确认 git 工作区干净
2. 读取 `openspec/changes/<name>/.openspec.yaml`，确认 design artifact 已生成
3. 直接读取 `specs/**/*.md` 和 `design.md` 作为审查输入

## 审查方式

使用 Agent tool 启动 1 个 subagent 进行独立审查：

subagent 直接读取 `openspec/changes/<name>/specs/**/*.md` 和 `openspec/changes/<name>/design.md`，在同一轮覆盖 trace、granularity、uniqueness、design-integrity 四类检查，并输出 1 个符合 **StageResult schema** 的 JSON（见 `docs/stage-packet-protocol.md` 第 1 节）。

subagent prompt 模板：

```
你是 plan-review reviewer。

## 输入
直接读取以下文件：
- `openspec/changes/<name>/specs/**/*.md` — 所有规格文件
- `openspec/changes/<name>/design.md` — 设计文档

## 审查任务
在同一轮审查中覆盖 trace、granularity、uniqueness、design-integrity 四类检查。

## 审查维度

### 1. 需求进入设计（specs → design）
- 逐条检查每个 **Trace**: R? 声明
- 在 design.md 的 ## 需求追踪 章节必须存在 R→U 映射
- 标记未进入设计的需求为 **TRACE_GAP**（severity: critical）

### 2. 需求颗粒度审查
- 检查每条需求是否只描述一个独立的可验证行为
- 如果一条需求同时包含多个独立行为，标记为 **COARSE_R**（severity: critical）

### 3. Trace 唯一性审查
- 收集所有 R 编号，任意两条复用同一 R 编号标记为 **DUPLICATE_R**（severity: critical）

### 4. 设计完整性（design 自洽检查）
- trace_mapping 中的每个 R 必须在 specs 中存在，否则标记为 **GHOST_R**（severity: critical）
- 每个 U 必须有至少一个 R 驱动，否则标记为 **ORPHAN**（severity: critical）

## 输出要求
输出一个符合 StageResult schema 的 JSON 对象：
{
  "version": 1,
  "run_id": "<生成一个 ISO8601-short-hash 格式的唯一标识>",
  "change_id": "<change 目录名>",
  "stage": "plan-review",
  "packet_id": "plan-review-001",
  "agent_role": "plan-reviewer",
  "summary": "一句话总结",
  "decision": "pass|pass_with_warnings|fail",
  "metrics": {"findings_total": N, "critical": N, "warning": N, "suggestion": N},
  "findings": [
    {"id": "F1", "severity": "critical|warning|suggestion", "dimension": "TRACE_GAP|COARSE_R|DUPLICATE_R|GHOST_R|ORPHAN", "message": "...", "trace_id": "R?"}
  ]
}
```

## 汇总逻辑

主 agent 收集 subagent 的 StageResult JSON，基于 specs/ + design.md 生成追踪矩阵。

## 输出格式

```
## 规划审查报告（spec↔plan）

### 追踪矩阵
| 需求 | Trace ID | 实施单元 | 状态 |
|------|----------|----------|------|
| ... | R1 | U1 | ✓/TRACE_GAP/GHOST_R/ORPHAN/COARSE_R/DUPLICATE_R |

### 问题列表
[TRACE_GAP] 需求 X 未进入 design 实施单元
[GHOST_R] RY 在 design 中出现但 specs/ 中无对应 **Trace**: RY 声明
[ORPHAN] 实施单元 UZ 无对应需求来源（无 R 驱动）
[COARSE_R] RX 颗粒度过粗，包含多个独立行为，需回 specs 拆分
[DUPLICATE_R] RX 在多个需求或多个 spec 文件中重复使用，需统一重新编号

### Stage Result（JSON）
（subagent 输出的 StageResult JSON）

### 结论
通过 / 需修正后重审
```

## 完成条件

- 审查报告已输出
- 追踪矩阵已完成
- 所有 TRACE_GAP、GHOST_R、ORPHAN、COARSE_R 和 DUPLICATE_R 已列出

## 退出契约

- **如"通过"**：
  1. 追加 `openspec/changes/<name>/audit-log.md`，格式：
     ```
     ## plan-review | <ISO8601 时间戳> | pass
     方向：specs/**/*.md + design.md → tasks.md
     修正：<修正项列表，每行一条；无发现时写"无发现">
     ```
     若写入 audit-log.md 时文件损坏（已存在但无法追加），中止并报错，禁止继续。
  2. 写入门控状态：在 `.openspec.yaml` 的 `gates:` 下添加 `plan-review: "<ISO8601 时间戳>"`
  3. 必须转入 **opsx-tasks** 生成 tasks.md。这不是建议，是强制要求。
- **如"需修正"**：
  1. 追加 `openspec/changes/<name>/audit-log.md`，格式：
     ```
     ## plan-review | <ISO8601 时间戳> | fail
     方向：specs/**/*.md + design.md → tasks.md
     问题：<问题列表，每行一条>
     需修正：<需修正内容，每行一条>
     ```
     若写入时文件损坏，中止并报错。
  2. 不写入 gates
  3. 必须回到 **opsx-plan** 修正 design.md 和 specs/。禁止跳过直接生成 tasks
  4. COARSE_R 问题需在 specs 中将粗粒度需求拆分为多条独立需求后重新审查
  5. DUPLICATE_R 问题需在所有相关 spec 文件中统一重新编号后重审
- 所有发现已记录在审查报告中
