---
status: active
created_at: 2026-04-28
created_from: change:2026-04-28-skill-md-slimming/01-slimming-structure
last_verified_at: 2026-04-28
last_verified_by: opsx-archive
verification_basis: archive + guidance-migration
applies_to:
  - skills/opsx-*/SKILL.md
  - skills/opsx-*/references
  - docs/skill-slimming-policy.md
  - scripts/check-skill-slimming.mjs
source_refs:
  - change:2026-04-28-skill-md-slimming/01-slimming-structure
  - change:2026-04-28-skill-md-slimming/02-migrate-guidance-skills
  - audit-log:openspec/changes/archive/2026-04-28-skill-md-slimming-01-slimming-structure/audit-log.md
  - test-report:openspec/changes/archive/2026-04-28-skill-md-slimming-01-slimming-structure/test-report.md
  - review-report:openspec/changes/archive/2026-04-28-skill-md-slimming-01-slimming-structure/review-report.md
  - audit-log:openspec/changes/archive/2026-04-28-skill-md-slimming-02-migrate-guidance-skills/audit-log.md
  - test-report:openspec/changes/archive/2026-04-28-skill-md-slimming-02-migrate-guidance-skills/test-report.md
  - review-report:openspec/changes/archive/2026-04-28-skill-md-slimming-02-migrate-guidance-skills/review-report.md
superseded_by:
merged_from:
deprecated_reason:
---

# Skill 入口文件应保持薄入口

**标签**：[opsx, skill-design, progressive-disclosure, references]

## 现象

`SKILL.md` 很容易逐步塞入长流程、完整 prompt、输出模板、示例、参数表和公共契约正文。文件变长后，agent 进入 skill 时需要一次性加载大量低频细节，且多个 skill 会复制同一套规则，后续维护时容易漂移。

## 根因

Skill 入口文件同时承担“触发入口”和“完整手册”两个角色。真正需要每次立即看到的是触发条件、边界、安全红线、快速入口和下游契约；长流程和公共规范应按需读取。

## 修复前

```diff
- skills/opsx-verify/SKILL.md: 直接复制完整 StageResult JSON 模板
- skills/opsx-explore/SKILL.md: 直接内联大量示例对话和收敛流程细节
- skills/opsx-knowledge/SKILL.md: 直接内联完整目录模板和 lifecycle 细节
```

## 修复后

```diff
+ docs/skill-slimming-policy.md: 定义 SKILL.md 薄入口和 references/ 承载边界
+ docs/skill-slimming-inventory.md: 记录行数、风险和迁移优先级
+ scripts/check-skill-slimming.mjs: 报告超长入口和 canonical contract 复制候选
+ skills/<name>/references/*.md: 承载长流程、模板、示例和边界案例
+ guidance skills: `opsx-explore`、`opsx-knowledge`、`opsx-codemap`、`opsx-lite`、`opsx-slice`、`opsx-auto-drive`、`opsx-bugfix` 已迁移为薄入口 + references
```

## 要点

`SKILL.md` 应短而可执行；长流程、模板、示例和重复公共契约放入 `references/` 或 canonical source，并用检查脚本防止入口文件重新膨胀。

## 来源

change: 2026-04-28-skill-md-slimming/01-slimming-structure
