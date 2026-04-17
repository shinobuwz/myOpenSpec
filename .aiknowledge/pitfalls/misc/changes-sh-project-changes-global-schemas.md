---
status: active
created_at: 2026-04-17
created_from: opsx-bugfix
last_verified_at: 2026-04-17
last_verified_by: opsx-bugfix
verification_basis: code-inspection
applies_to:
  - .claude/opsx/bin/changes.sh
superseded_by:
---

# changes.sh 中 changes 必须项目级，只有 schemas 可回退全局

## 现象

如果把 `changes.sh` 的 `CHANGES_DIR` 也设计成可回退 `~/.claude`，
`list` / `resolve` 等命令就会读到全局 change，导致不同项目之间的 change 状态互相污染。

## 根因

把 `changes` 和 `schemas` 视为同一类路径资源，统一套用了“项目优先、缺失回退全局”的策略。
但两者职责不同：

- `changes` 是当前项目的工作流状态
- `schemas` / `skills` 是可复用的共享能力

## 正确做法

路径归属必须分离：

1. `CHANGES_DIR` 永远固定到项目目录：`$REPO_ROOT/openspec/changes`
2. `SCHEMAS_DIR` 才允许项目优先、缺失时回退到 `$HOME/.claude/opsx/schemas`

## 修复 diff

```bash
CHANGES_DIR="$REPO_ROOT/openspec/changes"
PROJECT_SCHEMAS_DIR="$REPO_ROOT/.claude/opsx/schemas"
GLOBAL_SCHEMAS_DIR="$HOME/.claude/opsx/schemas"
SCHEMAS_DIR="$PROJECT_SCHEMAS_DIR"

[ -d "$PROJECT_SCHEMAS_DIR" ] || SCHEMAS_DIR="$GLOBAL_SCHEMAS_DIR"
```

## 要点

- `changes` 永远属于项目，不能回退到全局
- `schemas`/`skills` 可以作为全局共享能力存在
- 设计 shell 路径策略时，先区分“项目状态”与“共享资源”，不要一刀切复用同一回退规则

## 来源

2026-04-17 在修复 `.claude/opsx/bin/changes.sh` 归属策略时确认。
