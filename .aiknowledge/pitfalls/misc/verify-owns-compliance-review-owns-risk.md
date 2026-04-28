---
status: active
created_at: 2026-04-28
created_from: change:2026-04-28-superpowers-discipline
last_verified_at: 2026-04-28
last_verified_by: opsx-archive
verification_basis: archive
applies_to:
  - skills/opsx-verify/SKILL.md
  - skills/opsx-review/SKILL.md
  - .aiknowledge/codemap/openspec-skills.md
source_refs:
  - change:2026-04-28-superpowers-discipline
superseded_by:
---

# Verify Owns Compliance, Review Owns Risk

## 现象

吸收外部 workflow 的“两段 review”思想时，容易把 `spec compliance` 和 `code quality / release risk` 都塞进 `opsx-review`。

## 根因

OPSX 已经有明确 gate 分层：

- `opsx-verify` 判断实现是否满足 OpenSpec 产物。
- `opsx-review` 判断代码是否存在发布风险。

如果 review 重复承担完整 spec compliance，会让阶段职责重叠，也会降低 `gates.verify` 的语义强度。

## 规则

`opsx-verify` 拥有 Spec Compliance Review。它检查 proposal/design/specs/tasks 是否被实现、是否有需求遗漏、是否存在范围外实现。

`opsx-review` 只做 code quality / release risk review。它检查崩溃、数据损坏、安全、兼容性、资源泄漏、竞态和错误处理。

## 例外

如果 `opsx-review` 过程中发现明显需求遗漏或范围外实现，不在 review 内重跑完整 compliance；输出 `VERIFY_DRIFT`，并路由回 `opsx-verify`。

## 修复 diff

- `skills/opsx-verify/SKILL.md` 增加 `VERIFY_SPEC_COMPLIANCE` 维度。
- `skills/opsx-review/SKILL.md` 移除两段审查，改为 release-risk-only + `VERIFY_DRIFT` 兜底。
- `tests/workflow-discipline.test.mjs` 锁定该职责边界。
