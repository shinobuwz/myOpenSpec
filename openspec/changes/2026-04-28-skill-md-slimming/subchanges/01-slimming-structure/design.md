## 上下文

OPSX 当前维护 19 个 `opsx-*` skills，`SKILL.md` 总体量已超过 3400 行。几个入口文件承担了长教程、完整 prompt、输出模板、示例、生命周期规则和公共契约复制，已经偏离 `/Users/cc/mySkills/skills/agent-standards/references/skill-design.md` 中“短而可执行”的设计准则。

本 subchange 不迁移具体长文件。它只定义瘦身结构、库存和检查方式，让后续 `02-migrate-guidance-skills` 与 `03-migrate-gate-skills` 有统一标准。

## 目标 / 非目标

**目标：**
- 定义 OPSX `SKILL.md` 的入口文件边界。
- 定义 per-skill `references/` 的承载边界。
- 定义 canonical contract 的引用规则，避免重复复制公共规范。
- 记录当前 `SKILL.md` 基线库存和迁移优先级。
- 提供可重复执行的检查，使后续文案膨胀和契约复制可见。

**非目标：**
- 不迁移具体 skill 正文。
- 不删除 skill，不合并 workflow stage。
- 不改变 `.openspec.yaml` gates、StageResult、audit-log、review-report 或 TDD 语义。
- 不安装全局 skills，不同步 adapter。

## 需求追踪

- [R1] -> [U1]
- [R2] -> [U1]
- [R3] -> [U1]
- [R4] -> [U1]
- [R5] -> [U1]
- [R6] -> [U2]
- [R7] -> [U3]
- [R8] -> [U3]
- [R9] -> [U3]

## 实施单元

### [U1] 瘦身政策文档
- 关联需求: [R1], [R2], [R3], [R4], [R5]
- 模块边界:
  - `docs/skill-slimming-policy.md`
- 验证方式: 文档检查确认政策覆盖 `SKILL.md` 保留内容、`references/` 迁移内容、canonical contract 引用、安全规则可见性和 workflow 边界不变。
- 知识沉淀: 引用公共规范时只写导航，不复制正文；硬性安全规则仍留在入口文件。

### [U2] 基线库存文档
- 关联需求: [R6]
- 模块边界:
  - `docs/skill-slimming-inventory.md`
  - `skills/*/SKILL.md`
- 验证方式: 对比 `wc -l skills/*/SKILL.md` 输出和库存文档，确认每个 `opsx-*` skill 都有行数、风险标签、迁移优先级。
- 知识沉淀: 后续迁移应以高行数和高重复风险为优先，而不是机械按目录顺序改动。

### [U3] 瘦身检查
- 关联需求: [R7], [R8], [R9]
- 模块边界:
  - `scripts/check-skill-slimming.mjs`
  - `tests/workflow-discipline.test.mjs` 或 `tests/skill-slimming.test.mjs`
  - `package.json`
- 验证方式: `npm test`；必要时直接运行 `node scripts/check-skill-slimming.mjs`，确认能列出超限入口文件和重复 canonical contract 文案。
- 知识沉淀: 文案型规则需要测试锁定，否则后续 skill 演化容易重新膨胀或复制公共契约。

## 决策

1. **新增仓库内政策文档，而不是修改外部 agent-standards。** 外部 `agent-standards` 是上游准则，本仓库需要本地可评审、可测试的实施细则。
2. **将体量库存作为显式文档。** 脚本能重新计算行数，但迁移优先级和风险标签需要人工判断，适合沉淀为文档。
3. **用 Node 脚本做检查。** 仓库已经要求 Node 20.19+，`npm test` 使用 node:test；新增检查不需要引入未声明外部 CLI。
4. **只检查 `skills/opsx-*/SKILL.md`。** `skills/agent-team/` 等非 OPSX 或残留目录不进入本 subchange 的政策判断，避免扩大范围。
5. **阈值先作为可调政策。** `opsx-explore` 等入口在迁移前会超限；本 subchange 的检查可以先输出 inventory 和风险，也可以在测试里只锁定“存在检查能力”和“canonical contract 不被新增复制”。后续迁移 subchange 再收紧阈值。

## 风险 / 权衡

- [风险] 增加文档可能被后续维护者忽略 -> [缓解] 增加脚本或测试入口，让规则能在 CI/本地测试中暴露。
- [风险] 阈值过严会阻塞迁移前的仓库状态 -> [缓解] 先记录 baseline，再由后续 subchange 逐步降低或分层阈值。
- [风险] 把安全红线移入 reference 会降低执行可靠性 -> [缓解] 政策明确硬性安全规则必须保留在 `SKILL.md`。
- [风险] 检查脚本误报导致维护成本上升 -> [缓解] 只检查高置信特征，例如完整 StageResult schema 字段块、平台映射表和明显长文件阈值。

## Migration Plan

1. 本 subchange 新增政策、库存和检查能力。
2. `02-migrate-guidance-skills` 按政策迁移 guidance-heavy skills。
3. `03-migrate-gate-skills` 按政策迁移 gate/reviewer skills，并收紧 canonical contract 重复检查。

## 知识沉淀

归档后应更新 `.aiknowledge/codemap/openspec-skills.md`，记录 OPSX skills 采用 `SKILL.md` 短入口 + `references/` 渐进披露的维护规则。

## Open Questions

- 是否将 `docs/skill-slimming-policy.md` 也纳入 npm package 的 `files` 列表？当前判断是不需要，因为它是仓库维护文档，不是 skill runtime。
