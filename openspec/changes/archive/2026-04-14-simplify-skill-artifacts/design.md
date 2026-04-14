# Design: Simplify Skill Artifacts

## Context

当前 workflow 有两层不必要的间接层：
1. StagePacket：在 plan-review / verify 前，主 agent 把已经结构化的产物再次提取为 JSON 传给 subagent
2. run-report-data.json：审查结论与被审查产物分离存放，task-analyze 结论甚至没有持久化

本次变更的核心设计原则：**产物即真相源，审查结论回归产物文件**。

## Goals / Non-Goals

**Goals**
- 每个 skill 有明确的 I/O 边界声明
- subagent 直接读上游产物，不经过 JSON 中间层
- 审查结论统一追加到 audit-log.md，与变更产物同目录
- context/ 目录不再被任何 skill 创建

**Non-Goals**
- 不改变工作流执行顺序和门控逻辑（gates 机制不变）
- 不改变 test-report.md 格式（已有良好模式）
- 不改变 opsx-plan 的规划逻辑

## 需求追踪

- [R1] → [U1]
- [R2] → [U2]
- [R3] → [U3]
- [R4] → [U4]
- [R5] → [U5]
- [R6] → [U6]
- [R7] → [U4]
- [R8] → [U7]
- [R9] → [U8]
- [R10] → [U9]
- [R11] → [U5]
- [R12] → [U3]
- [R13] → [U6]
- [R14] → [U3] [U5] [U6]
- [R15] → [U10]

## Implementation Units

### [U1] opsx-plan 添加 I/O 边界声明

**关联需求**：R1  
**模块边界**：`.claude/skills/opsx-plan/SKILL.md`  
**改动**：在文件顶部添加「## 输入 / 输出边界」章节，列出读取和产出文件。不改动现有规划逻辑。

---

### [U2] opsx-tasks 添加 I/O 边界声明

**关联需求**：R2  
**模块边界**：`.claude/skills/opsx-tasks/SKILL.md`  
**改动**：在文件顶部添加「## 输入 / 输出边界」章节。不改动 TDD 标签和 tasks.md 格式逻辑。

---

### [U3] 重写 opsx-task-analyze

**关联需求**：R3, R12, R14  
**模块边界**：`.claude/skills/opsx-task-analyze/SKILL.md`  
**改动**：
- 添加正式 I/O 边界声明（R3）
- 去掉 subagent 无持久化问题，退出契约改为追加 audit-log.md（R12）
- 按 R14 格式写入：`## task-analyze | <timestamp> | <decision>` + 修正列表

---

### [U4] 重写 opsx-implement

**关联需求**：R4, R7  
**模块边界**：`.claude/skills/opsx-implement/SKILL.md`  
**改动**：
- 添加正式 I/O 边界声明（R4）
- 去掉「实施上下文组装」章节（不再写 impl-context.json）（R7）
- 去掉 impl-progress.json；subagent 通过读 tasks.md `[ ]`/`[x]` 恢复进度
- subagent prompt 改为：直接读 tasks.md + design.md + specs/（不再读 impl-context.json）

---

### [U5] 重写 opsx-plan-review

**关联需求**：R5, R11, R14  
**模块边界**：`.claude/skills/opsx-plan-review/SKILL.md`  
**改动**：
- 去掉「组装 PlanReviewPacket」步骤（R5）
- subagent 直接读 `specs/**/*.md` 和 `design.md`
- 退出契约改为追加 audit-log.md（R11）：记录发现的问题和修正了哪个文件
- 按 R14 格式写入：`## plan-review | <timestamp> | <decision>`

---

### [U6] 重写 opsx-verify

**关联需求**：R6, R13, R14  
**模块边界**：`.claude/skills/opsx-verify/SKILL.md`  
**改动**：
- 去掉「组装 VerifyPacket」步骤（R6）
- subagent 直接读 `tasks.md`、`specs/**/*.md`、`design.md`、代码文件
- 退出契约改为追加 audit-log.md（R13）
- 按 R14 格式写入：`## verify | <timestamp> | <decision>`

---

### [U7] 简化 opsx-tdd

**关联需求**：R8  
**模块边界**：`.claude/skills/opsx-tdd/SKILL.md`  
**改动**：
- I/O 边界中移除 `run-report-data.json` 的写入项
- 退出契约中去掉写 run-report-data.json 的步骤
- 只保留写 test-report.md 的逻辑（已有，不变）

---

### [U8] 简化 opsx-review

**关联需求**：R9  
**模块边界**：`.claude/skills/opsx-review/SKILL.md`  
**改动**：
- 退出契约改为写入 `review-report.md`（新建或追加）
- 去掉写 `run-report-data.json` 的步骤
- I/O 边界：产出改为 `review-report.md` + `.openspec.yaml` gates.review

---

### [U9] 简化 stage-packet-protocol.md

**关联需求**：R10  
**模块边界**：`docs/stage-packet-protocol.md`  
**改动**：
- 删除：StagePacket schema、PlanReviewPacket、VerifyPacket、Budget 校验/降维、Lazy Hydration Contract、Run Result Ledger（run-report-data.json）等章节
- 保留：StageResult schema（第 3 节）
- 新增：audit-log.md 条目格式规范（迁移自协议文档）

---

### [U10] 重写 opsx-report

**关联需求**：R15  
**模块边界**：`.claude/skills/opsx-report/SKILL.md`  
**改动**：
- 去掉读取 `run-report-data.json` 的步骤
- gate 状态从 `audit-log.md` 最后一条对应 stage 记录读取
- findings/metrics 从 `audit-log.md` 解析；test 数据从 `test-report.md` 读取；代码审查从 `review-report.md` 读取
- 文件不存在时对应板块显示 pending，不报错

## Decisions

**为什么 audit-log.md 只记录修正，不记录完整 findings 列表？**  
findings 列表是过程数据，修正后就过时了。长期有价值的是"发现了什么问题、在哪里改了"这条修正记录。存完整 findings 会让 audit-log.md 变成重复信息的垃圾场。

**为什么 opsx-review 不归入 audit-log.md？**  
plan-review / task-analyze / verify 都是"链路传递正确性校验"（specs→design→tasks→code），audit-log 记录的是这条链路的修正历史。opsx-review 是代码质量/风险审查，性质不同，用独立的 review-report.md。

**为什么不直接删除 StageResult schema？**  
subagent 仍然需要输出结构化 JSON，主 agent 再从中提取 decision 写入 audit-log.md。StageResult schema 是 subagent 的输出契约，不是传输层，保留有意义。

## Risks / Trade-offs

- [bootstrap paradox] 修改 skill 文件本身，变更无法通过自身新版关卡 → 手动预填 gates
- [opsx-report 解析 markdown] 从 audit-log.md 解析 decision 比从 JSON 读取更脆弱 → 格式规范严格约束，用固定前缀 `## <stage> | <timestamp> | <pass|fail>` 使解析稳定

## Knowledge Capture

- audit-log.md 追加模式与 test-report.md 同源，复用已有追加写入铁律
- skill 文件是纯文档变更，tasks 的 TDD 标签全部为 `[direct]`
