# Spec: 精简 run-report-data.json 并扩展写入覆盖

## 概述

统一 `run-report-data.json` 的数据模型：JSON 只存判定结果，不复制上下文；tdd 和 review 补写各自的 stage 数据。

## 需求

### plan-review 写入精简

**Trace**: R1
plan-review 退出时写入 `run-report-data.json` 的内容只保留判定结果：`decision`、`findings`、`metrics`、`reviewed_at` 时间戳。去掉 `core_payload` 中的 `requirements`、`trace_mapping`、`units`、`artifact_presence`。

### verify 写入精简

**Trace**: R2
verify 退出时写入 `run-report-data.json` 的内容只保留判定结果：`decision`、`findings`、`metrics`、`verified_at` 时间戳。去掉 `core_payload` 中的 `requirements`、`trace_mapping`、`units`、`artifact_presence`、`task_completion`、`task_traces`、`tdd_summary`、`test_report_present`。

### tdd 写入新增

**Trace**: R3
opsx-tdd 在完成每个 task 的红绿重构循环后，将该 task 的 TDD 结果追加到 `run-report-data.json` 的 `stages.tdd` 中。写入内容包含：`task_id`、`mode`（test-first/characterization-first）、`red_passed`（布尔）、`green_passed`（布尔）、`refactor_passed`（布尔）、`coverage`（字符串，N/A 或数值）、`completed_at` 时间戳。

### tdd 汇总数据

**Trace**: R4
`stages.tdd` 顶层包含汇总字段：`total_tasks`（TDD 任务总数）、`completed_tasks`（已完成数）、`all_green`（布尔，是否全部绿灯）。汇总字段在每次追加 task 结果时更新。

### review 写入新增

**Trace**: R5
opsx-review 退出时将审查结果写入 `run-report-data.json` 的 `stages.review` 中。写入内容包含：`decision`（pass/pass_with_warnings/fail）、`findings` 数组（每条含 `severity`、`category`、`message`、`file_path`）、`metrics`（按 severity 分类计数）、`reviewed_at` 时间戳。

### JSON 写入规则不变

**Trace**: R6
所有 skill 写入 `run-report-data.json` 时遵循现有规则：文件不存在则创建；已存在且 JSON 合法则读取合并再写回；JSON 解析失败则中止并报错。`run_id` 在同一 change 内跨 stage 复用。

### packet 文件不受影响

**Trace**: R7
`context/packet-plan-review.json` 和 `context/packet-verify.json` 保持不变，仍包含完整的 `core_payload`（含 requirements/trace_mapping/units 等），用于传递给 subagent 判断。本次变更只影响 `run-report-data.json` 的持久化内容。

## 边缘情况

- tdd stage 为空（所有 task 标记为 [direct]）：`stages.tdd` 不写入，opsx-report 渲染时显示"无 TDD 任务"
- review 在 verify 之前执行：合法场景，各 stage 独立写入
- 单个 task 的 tdd 循环中途失败：写入已完成的阶段状态，`red_passed`/`green_passed`/`refactor_passed` 中未完成的为 false
