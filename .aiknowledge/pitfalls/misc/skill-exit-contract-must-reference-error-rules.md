---
status: active
created_at: 2026-04-13
created_from: change:2026-04-13-stage-packet-protocol
last_verified_at: 2026-04-13
last_verified_by: opsx-knowledge
verification_basis: review
applies_to:
  - .claude/skills/*/SKILL.md
superseded_by:
---

# SKILL.md exit 契约必须显式引用前置步骤的错误处理规则

**标签**：[openspec, skill-authoring, SKILL.md, exit-contract]

## 现象

SKILL.md 的"Exit 契约"章节只列出了正常完成的输出条件，未显式引用步骤中定义的错误处理规则（如"文件损坏时 abort"）。review 发现：执行者在遇到错误时因 Exit 契约未覆盖错误路径，不确定应该 abort 还是继续，导致覆盖了本应终止的操作。

## 根因

Exit 契约通常在 SKILL.md 末尾独立撰写，与中间步骤的错误处理约定在物理位置上分离。撰写者容易遗漏将步骤内的错误约定提升到 Exit 契约层面，形成覆盖缺口。

## 修复前

```diff
- ## Exit 契约
- - audit-log.md 已追加写入
- - HTML 报告已生成
```

## 修复后

```diff
+ ## Exit 契约
+ - audit-log.md 已追加写入（前提：文件若已存在但损坏无法追加，必须 abort，见步骤 3 错误处理）
+ - HTML 报告已生成
+ - 若任意步骤触发错误处理规则（步骤 2/3），则以错误状态退出，不生成报告
```

## 要点

SKILL.md 的 Exit 契约必须显式引用步骤内的错误处理规则，确保错误路径与正常路径同等受约束，避免覆盖缺口。

## 来源

change: 2026-04-13-stage-packet-protocol（2026-04-13）
