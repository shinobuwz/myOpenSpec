---
name: opsx-plan-review
description: 规划审查：检查 specs 需求是否完整进入 design。在 plan 生成 design 后、生成 tasks 之前使用。
---

# 规划审查：spec↔plan 一致性检查

## 硬性门控

**这是强制关卡。** 在本 skill 输出"通过"结论之前，禁止生成 tasks.md 或进入任何后续阶段。

## 启动序列

1. 确认 git 工作区干净
2. 读取 `openspec/changes/<name>/.openspec.yaml` 获取 schema 定义，然后检查各产出物文件是否已存在，确认 design artifact 已生成
3. **组装 PlanReviewPacket**（参照 `docs/stage-packet-protocol.md` 第 4.1 节）：

   **core_payload 组装：**
   - `artifact_presence`：检查 proposal.md / specs/ / design.md 是否存在
   - `requirements`：从 specs/ 收集每条需求的 `**Trace**: R?` 声明和一行摘要（不读完整 Given/When/Then）
   - `trace_mapping`：从 design.md 的 `## 需求追踪` 章节提取 R→U 映射
   - `units`：从 design.md 提取 [U?] 标题列表

   **optional_refs 组装：**
   - `source_refs`：列出所有存在的产出物文件路径和 kind
   - `knowledge_refs`：读取 `.aiknowledge/codemap/index.md` 和 `.aiknowledge/pitfalls/index.md`，识别命中模块/领域，只记录路径引用

4. **校验 Packet Budget**：计算 estimated_tokens（字符数/4）。如超过 soft_limit(2000) 记录警告；如需要预降维则记录到 `budget.truncated_fields`；超过 hard_limit(4000) 必须按固定降维顺序截断后再发送（见协议文档第 2.2 节）

5. 填充 packet 元数据（version, change_id, stage, packet_id, created_at, producer, budget）
   - 如 `openspec/changes/<name>/context/run-report-data.json` 已存在且 JSON 合法且包含 `run_id`，必须复用该 `run_id`
   - 如文件存在但 JSON 解析失败，必须中止并报错，禁止覆盖；由用户手动确认后才可重置
   - 否则生成新的 `run_id`（格式：`<ISO8601>-<short-hash>`）

## 审查方式

使用 Agent tool 启动 1 个 subagent 进行独立审查：
- reviewer 收到的输入 = PlanReviewPacket JSON
- reviewer 只能读取 packet 中 `source_refs` 和 `knowledge_refs` 列出的文件（Lazy Hydration）
- reviewer 必须输出符合 **StageResult schema** 的 JSON（见 `docs/stage-packet-protocol.md` 第 3 节）

subagent prompt 模板：

```
你是 plan-review reviewer。

## 输入 Packet
{PlanReviewPacket JSON}

## 你的审查任务
在同一轮审查中覆盖 trace、granularity、uniqueness、design-integrity 四类检查。

## 输出要求
你必须输出一个符合 StageResult schema 的 JSON 对象。格式：
{
  "version": 1,
  "run_id": "{packet.run_id}",
  "change_id": "{packet.change_id}",
  "stage": "plan-review",
  "packet_id": "{packet.packet_id}",
  "agent_role": "plan-reviewer",
  "summary": "一句话总结",
  "decision": "pass|pass_with_warnings|fail",
  "metrics": {"findings_total": N, "critical": N, "warning": N, "suggestion": N},
  "findings": [
    {"id": "F1", "severity": "critical|warning|suggestion", "dimension": "TRACE_GAP|COARSE_R|DUPLICATE_R|GHOST_R|ORPHAN", "message": "...", "trace_id": "R?"}
  ]
}

如需读取文件，只能读取 packet 的 source_refs 和 knowledge_refs 中列出的路径。
```

## 审查维度

单 reviewer 需要覆盖以下四类检查：

### 1. 需求进入设计（specs → design）
- 逐条检查 core_payload.requirements 中的每个 R
- 在 core_payload.trace_mapping 中必须存在 R→U 映射
- 标记未进入设计的需求为 **TRACE_GAP**（severity: critical）

### 2. 需求颗粒度审查
- 检查每条需求是否只描述一个独立的可验证行为
- 如果一条需求同时包含多个独立行为，标记为 **COARSE_R**（severity: critical）
- 需要时通过 source_refs 回读 spec 原文验证颗粒度

### 3. Trace 唯一性审查
- 收集 core_payload.requirements 中所有 R 编号
- 任意两条需求复用同一 R 编号，标记为 **DUPLICATE_R**（severity: critical）

### 4. 设计完整性（design 自洽检查）
- trace_mapping 中的每个 R 编号必须在 requirements 中存在，否则标记为 **GHOST_R**（severity: critical）
- 每个 U 必须有至少一个 R 驱动，否则标记为 **ORPHAN**（severity: critical）

## 汇总逻辑

主 agent 收集该 reviewer 的 StageResult JSON：

1. **读取 findings**：使用 StageResult 的 `findings` 作为统一问题列表
2. **读取汇总 metrics**：使用 StageResult 的 `metrics`
3. **生成追踪矩阵**：基于 core_payload 的 requirements + trace_mapping + StageResult findings

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
（单 reviewer 的 StageResult JSON，供 RunReport 数据源使用）

### 结论
通过 / 需修正后重审
```

## 完成条件

- 审查报告已输出
- 追踪矩阵已完成
- 所有 TRACE_GAP、GHOST_R、ORPHAN、COARSE_R 和 DUPLICATE_R 已列出

## 退出契约

- **如"通过"**：
  1. 写入门控状态：在 `openspec/changes/<name>/.openspec.yaml` 的 `gates:` 下添加 `plan-review: "<ISO8601 时间戳>"`
  2. 将 PlanReviewPacket + StageResult 写入 `openspec/changes/<name>/context/run-report-data.json`（追加式更新：不存在则创建，已存在且 JSON 合法则合并，JSON 损坏则中止并报错，见步骤 5）
  3. 必须转入 **opsx-tasks** 生成 tasks.md。这不是建议，是强制要求。
- **如"需修正"**：
  1. 不写入 gates
  2. 仍将 packet + result 写入 `context/run-report-data.json`（状态为 fail；JSON 损坏则中止并报错，见步骤 5）
  3. 必须回到 **opsx-plan** 修正 design.md 和 specs/。禁止跳过直接生成 tasks
  4. COARSE_R 问题需在 specs 中将粗粒度需求拆分为多条独立需求后重新审查
  5. DUPLICATE_R 问题需在所有相关 spec 文件中统一重新编号后重审
- 所有发现已记录在审查报告中
