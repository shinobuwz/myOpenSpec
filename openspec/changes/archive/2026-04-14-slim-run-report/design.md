# Design: 精简 run-report-data.json 并收缩 stage 中间上下文

## 架构决策

### D1: 权威产物、最小状态、阶段传输三层分离

**决策**：

- `proposal.md`、`specs/`、`design.md`、`tasks.md`、`test-report.md` 和代码文件是权威产物
- `.openspec.yaml` 是 common config，只保存 schema / gates 等最小状态
- `context/packet-<stage>.json` 是 stage-local transport，只服务当前 stage 的 subagent

**理由**：中间文件不再承担“共享知识层”职责，避免多个来源同时描述同一语义。

### D2: run-report-data.json 只存不可稳定重建的 stage 结果

**决策**：`run-report-data.json` 中只保留各 stage 的 decision / findings / metrics / 时间戳，以及 tdd task 级执行结果。trace 矩阵和 task 列表由 report 渲染时从权威产物实时读取。

**理由**：避免数据冗余和同步问题。归档后权威源仍存在于 archive 目录中。

### D3: packet 保留，但收缩为当前 stage 最小输入

**决策**：

- `packet-plan-review.json` / `packet-verify.json` 继续保留，便于 reviewer 读取和调试
- `core_payload` 删除 `artifact_presence`、`test_report_present` 这类重复存在性缓存
- `source_refs` 从“列出所有现有产物”改为“只列本 stage 明确需要读取的输入”

**理由**：packet 仍然有价值，但应当是传输协议，而不是共享知识副本。

### D4: tdd / review 只写自身结果，不参与 packet

**决策**：

- tdd 只写 `test-report.md` 和 `run-report-data.json.stages.tdd`
- review 只写 `run-report-data.json.stages.review` 和 `.openspec.yaml.gates.review`
- 二者都不引入新的 packet 或中间上下文字段

**理由**：它们没有独立 reviewer packet 的必要，直接留档结果即可。

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

### [U1] plan-review / verify packet 与结果留档收缩

**Trace**: R1, R2, R7

**模块边界**：
- `.claude/skills/opsx-plan-review/SKILL.md`
- `.claude/skills/opsx-verify/SKILL.md`
- `context/packet-plan-review.json`
- `context/packet-verify.json`

**变更内容**：
- plan-review / verify 退出时只写 stage 结果到 `run-report-data.json`
- packet 中删除 `artifact_presence`、`test_report_present`
- `source_refs` 改为只列当前 stage 实际需要读取的文件

### [U2] opsx-tdd 退出时写入 JSON

**Trace**: R3, R4, R6

**模块边界**：
- `.claude/skills/opsx-tdd/SKILL.md`

**变更内容**：
- 每个 task 的重构阶段完成后，将 TDD 结果追加到 `stages.tdd.tasks[]`
- 同时更新 `total_tasks / completed_tasks / all_green`
- 不生成 packet

### [U3] opsx-review 退出时写入 JSON

**Trace**: R5, R6

**模块边界**：
- `.claude/skills/opsx-review/SKILL.md`

**变更内容**：
- review 退出时写入 `stages.review`
- 不生成 packet

### [U4] opsx-report 只读结果留档 + 权威产物

**Trace**: R8, R9, R10, R11

**模块边界**：
- `.claude/skills/opsx-report/SKILL.md`

**变更内容**：
- `run-report-data.json` 仅提供判定结果
- `specs/`、`design.md`、`tasks.md` 提供 trace / task 上下文
- report 不再读取 packet

### [U5] 文档更新

**Trace**: R12

**模块边界**：
- `docs/stage-packet-protocol.md`
- `docs/workflows.md`

**变更内容**：
- 明确 `.openspec.yaml` 是 common config
- 明确 packet 是 stage-local transport
- 明确 `run-report-data.json` 是 result ledger，而不是 context 聚合
