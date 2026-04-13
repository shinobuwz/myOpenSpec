---
status: active
created_at: 2026-04-13
created_from: metadata-backfill
last_verified_at: 2026-04-13
last_verified_by: repository-audit
verification_basis: repository-audit
applies_to:
  - .claude/skills/opsx-plan
  - .claude/skills/opsx-plan-review
  - design.md
superseded_by:
---

# design.md 中出现 spec 未定义的 GHOST_R

## 现象

design.md 的需求追踪中出现了 R3、R4、R5 等编号，但 specs/ 目录的任何 spec 文件中都没有对应的 `**Trace**: R3/R4/R5` 声明。这些 R 编号是在 design 阶段直接发明的，并非来自 specs。

## 根因

AI 在生成 design.md 时，把一些实现细节（如"对外格式用连字符"、"demo.js 导出"）提升为独立的 R 编号，而没有先在 spec 中定义对应需求。plan-review 的 ORPHAN 检查语义模糊，只提到"孤立的实施单元 U"，没有明确涵盖"没有 spec 支撑的 R 编号"这一场景。

## 修复 diff

`plan-review.ts`：新增 GHOST_R 检查类型。审查时收集 design 中所有 R 编号 vs specs 中所有 `**Trace**: R?` 声明，差集标记为 GHOST_R。

`plan.ts`：design.md 生成规范中新增 R 编号铁律：所有 R 编号必须来自 specs，禁止在 design 中自行发明。

## 要点

- R 的权威来源是 specs，design 只能引用，不能创造
- 实现细节不需要独立 R 编号，归入对应需求的实施单元（U）即可
- GHOST_R ≠ ORPHAN：GHOST_R 是没有 spec 支撑的 R，ORPHAN 是没有 R 驱动的 U

## 来源

变更 `2026-04-09-fix-session-id-get-json-data` 归档后复盘发现
