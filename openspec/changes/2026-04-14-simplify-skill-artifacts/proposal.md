# Proposal: Simplify Skill Artifacts

## 问题陈述

当前 OpenSpec workflow 存在两层数据冗余：

1. **StagePacket 中间层**：plan-review 和 verify 在执行前需要组装 `packet-*.json`，将已经结构化的上游产物（design.md、tasks.md）再次提取为 JSON 传给 subagent。subagent 消费 JSON 后仍需回读原文件。这一层没有减少 token 消耗，只增加了复杂度。

2. **run-report-data.json 分散审查结论**：各 stage 的审查结论写入一个独立 JSON 文件，与被审查的产物文件分离。查 design.md 时看不到对应的审查历史；task-analyze 结论甚至没有持久化。

## 目标

- **subagent 直接读上游产物**：去掉 packet 组装步骤，subagent 的读取范围由 skill 的 I/O 边界声明控制
- **审查结论写回产物文件**：plan-review / task-analyze / verify 统一追加到 `audit-log.md`，与变更产物共存
- **每个 skill 有明确的 I/O 边界声明**

## 范围

**做什么：**
- 重写 opsx-plan-review：去掉 packet，subagent 直接读 specs/ + design.md，结论写 audit-log.md
- 重写 opsx-task-analyze：去掉无持久化问题，结论写 audit-log.md，补充 I/O 边界
- 重写 opsx-verify：去掉 packet，subagent 直接读 tasks.md + specs/ + design.md + 代码，结论写 audit-log.md
- 重写 opsx-tdd：去掉写 run-report-data.json，只写 test-report.md
- 重写 opsx-review：去掉写 run-report-data.json，结论写 review-report.md
- 重写 opsx-report：改从各 .md 文件读结果，去掉 run-report-data.json 依赖
- 重写 opsx-implement：去掉 impl-context.json / impl-progress.json，改用 tasks.md [x] 追踪进度
- 为 opsx-plan / opsx-tasks 补充正式 I/O 边界声明
- 简化 docs/stage-packet-protocol.md：只保留 StageResult schema 和 audit-log 格式规范

**不做什么：**
- 不改变工作流的执行顺序和门控逻辑
- 不改变 .openspec.yaml 的 gates 机制
- 不改变 test-report.md 格式（tdd 已有良好模式）
- 不改 opsx-plan 的规划逻辑

## 成功标准

- context/ 目录不再被任何 skill 创建或读取
- 每个 skill 有明确的「读取」和「产出」列表
- audit-log.md 包含 plan-review + task-analyze + verify 三个 stage 的修正记录
- opsx-report 可从 .md 文件渲染完整 HTML 报告
- 无任何 skill 引用 packet-*.json 或 run-report-data.json
