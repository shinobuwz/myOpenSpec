# Tasks: `.aiknowledge` lifecycle

## Task 1：定义知识生命周期契约

- [x] 1.1 [R1][R2][R3][U1][direct] 新增 `.aiknowledge` 顶层 schema、月度 append-only log 和 source_refs 规则

**需求追踪**：[R1][R2][R3] → [U1]
**执行方式**：[direct]
**涉及文件**：
- `.aiknowledge/README.md` — 统一 lifecycle schema 与状态机
- `.aiknowledge/log.md` — 审计日志索引
- `.aiknowledge/logs/YYYY-MM.md` — append-only 月度审计日志

**验收标准**：
- [x] `.aiknowledge/README.md` 定义 source refs、LLM-maintained wiki、schema/guardrail 三层职责
- [x] `.aiknowledge/README.md` 定义 update、merge、deprecate、supersede、lint 的操作规则
- [x] `.aiknowledge/log.md` 提供日志索引
- [x] `.aiknowledge/logs/YYYY-MM.md` 提供 append-only 记录格式和初始记录

**依赖**：无

## Task 2：约束 knowledge 与 codemap skill

- [x] 2.1 [R4][R5][U2][direct] 更新维护 skill，使其遵守 lifecycle、审计日志和 tombstone 合并规则

**需求追踪**：[R4][R5] → [U2]
**执行方式**：[direct]
**涉及文件**：
- `skills/opsx-knowledge/SKILL.md` — pitfalls 维护规则
- `skills/opsx-codemap/SKILL.md` — codemap 维护规则

**验收标准**：
- [x] `opsx-knowledge` 要求读取 `.aiknowledge/README.md`
- [x] `opsx-knowledge` 合并正式条目时保留 tombstone 或 `superseded` 条目
- [x] `opsx-knowledge` 新增、更新、合并、废弃和 lint 修复后追加月度日志
- [x] `opsx-codemap` 使用同一套 source refs、append-only log 和状态引用规则

**依赖**：Task 1

## Task 3：刷新 OpenSpec skills codemap

- [x] 3.1 [R5][R6][U3][direct] 更新 `openspec-skills` codemap，记录 `.aiknowledge` lifecycle 对 skill 的约束

**需求追踪**：[R5][R6] → [U3]
**执行方式**：[direct]
**涉及文件**：
- `.aiknowledge/codemap/openspec-skills.md` — skill 架构认知地图

**验收标准**：
- [x] codemap 关键文件列表或隐式约束包含 `.aiknowledge/README.md` 和 `.aiknowledge/log.md`
- [x] codemap 说明 `opsx-knowledge` 与 `opsx-codemap` 共享 lifecycle 语义
- [x] codemap `last_verified_at` 刷新为当前日期

**依赖**：Task 2

## Task 4：验证知识生命周期变更

- [x] 4.1 [R1][R2][R3][R4][R5][R6][U1][U2][U3][direct] 执行文档一致性和仓库测试验证

**需求追踪**：[R1][R2][R3][R4][R5][R6] → [U1][U2][U3]
**执行方式**：[direct]
**涉及文件**：
- `openspec/changes/2026-04-27-aiknowledge-lifecycle/test-report.md` — 验证记录

**验收标准**：
- [x] grep 检查 lifecycle 关键词在 schema 与两个 skill 中存在
- [x] `npm test` 通过
- [x] test-report.md 记录验证命令和结果

**依赖**：Task 3
