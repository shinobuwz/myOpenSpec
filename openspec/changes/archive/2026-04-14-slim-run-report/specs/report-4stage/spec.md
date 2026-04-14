# Spec: opsx-report 扩展到 4 个 stage

## 概述

opsx-report 从只渲染 plan-review 和 verify 扩展到渲染 plan-review、tdd、verify、review 四个 stage。trace 矩阵等上下文数据从产出物文件实时读取，不再依赖 JSON 中的副本，也不读取 packet 文件。

## 需求

### 数据源分层

**Trace**: R8
opsx-report 渲染时从两处读取数据：(1) `run-report-data.json` 提供各 stage 的判定结果；(2) 产出物文件（specs/、design.md、tasks.md）提供上下文（trace 矩阵、需求列表、task 列表）。不得从 `packet-<stage>.json` 恢复这些上下文。当产出物文件不存在时（如已删除），对应板块显示"数据不可用"。

### TDD 板块渲染

**Trace**: R9
HTML 的 Stage Results 板块中新增 tdd 卡片。显示内容：每个 task 的红/绿/重构状态（用颜色标识）、覆盖率（如有）、汇总统计（total/completed/all_green）。当 `stages.tdd` 不存在时，显示"无 TDD 任务"。

### Review 板块渲染

**Trace**: R10
HTML 的 Stage Results 板块中新增 review 卡片。显示内容：decision、findings 列表（按 severity 降序）、metrics 计数条。样式与 plan-review/verify 卡片一致（左边框颜色表示状态）。当 `stages.review` 不存在时，显示"未执行审查"。

### gate_status 扩展

**Trace**: R11
Run Overview 板块的 gate 状态从 2 个扩展到 4 个：plan_review、tdd、verify、review。判断逻辑：`.openspec.yaml` 的 `gates` 有时间戳 -> pass；`run-report-data.json` 中对应 stage 的最新 decision 为 fail -> fail；否则 -> pending。tdd 的 pass 判断为 `all_green: true`。

### 文档同步更新

**Trace**: R12
更新 `docs/stage-packet-protocol.md` 的 RunReport 数据模型（第 5 节）：`stages` 从 2 个扩展到 4 个；`gate_status` 从 2 个扩展到 4 个。更新 `docs/workflows.md` 中的 opsx-report 调用语法（`/opsx:report` 改为 `/opsx-report`）。

## 边缘情况

- 只跑了部分 stage：未执行的 stage 在 HTML 中显示灰色 pending 状态
- 归档后的 change：产出物在 archive 目录中，opsx-report 需要能从 archive 路径读取
- JSON 中某个 stage 数据损坏：跳过该 stage 渲染，显示错误提示，不中断其他 stage
