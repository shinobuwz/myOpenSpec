# Tasks: 精简 run-report-data.json 并扩展 report 覆盖范围

## Task 1: plan-review 退出契约精简 [direct]

**U**: U1 | **R**: R1, R7

修改 `.claude/skills/opsx-plan-review/SKILL.md` 的退出契约：
- 将"将 PlanReviewPacket + StageResult 写入 run-report-data.json"改为"将 StageResult 的判定结果（decision/findings/metrics/reviewed_at）写入 run-report-data.json 的 stages.plan-review"
- 明确 packet 文件（packet-plan-review.json）保持原样不受影响
- 通过和未通过两个分支都只写判定结果

## Task 2: verify 退出契约精简 [direct]

**U**: U1 | **R**: R2, R7

修改 `.claude/skills/opsx-verify/SKILL.md` 的退出契约：
- 将"将 VerifyPacket + StageResult 写入 run-report-data.json"改为"将 StageResult 的判定结果（decision/findings/metrics/verified_at）写入 run-report-data.json 的 stages.verify"
- 明确 packet 文件（packet-verify.json）保持原样不受影响

## Task 3: opsx-tdd 新增 JSON 写入 [direct]

**U**: U2 | **R**: R3, R4, R6

修改 `.claude/skills/opsx-tdd/SKILL.md`：
- 在重构阶段完成后新增步骤：读取 run-report-data.json（遵循写入规则），将 task TDD 结果追加到 stages.tdd.tasks[]
- 写入字段：task_id, mode, red_passed, green_passed, refactor_passed, coverage, completed_at
- 同时更新 stages.tdd 顶层汇总：total_tasks, completed_tasks, all_green
- run_id 复用规则同 plan-review/verify

## Task 4: opsx-review 新增 JSON 写入 [direct]

**U**: U3 | **R**: R5, R6

修改 `.claude/skills/opsx-review/SKILL.md`：
- 在审查完成后新增步骤：读取 run-report-data.json（遵循写入规则），写入 stages.review
- 写入字段：decision, findings[], metrics, reviewed_at
- run_id 复用规则同 plan-review/verify

## Task 5: opsx-report 扩展到 4 stage [direct]

**U**: U4 | **R**: R8, R9, R10, R11

修改 `.claude/skills/opsx-report/SKILL.md`：
- 数据读取分层：JSON 提供判定结果，产出物文件（specs/、design.md、tasks.md）提供 trace 矩阵和 task 列表
- Run Overview：gate_status 从 2 个扩展到 4 个（plan_review/tdd/verify/review）
- Stage Results：新增 tdd 卡片和 review 卡片
- tdd 卡片：task 级红/绿/重构状态 + 汇总统计
- review 卡片：decision + findings + metrics，样式与其他卡片一致
- 缺失 stage 显示灰色 pending；产出物文件不存在时显示"数据不可用"
- gate_status 判断逻辑（遵循 R11）：优先看 `.openspec.yaml` gates 时间戳 → pass；其次看 JSON decision 为 fail → fail；否则 → pending；tdd 的 pass 判断为 `stages.tdd.all_green: true`
- 去掉对 core_payload 中 requirements/trace_mapping/units 的依赖

## Task 6: 文档更新 [direct]

**U**: U5 | **R**: R12

- `docs/stage-packet-protocol.md` 第 5 节：gate_status 扩展到 4 个，stages 覆盖从 2 个扩展到 4 个，更新数据模型示例
- `docs/workflows.md`：`/opsx:report` 改为 `/opsx-report`
