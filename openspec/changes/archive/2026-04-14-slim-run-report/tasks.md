# Tasks: 精简 stage 结果留档并收缩 stage 中间上下文

## Task 1: plan-review 明确输入输出并收缩 packet [direct]

**U**: U1 | **R**: R1, R7

修改 `.claude/skills/opsx-plan-review/SKILL.md`：
- 增加“输入 / 输出边界”说明
- 将 packet 的 `core_payload` 收缩为 `requirements`、`trace_mapping`、`units`
- 删除 `artifact_presence`
- 将 `source_refs` 改为只列 `specs/**/*.md` 和 `design.md`
- 退出时只写 `stages.plan-review`

## Task 2: verify 明确输入输出并收缩 packet [direct]

**U**: U1 | **R**: R2, R7

修改 `.claude/skills/opsx-verify/SKILL.md`：
- 增加“输入 / 输出边界”说明
- 删除 `artifact_presence`、`test_report_present`
- 将 `test-report.md` / `specs/` / `design.md` 的存在性改为从 `source_refs.kind` 推导
- 将 `source_refs` 改为只列 tasks / spec / design / test-report（存在时）以及需要的 code/context 证据
- 退出时只写 `stages.verify`

## Task 3: opsx-tdd 写入自身结果且不生成 packet [direct]

**U**: U2 | **R**: R3, R4, R6

修改 `.claude/skills/opsx-tdd/SKILL.md`：
- 增加“输入 / 输出边界”说明
- 明确 tdd 只写 `test-report.md` 和 `stages.tdd`
- 不生成 packet，不写 gates

## Task 4: opsx-review 写入自身结果且不生成 packet [direct]

**U**: U3 | **R**: R5, R6

修改 `.claude/skills/opsx-review/SKILL.md`：
- 增加“输入 / 输出边界”说明
- 明确 review 只写 `stages.review` 和 `gates.review`
- 不生成 packet

## Task 5: opsx-report 只读结果留档和权威产物 [direct]

**U**: U4 | **R**: R8, R9, R10, R11

修改 `.claude/skills/opsx-report/SKILL.md`：
- 增加“输入 / 输出边界”说明
- 明确 report 只从 `run-report-data.json` 读结果
- 明确 trace / task / requirement 信息只从 `specs/`、`design.md`、`tasks.md` 实时读取
- 明确 report 不读取 packet

## Task 6: 协议与 workflow 文档同步 [direct]

**U**: U5 | **R**: R12

修改 `docs/stage-packet-protocol.md` 和 `docs/workflows.md`：
- 定义 `.openspec.yaml` 是 common config，只保存最小状态
- 定义 `run-report-data.json` 是 result ledger，不是 context 聚合
- 定义 `packet-<stage>.json` 是 stage-local transport，不是共享知识层
- 定义 `source_refs` 只列当前 stage 实际输入
