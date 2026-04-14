---
status: active
created_at: 2026-04-14
created_from: change:2026-04-14-slim-run-report
last_verified_at: 2026-04-14
last_verified_by: opsx-knowledge
verification_basis: archive
applies_to:
  - docs/workflows.md
superseded_by:
---

# workflows.md 中 skill 引用使用连字符语法，不用冒号

**标签**：[openspec, skill, workflows, 文档]

## 现象

`docs/workflows.md` 中将 opsx-report 的调用方式写为 `/opsx:report`，该语法在 Claude Code 中无效，实际引用会失败。

## 根因

混淆了两种语法：`/opsx:report` 是旧的或错误的格式，Claude Code 的 skill 调用语法应为连字符分隔的完整 skill 名称：`/opsx-report`。

## 修复前

```diff
- 可随时调用 `/opsx:report` 生成 HTML 报告
```

## 修复后

```diff
+ 可随时调用 `/opsx-report` 生成 HTML 报告
```

## 要点

在 `docs/workflows.md` 或任何说明文档中引用 skill 时，必须使用连字符语法 `/skill-name`，冒号语法 `/namespace:command` 不被 Claude Code 识别。

## 来源

change: 2026-04-14-slim-run-report（2026-04-14）
