---
name: opsx-plan-review
description: 规划审查：检查 specs 需求是否完整进入 design。在 plan 生成 design 后、生成 tasks 之前使用。
---

# 规划审查

检查 `specs/**/*.md` 到 `design.md` 的 spec↔plan 一致性。入口只保留门控和执行边界；完整审查 prompt 见 `references/reviewer-prompt.md`，audit/gate 写入规则见 `references/audit-gate.md`。

## Change Root

- `<name>` 可以是单个 change、父 change 或 `group/subchange` 简写。
- 执行前先运行 `opsx changes resolve <name>` 获取真实 change root。
- 下文 `specs/**/*.md`、`design.md`、`audit-log.md`、`.openspec.yaml` 均指 resolved change root。

## 硬性门控

这是强制关卡。plan-review 通过前，禁止生成 `tasks.md` 或进入后续阶段。

## 输入 / 输出边界

读取：
- `.openspec.yaml`
- `specs/**/*.md`
- `design.md`
- 命中的 `.aiknowledge/codemap/` 和 `.aiknowledge/pitfalls/`（按需）

写入：
- `audit-log.md`（追加）
- `.openspec.yaml` 的 `gates.plan-review`（仅通过时）

禁止：
- 不写 `tasks.md`
- 不改业务代码
- 不复制 StageResult schema；格式以 `docs/stage-packet-protocol.md` 为准

## 启动序列

1. 确认 git 工作区状态，避免把未理解的改动混入 gate 修正。
2. 读取 `.openspec.yaml`，确认 `design.md` 和 `specs/` 已存在。
3. 直接读取 `specs/**/*.md` 与 `design.md`，不创建 JSON 中间层。
4. 按需读取 `references/reviewer-prompt.md` 执行 trace、granularity、uniqueness、design-integrity 审查。

## 审查方式

按 `~/.opsx/common/subagent.md` reviewer worker contract 派发 1 个只读 reviewer。Codex 默认、Claude Code 兼容映射、controller boundary、只读写入边界和 fallback 均以 `~/.opsx/common/subagent.md` 为准。

reviewer 只读权威产物并输出 StageResult JSON，schema 见 `docs/stage-packet-protocol.md`。主 agent 负责汇总追踪矩阵、追加 `audit-log.md`、写入 `.openspec.yaml` gates；reviewer 不得直接写 gates 或宣称整个 change 可进入下一阶段。

## 完成条件

- 追踪矩阵已覆盖所有 R 与 U。
- TRACE_GAP、GHOST_R、ORPHAN、COARSE_R、DUPLICATE_R 已全部列出。
- findings 已按 `docs/stage-packet-protocol.md` 的 severity 模型处理。

## 退出契约

- 通过：按 `references/audit-gate.md` 追加 `plan-review` pass 记录，写入 `gates.plan-review`，必须转入 **opsx-tasks**。
- 通过且含 warning 修正：先修正 specs/design，再追加 pass 记录和修正列表，写入 `gates.plan-review`，必须转入 **opsx-tasks**。
- 失败：追加 fail 记录，不写 gates，必须回到 **opsx-plan** 修正；禁止跳过直接生成 tasks。
