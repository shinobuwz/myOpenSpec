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

# changes.sh 默认路径应项目优先并回退到 ~/.claude

## 现象

`changes.sh` 直接把 `CHANGES_DIR` 和 `SCHEMAS_DIR` 固定到当前仓库路径，
当项目里缺少 `openspec/changes` 或 `.claude/opsx/schemas` 时，不会自动使用全局 `~/.claude` 下的对应目录。

## 根因

脚本启动时只计算了：

- `$REPO_ROOT/openspec/changes`
- `$REPO_ROOT/.claude/opsx/schemas`

缺少“项目目录是否存在”的判断，也没有全局回退分支。

## 正确做法

路径解析应遵循：

1. 优先使用项目内目录
2. 若项目目录不存在，再回退到 `~/.claude`

推荐固定两组候选路径：

- 项目：`$REPO_ROOT/openspec/changes`、`$REPO_ROOT/.claude/opsx/schemas`
- 全局：`$HOME/.claude/openspec/changes`、`$HOME/.claude/opsx/schemas`

并在赋值时用 `[ -d ... ]` 做存在性判断。

## 修复 diff

```bash
PROJECT_CHANGES_DIR="$REPO_ROOT/openspec/changes"
PROJECT_SCHEMAS_DIR="$REPO_ROOT/.claude/opsx/schemas"
GLOBAL_CHANGES_DIR="$HOME/.claude/openspec/changes"
GLOBAL_SCHEMAS_DIR="$HOME/.claude/opsx/schemas"

CHANGES_DIR="$PROJECT_CHANGES_DIR"
SCHEMAS_DIR="$PROJECT_SCHEMAS_DIR"

[ -d "$PROJECT_CHANGES_DIR" ] || CHANGES_DIR="$GLOBAL_CHANGES_DIR"
[ -d "$PROJECT_SCHEMAS_DIR" ] || SCHEMAS_DIR="$GLOBAL_SCHEMAS_DIR"
```

## 要点

- 不要把路径策略写死成“只认项目内”或“只认全局”
- 对 shell 脚本的目录解析，优先用最小存在性判断，不引入复杂配置层
- `changes` 和 `schemas` 要分别判断，不能假设二者一定同时存在

## 来源

2026-04-17 在修复 `.claude/opsx/bin/changes.sh` 默认路径行为时确认。
