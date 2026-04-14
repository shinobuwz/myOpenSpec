---
status: active
created_at: 2026-04-13
created_from: change:2026-04-13-stage-packet-protocol
last_verified_at: 2026-04-14
last_verified_by: opsx-codemap
verification_basis: archive:2026-04-14-simplify-skill-artifacts
applies_to:
  - docs/stage-packet-protocol.md
  - .claude/skills/opsx-plan-review
  - .claude/skills/opsx-verify
  - .claude/skills/opsx-task-analyze
  - .claude/skills/opsx-report
superseded_by:
---

# stage-packet-protocol

## 职责
定义 gate stage 审查结论的输出结构和留档格式。包含两部分：（1）StageResult schema——reviewer subagent 的结构化 JSON 输出规范；（2）audit-log.md 格式规范——change 级链路正确性审查的追加式留档格式。不再包含 StagePacket 组装协议或 RunReport 数据模型。

## 关键文件

| 文件 | 角色 |
|------|------|
| `docs/stage-packet-protocol.md` | 协议规范正文，定义 StageResult schema（必填/可选字段、Finding 结构）和 audit-log.md 格式（条目格式、写入规则、写入者） |
| `.claude/skills/opsx-plan-review/SKILL.md` | 消费侧：派遣 1 个 subagent 直接读取文件审查，获取 StageResult JSON，追加写 audit-log.md |
| `.claude/skills/opsx-task-analyze/SKILL.md` | 消费侧：同上，负责 task-analyze stage 的审查留档 |
| `.claude/skills/opsx-verify/SKILL.md` | 消费侧：派遣 1 个 subagent 直接读取文件顺序执行 4 维度审查，获取 StageResult JSON，追加写 audit-log.md |
| `.claude/skills/opsx-report/SKILL.md` | 渲染侧：读取 audit-log.md（plan-review/verify 记录）、test-report.md（tdd 状态）、review-report.md（review 状态），生成 self-contained HTML RunReport |

## 隐式约束
- StageResult 必填字段（version/run_id/change_id/stage/agent_role/summary/decision）缺失时消费者必须报错，不得静默降级
- audit-log.md 追加写入：文件不存在时创建；已存在时追加；已存在但损坏（无法追加）时中止并报错，禁止覆盖
- audit-log.md 格式为纯 markdown，无需 JSON 解析；同一 stage 可有多条历史记录，report 取最后一条
- `.openspec.yaml` gates 时间戳优先于 audit-log.md decision 判断 gate_status，防止重跑后数据未同步误报
- opsx-tdd 不写 audit-log.md（状态在 test-report.md 留档）；opsx-review 不写 audit-log.md（状态在 review-report.md 留档）
- 无 StagePacket 组装步骤，无 context/ JSON 文件，无 run_id 跨 stage 复用约束
