# Codemap

## 模块

| 模块 | 职责 | 入口 |
|------|------|------|
| [openspec-skills](openspec-skills.md) | OpenSpec 工作流 skill 的单一真相源，被 git 追踪并通过 sync.sh 分发 | `.claude/skills/` |
| [skill-sync](skill-sync.md) | 将 skill 文件同步到目标仓库的 shell 脚本，替代已删除的 TypeScript CLI | `scripts/sync.sh`, `scripts/sync-all.sh` |

## 链路

| 链路 | 涉及模块 | 说明 |
|------|----------|------|
| spec-driven 主流程 | openspec-skills | plan→plan-review→tasks→task-analyze→implement→verify→review→archive |
| bugfix 旁路 | openspec-skills | bugfix（跳过规划，直接修复） |
| skill 分发 | openspec-skills → skill-sync | skill 文件变更后通过 sync.sh 同步到目标仓库 |
