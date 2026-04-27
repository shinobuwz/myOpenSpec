---
status: active
created_at: 2026-04-13
created_from: metadata-backfill
last_verified_at: 2026-04-27
last_verified_by: repository-audit
verification_basis: workflow-audit
applies_to:
  - scripts/sync.sh
  - bin/opsx.mjs
superseded_by:
---

# skill-sync

## 职责
将 `.claude/skills/opsx-*` 同步到目标仓库作为工具 adapter。通用 runtime、schemas 和模板由全局 npm `opsx` launcher 分发，不再通过 `sync.sh` 复制到每个项目。

## 关键文件
| 文件 | 角色 |
|------|------|
| `scripts/sync.sh` | 单仓库同步：接受 `<target-dir>` 参数，只复制 `.claude/skills/opsx-*` |
| `bin/opsx.mjs` | 全局 launcher：负责 `install-skills`、`init-project` 和 `changes` 分发 |

## 隐式约束
- `sync.sh` 依赖当前工作目录为仓库根目录（使用 `SCRIPT_DIR/../` 计算 `REPO_ROOT`）
- `sync.sh` 不复制 `.claude/opsx`，避免 runtime/templates 在多个仓库间漂移
- `opsx install-skills` 支持 `OPSX_AGENTS_SKILLS_HOME`，便于测试和非默认 agent home
