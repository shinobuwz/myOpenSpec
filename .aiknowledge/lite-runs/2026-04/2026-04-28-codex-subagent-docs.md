---
id: 2026-04-28-codex-subagent-docs
created_at: 2026-04-28T03:01:59Z
kind: lite
status: done
source_refs:
  - docs:supported-tools
  - skill:opsx-explore
---

# Codex-first subagent 文档

## 意图

明确 OPSX 可以复用 Superpowers 风格的 subagent 描述作为平台中立的 workflow 思路，同时把 Codex 作为默认执行映射，把 Claude Code 作为兼容映射。

## 范围

- `docs/supported-tools.md`
- `skills/opsx-explore/SKILL.md`
- `tests/workflow-discipline.test.mjs`

## 变更

- 新增 Codex-first subagent 映射表，覆盖 `spawn_agent`、`wait_agent`、`close_agent`、`update_plan` 以及 Claude Code 等价能力。
- 从 supported tools 列表移除过期的 `opsx-bootstrap` skill 条目，因为不存在对应的 `skills/opsx-bootstrap/` 目录。
- 恢复缺失的 `opsx-report` supported-tools 条目，因为 `skills/opsx-report/` 存在。
- 将 `opsx-explore` 从仅 Claude 风格的 `subagent_type: "Explore"` 文案更新为 Codex 默认映射 + Claude Code 等价映射。
- 增加回归测试，确保文档中的 skill 表与实际 `skills/opsx-*` 目录一致，并保留 Codex/Claude 映射文案。

## 验证

- `npm test` 通过：24 个测试，24 个通过，0 个失败。
- `rg -n "opsx-bootstrap|opsx-report|spawn_agent|Codex \| 默认入口|Claude Code \| 兼容入口" docs/supported-tools.md tests/workflow-discipline.test.mjs skills/opsx-explore/SKILL.md .aiknowledge/lite-runs/2026-04/2026-04-28-codex-subagent-docs.md` 确认 supported docs 中没有过期的 `opsx-bootstrap` 条目，`opsx-report` 存在，且 Codex/Claude 映射文案存在。
- `npm pack --dry-run --silent` 通过，并报告 `shinobuwz-opsx-1.0.1.tgz`。

## 风险

风险低。本次只改文档和 skill 文案，不改变 CLI 行为、skill 安装流程或 OpenSpec change 状态。

## 知识沉淀

已更新 `.aiknowledge/codemap/openspec-skills.md`，记录 Codex-first subagent 派发映射，并追加月度知识日志。
