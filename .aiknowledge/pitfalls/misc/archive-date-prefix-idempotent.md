---
id: archive-date-prefix-idempotent
title: archive 目录加日期必须幂等
status: active
created_at: 2026-04-27
last_verified_at: 2026-04-27
last_verified_by: opsx-bugfix
applies_to:
  - skills/opsx-archive/SKILL.md
  - openspec/changes/archive/
tags:
  - archive
  - date-prefix
  - idempotency
  - workflow
---

# archive 目录加日期必须幂等

## 现象

归档 change 时，如果原始 change 名已经带日期前缀，例如 `2026-04-27-demo`，归档指令仍固定生成 `YYYY-MM-DD-<archive-slug>`，会得到 `2026-04-27-2026-04-27-demo` 这样的双重日期目录。

## 根因

归档逻辑把日期前缀当成无条件装饰，而不是把 archive 目录名当成应幂等计算的结果。

## 修复 Diff

- 引入 `<archive-dir>` 概念。
- `<archive-slug>` 已经以 `YYYY-MM-DD-` 开头时，`<archive-dir>=<archive-slug>`。
- `<archive-slug>` 未带日期时，才使用 `<today>-<archive-slug>`。
- 修正已有双日期归档目录为单日期。

## 要点

归档、迁移、同步这类文件系统操作的目标路径计算必须是幂等的。凡是输入名可能已经包含规范前缀，都应先检测再补齐，不能无条件拼接。

## 来源

2026-04-27 修复 `opsx-archive` 双重日期归档问题时记录。
