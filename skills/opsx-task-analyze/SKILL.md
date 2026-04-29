---
name: opsx-task-analyze
description: 任务分析：检查 tasks 是否完整覆盖 design/specs 需求、是否与 design 一致。在 tasks 生成后、implement 之前使用。
---

# 任务分析

检查 `design.md` / `specs/**/*.md` 到 `tasks.md` 的 plan↔tasks 一致性。详细 reviewer prompt 见 `references/reviewer-prompt.md`，audit/gate 写入规则见 `references/audit-gate.md`。

## Change Root

- `<name>` 可以是单个 change、父 change 或 `group/subchange` 简写。
- 执行前先运行 `opsx changes resolve <name>` 获取真实 change root。
- 下文 `specs/**/*.md`、`design.md`、`tasks.md`、`audit-log.md`、`.openspec.yaml` 均指 resolved change root。

## 硬性门控

这是强制关卡。task-analyze 输出"可实施"前，禁止进入 `opsx-implement` 或任何编码活动。

## 输入 / 输出边界

读取：
- `.openspec.yaml`
- `specs/**/*.md`
- `design.md`
- `tasks.md`

写入：
- `audit-log.md`（追加）
- `.openspec.yaml` 的 `gates.task-analyze`（仅通过时）

禁止：
- 不改业务代码
- 不改 specs/design（除非处理 QUALITY warning 且能明确说明）
- 不复制 StageResult schema；格式以 `docs/stage-packet-protocol.md` 为准

## 启动序列

1. 确认 git 工作区状态，避免把未理解的改动混入 gate 修正。
2. 校验 `gates.plan-review` 已存在；缺失时拒绝执行并回到 `opsx-plan-review`。
3. 确认 `tasks.md`、`design.md`、`specs/` 已存在。
4. 渐进读取：specs 只取 Trace 和需求摘要；design 只取 R->U、U 列表和关键决策；tasks 只取任务 ID、标签、文件、验证方式和依赖。

## 审查方式

按 `~/.opsx/common/subagent.md` reviewer worker contract 派发 1 个只读 reviewer。Codex 默认、Claude Code 兼容映射、controller boundary、只读写入边界和 fallback 均以 `~/.opsx/common/subagent.md` 为准。

reviewer 只读产物并输出 StageResult JSON，schema 见 `docs/stage-packet-protocol.md`。主 agent 负责汇总覆盖矩阵、追加 `audit-log.md`、写入 `.openspec.yaml` gates；reviewer 不得直接写 gates 或宣称整个 change 可实施。

## 完成条件

- 每个 U 和每条 R 都有 task 覆盖。
- design 关键决策已体现在 task 文件边界、执行方式和验证方法中。
- GAP、MISMATCH、QUALITY、OVERSIZED_CHANGE 已全部列出并按 severity 处理。

## 退出契约

- 可实施：按 `references/audit-gate.md` 追加 `task-analyze` pass 记录，写入 `gates.task-analyze`，必须转入 **opsx-implement**。
- 可实施且含 QUALITY 修正：先修正 tasks，再追加 pass 记录和修正列表，写入 `gates.task-analyze`，必须转入 **opsx-implement**。
- 需补充：追加 fail 记录，不写 gates；普通 GAP/MISMATCH/QUALITY 回到 **opsx-tasks**，`OVERSIZED_CHANGE` 回到 **opsx-plan**。
