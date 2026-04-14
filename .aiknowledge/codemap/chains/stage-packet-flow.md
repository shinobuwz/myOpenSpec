---
status: superseded
created_at: 2026-04-13
created_from: change:2026-04-13-stage-packet-protocol
last_verified_at: 2026-04-14
last_verified_by: opsx-codemap
verification_basis: archive:2026-04-14-simplify-skill-artifacts
applies_to:
  - .claude/skills/opsx-plan-review
  - .claude/skills/opsx-verify
  - .claude/skills/opsx-report
  - docs/stage-packet-protocol.md
superseded_by: "StagePacket/run-report-data.json 流已废弃；plan-review/verify 改为 subagent 直读文件 + audit-log.md 留档；report 改从 .md 文件聚合数据"
---

# Stage Packet 数据流（plan-review → verify → report）

## 触发点

gate stage 执行时（plan-review 或 verify），主 agent 组装 StagePacket 并写入 `context/run-report-data.json`。

## 调用链

1. **opsx-plan-review**（`.claude/skills/opsx-plan-review/SKILL.md`）
   - 主 agent 读取 specs/ + design.md，组装 **PlanReviewPacket**
   - 派遣 4 个 blind reviewer subagent（trace / granularity / uniqueness / design-integrity）
   - 每个 subagent 输出 StageResult JSON
   - 主 agent 汇总 → 写入 `context/run-report-data.json`（追加式合并，JSON 损坏则中止）
   - 通过时写 `gates.plan-review` 时间戳到 `.openspec.yaml`

2. **opsx-verify**（`.claude/skills/opsx-verify/SKILL.md`）
   - 主 agent 读取 tasks.md + specs/ + design.md，组装 **VerifyPacket**（含 task_completion / task_traces / tdd_summary / test_report_present 扩展字段）
   - 派遣单一 subagent 顺序执行 4 个维度（completeness / correctness / consistency / test-report）
   - subagent 输出 4 个 StageResult JSON
   - 主 agent 检测冲突（可触发 arbiter subagent）→ 写入 `context/run-report-data.json`
   - 通过时写 `gates.verify` 时间戳

3. **opsx-report**（`.claude/skills/opsx-report/SKILL.md`）
   - 读取 `context/run-report-data.json` 聚合 RunReport 数据模型
   - 读取 `.openspec.yaml` 获取 gate 时间戳（优先于 results decision 判断状态）
   - 渲染 self-contained HTML → `context/run-report.html`

## 隐式约束
- `run_id` 全程不变：首个执行 gate 的 stage 生成，后续 stage 从文件读取复用；仅用户显式重置才允许开新 run_id
- `context/run-report-data.json` JSON 解析失败时，任何 stage 必须中止写入并报错，禁止以"文件不存在"逻辑覆盖
- plan-review 的 4 个 reviewer subagent 之间 Blind 隔离，共享同一 packet，各自独立输出，主 agent 是唯一汇总点
- verify subagent 消除双读：core_payload 中已有的结构化事实禁止重读原文文件获取
- opsx-report 的 gate_status 判断：.openspec.yaml gates 字段有时间戳 → pass；run-report-data.json 最新 result decision 为 fail → fail；否则 → pending（前者优先）
- 同一 stage 重复执行时，run-report-data.json 中该 stage 的旧数据被覆盖（以最新为准）

## 关键分支
- verify 在 plan-review 之前执行属于合法场景：verify 作为首个 stage 生成 run_id，plan-review gate_status 在 report 中显示 pending
- verify 发现冲突（不同维度对同一问题 severity 分歧）→ 触发 arbiter subagent，arbiter 只读冲突相关 evidence_refs，不重跑全量
- Trace Overview 降级：run-report-data.json 中尚无 verify stage 时，task coverage 显示 "task coverage unavailable until verify stage"，禁止伪装为 0/0
