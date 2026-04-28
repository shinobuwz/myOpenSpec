---
status: active
created_at: 2026-04-28
created_from: source:user-feedback-2026-04-28-aiknowledge-english-records
last_verified_at: 2026-04-28
last_verified_by: opsx-bugfix
verification_basis: bugfix + workflow test
applies_to:
  - .aiknowledge/README.md
  - .aiknowledge/logs
  - .aiknowledge/lite-runs
  - skills/opsx-lite/SKILL.md
source_refs:
  - source:user-feedback-2026-04-28-aiknowledge-english-records
superseded_by:
merged_from:
deprecated_reason:
---

# `.aiknowledge` 事实记录必须声明默认中文

**标签**：[aiknowledge, lite-run, audit-log, skill, language]

## 现象

`.aiknowledge/logs/YYYY-MM.md` 的 `summary` / `reason` 和 `.aiknowledge/lite-runs/` 下的事实记录正文大量使用英文，用户难以快速扫读。

## 根因

`.aiknowledge/README.md` 和 `opsx-lite` 的模板把 lite-run 章节固定为 `Intent`、`Scope`、`Changes`、`Verification`、`Risks`、`Knowledge`，月度日志模板也只给了英文占位。Agent 会把这些英文结构当成自然语言输出风格，继续用英文写说明。

## 修复前

```diff
- lite-run 只记录 Intent / Scope / Changes / Verification / Risks / Knowledge
- summary: <one-line summary>
- reason: <why this operation was needed>
```

## 修复后

```diff
+ lite-run 只记录意图 / 范围 / 变更 / 验证 / 风险 / 知识沉淀
+ summary: <中文一句话摘要>
+ reason: <中文说明为什么需要本次维护>
+ 自然语言默认使用中文；路径、命令、frontmatter key 和稳定标识符保持原文。
```

## 要点

面向机器的 key 可以保持英文，但面向人读的 `.aiknowledge` 日志、lite-run 章节和说明正文必须默认中文；否则模板中的英文会被 agent 扩散成整篇英文记录。

## 来源

用户反馈 `.aiknowledge/logs/2026-04.md` 和 `.aiknowledge/lite-runs/` 全是英文描述；本次修复同步更新 lifecycle、lite-run 模板、历史记录和回归测试。
