---
status: active
created_at: 2026-04-13
created_from: change:2026-04-13-stage-packet-protocol
last_verified_at: 2026-04-13
last_verified_by: opsx-codemap
verification_basis: archive:2026-04-13-stage-packet-protocol
applies_to:
  - docs/stage-packet-protocol.md
  - .claude/skills/opsx-plan-review
  - .claude/skills/opsx-verify
  - .claude/skills/opsx-report
superseded_by:
---

# stage-packet-protocol

## 职责
定义 gate stage 间的显式通信协议：StagePacket（主 agent 组装的只读事实快照）和 StageResult（reviewer subagent 的结构化输出）。约束 plan-review 和 verify 两个 gate 的 subagent 输入/输出格式，以及 RunReport 的数据聚合和 HTML 渲染规则。

## 关键文件

| 文件 | 角色 |
|------|------|
| `docs/stage-packet-protocol.md` | 协议规范正文，定义 StagePacket/StageResult schema、Budget 校验/降维规则、阶段特化类型（PlanReviewPacket/VerifyPacket）和 RunReport 数据模型 |
| `.claude/skills/opsx-plan-review/SKILL.md` | 消费侧：组装 PlanReviewPacket，派遣 4 个 blind reviewer subagent，汇总 StageResult 写入 run-report-data.json |
| `.claude/skills/opsx-verify/SKILL.md` | 消费侧：组装 VerifyPacket，派遣单一 subagent 顺序执行 4 个维度，汇总结果写入 run-report-data.json |
| `.claude/skills/opsx-report/SKILL.md` | 渲染侧：读取 run-report-data.json，生成 self-contained HTML RunReport（4 个板块） |

## 隐式约束
- StagePacket 必填字段缺失时，consumer 必须拒绝并报错，不得静默降级
- `core_payload` 只含结构化事实摘要，正文禁止复制进 packet（Lazy Hydration 合同）
- Budget hard_limit 为 4000 tokens（字符数/4）；超限必须按固定顺序降维：一行摘要→纯引用→计数/索引→分片
- `run_id` 在同一 change 内跨 stage 不变；`context/run-report-data.json` JSON 损坏时必须中止，禁止覆盖
- plan-review 的 4 个 reviewer 之间执行 Blind 隔离：共享同一 packet，各自独立输出 StageResult，主 agent 是唯一汇总点
- verify 使用单一 subagent 顺序执行 4 个维度（消除双读规则：core_payload 已有的结构化事实禁止重读原文获取）
- opsx-report 判断 gate_status 的优先级：.openspec.yaml gates 字段时间戳 > run-report-data.json results decision；前者优先，防止重跑后数据未同步误报
- 首版只覆盖 plan-review 和 verify 两个 stage；其他 stage 在 HTML 中显示 "not_tracked"
