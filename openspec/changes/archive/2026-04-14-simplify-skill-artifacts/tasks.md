# Tasks: simplify-skill-artifacts

> 本变更全部为 SKILL.md / docs 文档编辑，无业务逻辑，所有 task 标注 [direct]。
> ⚠️ Bootstrap 豁免：本变更修改了 plan-review / verify / task-analyze 自身，verify 阶段需手动预填 gates，不能用新版 skill 自审。

## 1. 显式 I/O 边界

## Task 1：为 opsx-plan 添加 I/O 边界声明

**需求追踪**：[R1] → [U1]
**执行方式**：[direct]
**涉及文件**：
- `.claude/skills/opsx-plan/SKILL.md` — 在文件顶部添加「## 输入 / 输出边界」章节

**验收标准**：
- [x] SKILL.md 包含「## 输入 / 输出边界」章节
- [x] 读取列表包含：`.aiknowledge/codemap/`、`.aiknowledge/pitfalls/`
- [x] 产出列表包含：`proposal.md`、`design.md`、`specs/<cap>/spec.md`、`.openspec.yaml`
- [x] 产出列表明确声明不产出 `context/` 目录下任何文件

**依赖**：无

---

## Task 2：为 opsx-tasks 添加 I/O 边界声明

**需求追踪**：[R2] → [U2]
**执行方式**：[direct]
**涉及文件**：
- `.claude/skills/opsx-tasks/SKILL.md` — 在文件顶部添加「## 输入 / 输出边界」章节

**验收标准**：
- [x] SKILL.md 包含「## 输入 / 输出边界」章节
- [x] 读取列表包含：`.openspec.yaml`、`proposal.md`、`design.md`、`specs/**/*.md`、`.aiknowledge/pitfalls/`（按需）
- [x] 产出列表仅为 `tasks.md`，声明不产出 `context/` 目录下任何文件

**依赖**：无

---

## 2. 去掉 JSON 中间层

## Task 3：重写 opsx-plan-review（去掉 packet，写 audit-log.md）

**需求追踪**：[R5][R11][R14] → [U5]
**执行方式**：[direct]
**涉及文件**：
- `.claude/skills/opsx-plan-review/SKILL.md` — 完整重写

**验收标准**：
- [x] 启动序列中无「组装 PlanReviewPacket」步骤，无 packet JSON 写入
- [x] subagent prompt 指定直接读取 `specs/**/*.md` 和 `design.md`
- [x] 退出契约中「通过」时追加 audit-log.md，格式：`## plan-review | <timestamp> | pass`
- [x] 退出契约中「需修正」时也追加 audit-log.md，格式：`## plan-review | <timestamp> | fail`，并列修正项
- [x] I/O 边界声明：不读取 / 不写入任何 `context/` 目录文件
- [x] 退出契约显式说明无 run-report-data.json 写入
- [x] Exit 契约引用错误处理规则（见 pitfall: skill-exit-contract-must-reference-error-rules）

**依赖**：无

---

## Task 4：重写 opsx-verify（去掉 packet，写 audit-log.md）

**需求追踪**：[R6][R13][R14] → [U6]
**执行方式**：[direct]
**涉及文件**：
- `.claude/skills/opsx-verify/SKILL.md` — 完整重写

**验收标准**：
- [x] 启动序列中无「组装 VerifyPacket」步骤，无 packet JSON 写入
- [x] subagent prompt 指定直接读取 `tasks.md`、`specs/**/*.md`、`design.md`、代码文件
- [x] 退出契约中追加 audit-log.md（pass 和 fail 均写入）
- [x] I/O 边界声明：不读取 / 不写入任何 `context/` 目录文件
- [x] 退出契约显式说明无 run-report-data.json 写入
- [x] Exit 契约引用错误处理规则

**依赖**：无

---

## Task 5：重写 opsx-task-analyze（补 I/O 边界，写 audit-log.md）

**需求追踪**：[R3][R12][R14] → [U3]
**执行方式**：[direct]
**涉及文件**：
- `.claude/skills/opsx-task-analyze/SKILL.md` — 完整重写

**验收标准**：
- [x] 包含正式「## 输入 / 输出边界」章节
- [x] 读取：`specs/**/*.md`、`design.md`、`tasks.md`
- [x] 产出：`audit-log.md`（追加）、`.openspec.yaml` gates.task-analyze（仅通过时）
- [x] 退出契约追加 audit-log.md，格式符合 R14 规范
- [x] 不写入 `context/` 目录下任何文件

**依赖**：无

---

## Task 6：重写 opsx-implement（补 I/O 边界，去掉 context JSON）

**需求追踪**：[R4][R7] → [U4]
**执行方式**：[direct]
**涉及文件**：
- `.claude/skills/opsx-implement/SKILL.md` — 完整重写

**验收标准**：
- [x] 包含正式「## 输入 / 输出边界」章节
- [x] 启动序列中无「实施上下文组装」步骤，不写 impl-context.json
- [x] 无 impl-progress.json 创建步骤
- [x] subagent prompt 说明从 tasks.md 第一个 `[ ]` 任务恢复进度
- [x] 产出列表无 `context/` 目录文件

**依赖**：无

---

## 3. 简化其他 skills

## Task 7：简化 opsx-tdd（去掉 run-report-data.json 写入）

**需求追踪**：[R8] → [U7]
**执行方式**：[direct]
**涉及文件**：
- `.claude/skills/opsx-tdd/SKILL.md` — 删除 run-report-data.json 相关步骤

**验收标准**：
- [x] I/O 边界「产出」中无 `run-report-data.json`
- [x] 红绿重构循环各阶段无写入 run-report-data.json 的步骤
- [x] 退出契约中无 run-report-data.json 相关内容
- [x] test-report.md 写入逻辑保持不变

**依赖**：无

---

## Task 8：简化 opsx-review（去掉 run-report-data.json，写 review-report.md）

**需求追踪**：[R9] → [U8]
**执行方式**：[direct]
**涉及文件**：
- `.claude/skills/opsx-review/SKILL.md` — 修改退出契约和 I/O 边界

**验收标准**：
- [x] I/O 边界「产出」改为 `review-report.md` + `.openspec.yaml` gates.review
- [x] 退出契约写入 `review-report.md`（新建或追加）
- [x] 退出契约无 run-report-data.json 写入步骤
- [x] review-report.md 每次审查追加一节，不覆盖历史

**依赖**：无

---

## 4. 文档和报告

## Task 9：简化 stage-packet-protocol.md

**需求追踪**：[R10] → [U9]
**执行方式**：[direct]
**涉及文件**：
- `docs/stage-packet-protocol.md` — 大幅删减，仅保留 StageResult schema

**验收标准**：
- [x] 删除：第 1 节（StagePacket schema）、第 2 节（Budget/Lazy Hydration）、第 4 节（PlanReviewPacket / VerifyPacket）、第 5 节（Run Result Ledger）
- [x] 保留：第 3 节（StageResult schema）
- [x] 新增：audit-log.md 条目格式规范章节（stage | timestamp | decision + 修正列表）
- [x] 文档标题和简介更新，去掉 StagePacket 相关描述

**依赖**：无

---

## Task 10：重写 opsx-report（从 .md 文件读结果）

**需求追踪**：[R15] → [U10]
**执行方式**：[direct]
**涉及文件**：
- `.claude/skills/opsx-report/SKILL.md` — 重写数据源读取逻辑

**验收标准**：
- [x] I/O 边界「读取」改为：`.openspec.yaml`、`proposal.md`、`design.md`、`specs/**/*.md`、`tasks.md`、`test-report.md`（如存在）、`audit-log.md`（如存在）、`review-report.md`（如存在）
- [x] gate 状态从 `audit-log.md` 最后一条对应 stage 记录的 decision 读取
- [x] `audit-log.md` 不存在时对应 gate 显示 pending，不报错
- [x] 无任何 run-report-data.json 读取步骤
- [x] run-report.html 产出路径保持为 `openspec/changes/<name>/run-report.html`（不在 context/ 下）

**依赖**：无
