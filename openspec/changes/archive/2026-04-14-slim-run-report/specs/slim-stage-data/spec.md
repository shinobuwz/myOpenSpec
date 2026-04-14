# Spec: 精简 stage 结果留档并收缩 packet

## 概述

统一 change 运行时的中间数据模型：

- `run-report-data.json` 只保存 stage 结果
- `packet-<stage>.json` 只保存当前 stage 必需的传输事实
- `.openspec.yaml` 继续保存 schema / gates 等最小状态

## 需求

### plan-review 写入精简

**Trace**: R1
plan-review 退出时写入 `run-report-data.json` 的内容只保留判定结果：`decision`、`findings`、`metrics`、`reviewed_at`。不得写入 `requirements`、`trace_mapping`、`units` 等上下文副本。

### verify 写入精简

**Trace**: R2
verify 退出时写入 `run-report-data.json` 的内容只保留判定结果：`decision`、`findings`、`metrics`、`verified_at`。不得写入 `requirements`、`trace_mapping`、`units`、`task_completion`、`task_traces`、`tdd_summary` 等上下文副本。

### tdd 写入新增

**Trace**: R3
opsx-tdd 在完成每个 task 的红绿重构循环后，将该 task 的 TDD 结果追加到 `run-report-data.json` 的 `stages.tdd` 中。写入内容包含：`task_id`、`mode`、`red_passed`、`green_passed`、`refactor_passed`、`coverage`、`completed_at`。

### tdd 汇总数据

**Trace**: R4
`stages.tdd` 顶层包含汇总字段：`total_tasks`、`completed_tasks`、`all_green`。汇总字段在每次追加 task 结果时更新。

### review 写入新增

**Trace**: R5
opsx-review 退出时将审查结果写入 `run-report-data.json` 的 `stages.review` 中。写入内容包含：`decision`、`findings`、`metrics`、`reviewed_at`。

### JSON 写入规则不变

**Trace**: R6
所有 skill 写入 `run-report-data.json` 时遵循现有规则：文件不存在则创建；已存在且 JSON 合法则读取合并再写回；JSON 解析失败则中止并报错。`run_id` 在同一 change 内跨 stage 复用。

### packet 保留为 stage-local transport

**Trace**: R7
`context/packet-plan-review.json` 和 `context/packet-verify.json` 允许保留，但只用于向当前 stage 的 subagent 传递事实，不得作为后续 stages 的共享知识源。

### packet 删除重复存在性缓存

**Trace**: R7
`packet-plan-review.json` 和 `packet-verify.json` 的 `core_payload` 中不得再出现 `artifact_presence`、`test_report_present` 等可由 `source_refs` 推导的字段。

### source_refs 只列当前 stage 实际输入

**Trace**: R7
`source_refs` 不得再因为文件“存在”而自动收集所有产物。plan-review 只列 spec / design；verify 只列 tasks / spec / design / test-report（存在时）以及需要的 code/context 证据文件。

## 边缘情况

- tdd stage 为空（所有 task 标记为 `[direct]`）：`stages.tdd` 不写入，opsx-report 渲染时显示"无 TDD 任务"
- review 在 verify 之前执行：合法场景，各 stage 独立写入
- 单个 task 的 tdd 循环中途失败：写入已完成的阶段状态，未完成布尔值为 `false`
