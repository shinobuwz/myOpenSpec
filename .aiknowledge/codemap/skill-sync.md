---
status: active
created_at: 2026-04-13
created_from: metadata-backfill
last_verified_at: 2026-04-13
last_verified_by: repository-audit
verification_basis: workflow-audit
applies_to:
  - scripts/sync.sh
  - scripts/sync-all.sh
superseded_by:
---

# skill-sync

## 职责
将 `.claude/skills/opsx-*.md` 和 `.codex/commands/opsx*.md` 同步到目标仓库，替代已废弃的 CLI，通过 shell 脚本同步 skill 文件到目标仓库。

## 关键文件
| 文件 | 角色 |
|------|------|
| `scripts/sync.sh` | 单仓库同步：接受 `<target-dir>` 参数，复制 skill 和 codex 文件 |
| `scripts/sync-all.sh` | 批量同步：遍历硬编码的 REPOS 数组，逐一调用 sync.sh |

## 隐式约束
- `sync-all.sh` 的 `REPOS` 数组需要用户手动填写目标仓库路径（初始为占位符）
- `sync.sh` 依赖当前工作目录为仓库根目录（使用 `SCRIPT_DIR/../` 计算 `REPO_ROOT`）
- codex 同步是可选的：源 `.codex/commands/` 不存在时静默跳过，不报错
- `sync.sh` 自己打印 `✓ synced`，`sync-all.sh` 调用后会产生双重输出（已知 WARNING）
