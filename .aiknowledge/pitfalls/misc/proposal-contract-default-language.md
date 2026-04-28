---
status: active
created_at: 2026-04-28
created_from: source:user-feedback-2026-04-28-proposal-md-english
last_verified_at: 2026-04-28
last_verified_by: opsx-bugfix
verification_basis: bugfix + workflow test
applies_to:
  - skills/opsx-slice/SKILL.md
  - runtime/schemas/spec-driven/schema.yaml
  - runtime/schemas/spec-driven/templates/proposal.md
source_refs:
  - source:user-feedback-2026-04-28-proposal-md-english
  - path:openspec/changes/archive/2026-04-28-subagent-workflow-adapter-02-workflow-skill-adoption/proposal.md
superseded_by:
merged_from:
deprecated_reason:
---

# Proposal contracts must declare the default language

**标签**：[opsx, proposal, skill, schema, language]

## 现象

`proposal.md` 生成结果全是英文，即使 `runtime/schemas/spec-driven/templates/proposal.md` 已经是中文模板。典型输出包含 `Goal`、`In Scope`、`Out of Scope`、`Depends On`、`Done Means` 等英文章节。

## 根因

生成 proposal 的提示契约不只来自模板文件。`opsx-slice` 会直接初始化 subchange proposal，且曾硬编码英文章节要求；`schema.yaml` 的 proposal instruction 也混用 `Why`、`What Changes`、`New Capabilities`、`Impact` 等英文标题。Agent 会优先遵循这些显式章节要求，导致中文模板被绕过或覆盖。

## 修复 diff

- 将 `skills/opsx-slice/SKILL.md` 的 proposal 必备章节改为 `目标`、`范围内`、`范围外`、`依赖`、`完成标准`。
- 将 `runtime/schemas/spec-driven/schema.yaml` 的 proposal instruction 改为中文节名，并声明正式产物默认使用中文。
- 在 `tests/workflow-discipline.test.mjs` 增加回归测试，防止英文章节契约回流。

## 要点

对 agent 来说，模板不是唯一约束。凡是 skill、schema 或流程说明会直接要求产物结构，都必须同步声明默认语言；技术 token 如路径、命令、capability id、配置键名可以保留原文。

## 来源

用户反馈归档样例 `proposal.md` 总是全英文；本次排查确认模板已是中文，坏值来自 `opsx-slice` 和 schema 的英文提示契约。
