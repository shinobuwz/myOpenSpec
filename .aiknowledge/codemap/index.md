# Codemap

事件驱动维护的长期架构知识。索引中的状态含义：

- `active`：当前可直接作为定位和边界约束使用
- `stale`：只能作为线索，使用前必须先刷新
- `superseded`：已被新条目替代，默认不再直接消费

## 模块

| 模块 | 状态 | 最近复核 | 职责 | 入口 |
|------|------|----------|------|------|
| [openspec-skills](openspec-skills.md) | active | 2026-04-27 | OpenSpec 工作流 skill 的单一真相源，并约束 `.aiknowledge` lifecycle 维护规则 | `skills/`, `.aiknowledge/` |
| [skill-sync](skill-sync.md) | active | 2026-04-27 | 将 skill adapter 同步到目标仓库；通用 runtime 由全局 opsx launcher 提供 | `scripts/sync.sh`, `bin/opsx.mjs` |
| [stage-packet-protocol](stage-packet-protocol.md) | active | 2026-04-14 | gate stage 审查结论的输出结构和留档格式：StageResult schema + audit-log.md 规范 | `docs/stage-packet-protocol.md` |

## 链路

| 链路 | 状态 | 最近复核 | 涉及模块 | 说明 |
|------|------|----------|----------|------|
| spec-driven 主流程 | active | 2026-04-13 | openspec-skills | plan→plan-review→tasks→task-analyze→implement→verify→review→archive |
| bugfix 旁路 | active | 2026-04-13 | openspec-skills | bugfix（跳过规划，直接修复） |
| skill 分发 | active | 2026-04-27 | openspec-skills → skill-sync | skill 文件变更后通过 opsx install-skills 安装到全局，或通过 sync.sh 同步项目 adapter |
| [stage-packet 数据流](chains/stage-packet-flow.md) | superseded | 2026-04-14 | openspec-skills, stage-packet-protocol | ~~已废弃：原 Packet/run-report-data.json 流已被 audit-log.md 直读模式替代~~ |
