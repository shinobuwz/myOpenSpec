# Proposal: 精简 run-report-data.json 并扩展 report 覆盖范围

## 问题陈述

当前 `run-report-data.json` 存在两个问题：

1. **数据冗余**：plan-review 和 verify 的 StagePacket 将 specs/design/tasks 的上下文摘要（core_payload）复制到 JSON 中，但这些信息在权威源（specs/、design.md、tasks.md）中已存在。归档后权威源仍在 archive 目录中，无需在 JSON 里保留副本。

2. **覆盖不全**：只有 plan-review 和 verify 往 JSON 写数据。tdd 和 review 的结果分散在 `test-report.md` 和 `.openspec.yaml` 中，opsx-report 只能渲染 2 个 stage，无法呈现完整的 change 生命周期。

## 目标

- `run-report-data.json` 只存判定结果（decision/findings/metrics/时间戳），不复制上下文
- tdd 和 review 退出时将判定结果写入同一个 JSON
- opsx-report 扩展到 4 个 stage（plan-review / tdd / verify / review），trace 矩阵从产出物实时读取

## 范围

### 做什么

- 精简 plan-review 和 verify 写入 JSON 的内容（去掉 core_payload 中的上下文数据）
- tdd 退出时追加 tdd stage 数据到 JSON
- review 退出时追加 review stage 数据到 JSON
- opsx-report 扩展渲染逻辑到 4 个 stage
- 更新 stage-packet-protocol.md 的 RunReport 数据模型
- 更新 workflows.md 的说明
- 同步更新 codemap 和链路文档

### 不做什么

- 不改变 StagePacket 传递给 subagent 的内容（packet 文件仍保留 core_payload，用于 subagent 判断）
- 不改变 gate 机制（gates.* 写入 .openspec.yaml 不变）
- 不改变主流程顺序

## 成功标准

- plan-review 和 verify 退出后，JSON 中不再包含 requirements/trace_mapping/units 等上下文副本
- tdd 和 review 退出后，JSON 中有对应 stage 数据
- opsx-report 能从 JSON + 产出物文件渲染完整 4-stage HTML
