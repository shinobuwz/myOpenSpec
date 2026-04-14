# Design: 精简 run-report-data.json 并扩展 report 覆盖范围

## 架构决策

### D1: JSON 只存判定结果，上下文从权威源实时读取

**决策**：`run-report-data.json` 中只保留各 stage 的 decision/findings/metrics/时间戳。opsx-report 渲染 trace 矩阵和 task 列表时从 specs/、design.md、tasks.md 实时读取。

**理由**：避免数据冗余和同步问题。权威源在归档后仍存在于 archive 目录中。

### D2: tdd 和 review 采用与 plan-review/verify 相同的 JSON 写入规则

**决策**：所有 4 个 stage 遵循统一的写入规则：文件不存在则创建，合法则合并，损坏则中止。run_id 跨 stage 复用。

**理由**：复用已验证的安全写入机制，不引入新的数据完整性风险。

### D3: packet 文件保持不变

**决策**：`context/packet-plan-review.json` 和 `context/packet-verify.json` 仍包含完整的 core_payload，不受本次精简影响。

**理由**：packet 是传递给 subagent 的输入，subagent 需要完整上下文做判断。精简的是持久化到 run-report-data.json 的内容。

## run-report-data.json 新数据模型

```json
{
  "run_id": "2026-04-14T10:00:00Z-a1b2c3",
  "change_id": "2026-04-14-slim-run-report",
  "stages": {
    "plan-review": {
      "decision": "pass",
      "findings": [
        {"id": "F1", "severity": "warning", "dimension": "COARSE_R", "message": "...", "trace_id": "R3"}
      ],
      "metrics": {"findings_total": 1, "critical": 0, "warning": 1, "suggestion": 0},
      "reviewed_at": "2026-04-14T10:05:00Z"
    },
    "tdd": {
      "total_tasks": 3,
      "completed_tasks": 3,
      "all_green": true,
      "tasks": [
        {
          "task_id": "Task 1",
          "mode": "test-first",
          "red_passed": true,
          "green_passed": true,
          "refactor_passed": true,
          "coverage": "N/A",
          "completed_at": "2026-04-14T11:00:00Z"
        }
      ]
    },
    "verify": {
      "decision": "pass",
      "findings": [],
      "metrics": {"findings_total": 0, "critical": 0, "warning": 0, "suggestion": 0},
      "verified_at": "2026-04-14T12:00:00Z"
    },
    "review": {
      "decision": "pass_with_warnings",
      "findings": [
        {"severity": "warning", "category": "complexity", "message": "...", "file_path": "src/foo.ts"}
      ],
      "metrics": {"findings_total": 1, "critical": 0, "warning": 1, "suggestion": 0},
      "reviewed_at": "2026-04-14T13:00:00Z"
    }
  }
}
```

## 实施单元

### [U1] plan-review / verify 退出契约精简

**Trace**: R1, R2, R7

**模块边界**：
- `.claude/skills/opsx-plan-review/SKILL.md` — 退出契约中 JSON 写入部分
- `.claude/skills/opsx-verify/SKILL.md` — 退出契约中 JSON 写入部分

**变更内容**：
- plan-review 退出时：写入 `stages.plan-review` 只含 `decision`、`findings`、`metrics`、`reviewed_at`。不再将整个 PlanReviewPacket 写入。
- verify 退出时：写入 `stages.verify` 只含 `decision`、`findings`、`metrics`、`verified_at`。不再将整个 VerifyPacket 写入。
- packet 文件（`packet-plan-review.json`、`packet-verify.json`）保持原样。

### [U2] opsx-tdd 退出时写入 JSON

**Trace**: R3, R4, R6

**模块边界**：
- `.claude/skills/opsx-tdd/SKILL.md` — 红绿重构循环退出后新增 JSON 写入步骤

**变更内容**：
- 每个 task 的重构阶段完成后，读取 `run-report-data.json`（遵循 R6 写入规则），将该 task 的 TDD 结果追加到 `stages.tdd.tasks[]`
- 同时更新 `stages.tdd` 顶层汇总字段（total_tasks / completed_tasks / all_green）
- run_id 从已有 JSON 中读取复用；JSON 不存在则生成新 run_id

### [U3] opsx-review 退出时写入 JSON

**Trace**: R5, R6

**模块边界**：
- `.claude/skills/opsx-review/SKILL.md` — 审查完成后新增 JSON 写入步骤

**变更内容**：
- review 退出时，读取 `run-report-data.json`（遵循 R6 写入规则），写入 `stages.review`
- 内容：`decision`、`findings`（含 severity/category/message/file_path）、`metrics`、`reviewed_at`
- run_id 从已有 JSON 中读取复用

### [U4] opsx-report 扩展到 4 stage

**Trace**: R8, R9, R10, R11

**模块边界**：
- `.claude/skills/opsx-report/SKILL.md` — 数据读取和 HTML 渲染逻辑

**变更内容**：
- 数据读取分层：JSON 提供判定结果，产出物文件提供 trace 矩阵和 task 列表
- Run Overview：gate_status 从 2 个扩展到 4 个（plan_review / tdd / verify / review）
- Stage Results：新增 tdd 卡片（task 级红/绿/重构状态 + 汇总）和 review 卡片
- tdd 卡片样式：全部 green → 绿色左边框；有 red/未完成 → 红色左边框
- 缺失 stage 显示灰色 pending
- 产出物文件不存在时对应板块显示"数据不可用"

### [U5] 文档更新

**Trace**: R12

**模块边界**：
- `docs/stage-packet-protocol.md` — 第 5 节 RunReport 数据模型
- `docs/workflows.md` — opsx-report 引用语法

**变更内容**：
- stage-packet-protocol.md 第 5.1 节：`gate_status` 扩展到 4 个；第 5.3 节：stages 覆盖从 2 个扩展到 4 个
- workflows.md：`/opsx:report` 改为 `/opsx-report`
