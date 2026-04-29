---
name: opsx-verify
description: 实施完成后或归档前使用，用于确认代码、测试留档和人工验收状态是否满足当前 OpenSpec change 的产出物。
---

# 实现验证

验证实现是否满足当前 OpenSpec 产出物。入口只保留 fresh evidence、gate、读写边界和路由；完整 reviewer prompt 见 `references/reviewer-prompt.md`，证据规则见 `references/fresh-evidence.md`。

## 证据铁律

没有当前轮验证证据，不允许宣称完成、通过、已修复或可归档。

成功结论必须能引用本轮实际读取或执行的证据：`tasks.md`、`specs/**/*.md`、`design.md`、`test-report.md`、实现文件或 diff、验证命令退出状态，以及人工验收项状态。历史输出、主观判断、subagent 口头成功报告都不能单独作为完成依据。

## Change Root

- `<name>` 可以是单个 change、父 change 或 `group/subchange` 简写。
- 执行前先运行 `opsx changes resolve <name>` 获取真实 change root。
- 下文 `tasks.md`、`specs/`、`design.md`、`audit-log.md`、`.openspec.yaml` 均指 resolved change root。
- `target_kind: fast` 时，使用 `opsx changes resolve-fast <id>` 获取 fast root；读取 `item.md`、`evidence.md`、`root-cause.md`（如存在）和 `test-report.md`，不要求 specs/design/tasks。

## 输入 / 输出边界

读取：
- `.openspec.yaml`
- `tasks.md`
- `specs/**/*.md`、`design.md`（如存在）
- `test-report.md`（如存在且需要检查）
- fast target 的 `item.md`、`evidence.md`、`root-cause.md`（如存在）
- `tasks.md` 中列出的实现、测试、skill、docs 文件
- 命中的 `.aiknowledge/codemap/`（按需）

写入：
- `audit-log.md`（pass 和 fail 均追加）
- `.openspec.yaml` 的 `gates.verify`（仅通过时）

禁止：
- 不修改实现文件或任务状态
- 不写 `review-report.md`
- 不复制 StageResult schema；格式以 `docs/stage-packet-protocol.md` 为准

## 启动序列

1. 如未提供变更且无法从上下文唯一确定，列出可用变更并要求用户选择。
2. 校验 change 目录、`tasks.md`、相关产物和实现文件存在。
3. 读取本轮 fresh evidence；没有证据时只能输出待验证，不能输出通过。
4. 按 `references/reviewer-prompt.md` 执行 Spec Compliance Review 和验证维度检查。

## 审查方式

按 `opsx-subagent` reviewer worker contract 派发 1 个只读 reviewer。Codex 默认、Claude Code 兼容映射、controller boundary、只读写入边界和 fallback 均以 `opsx-subagent` 为准。

reviewer 在同一轮执行 `VERIFY_SPEC_COMPLIANCE`、完整性、正确性、一致性、测试留档和人工验证项检查，并输出 StageResult JSON，schema 见 `docs/stage-packet-protocol.md`。主 agent 负责把 reviewer 报告转化为可引用的 StageResult / audit-log 证据，追加 `audit-log.md` 并写入 `gates.verify`。

## 完成条件

- 所有已完成 task 都有实现或文档证据。
- 未完成 task、需求缺口、范围外实现、test-report 缺失或覆盖率字段不合规均已列出。
- 人工验收项已区分已验 / 待验。
- 验证命令和退出状态已记录。

## 退出契约

- 通过：按 `references/fresh-evidence.md` 追加 `verify` pass 记录，写入 `gates.verify`，必须转入 **opsx-review**。
- 未通过：追加 `verify` fail 记录，不写 gates；列出需修复项，禁止继续后续流程。
