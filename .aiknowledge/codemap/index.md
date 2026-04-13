# Codemap

事件驱动维护的长期架构知识。索引中的状态含义：

- `active`：当前可直接作为定位和边界约束使用
- `stale`：只能作为线索，使用前必须先刷新
- `superseded`：已被新条目替代，默认不再直接消费

## 模块

| 模块 | 状态 | 最近复核 | 职责 | 入口 |
|------|------|----------|------|------|
| [openspec-skills](openspec-skills.md) | active | 2026-04-13 | OpenSpec 工作流 skill 的单一真相源，被 git 追踪并通过 sync.sh 分发 | `.claude/skills/` |
| [skill-sync](skill-sync.md) | active | 2026-04-13 | 将 skill 文件同步到目标仓库的 shell 脚本，替代已删除的 TypeScript CLI | `scripts/sync.sh`, `scripts/sync-all.sh` |

## 链路

| 链路 | 状态 | 最近复核 | 涉及模块 | 说明 |
|------|------|----------|----------|------|
| spec-driven 主流程 | active | 2026-04-13 | openspec-skills | plan→plan-review→tasks→task-analyze→implement→verify→review→archive |
| bugfix 旁路 | active | 2026-04-13 | openspec-skills | bugfix（跳过规划，直接修复） |
| skill 分发 | active | 2026-04-13 | openspec-skills → skill-sync | skill 文件变更后通过 sync.sh 同步到目标仓库 |
