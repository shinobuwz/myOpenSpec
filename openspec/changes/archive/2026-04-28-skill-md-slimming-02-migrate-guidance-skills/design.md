## 上下文

`01-slimming-structure` 已定义 OPSX skill 的瘦身政策、库存和检查脚本。当前体量最高且更偏 guidance 的入口文件是 `opsx-explore`、`opsx-knowledge`、`opsx-codemap`；次级候选包括 `opsx-lite`、`opsx-slice`、`opsx-auto-drive`、`opsx-bugfix`。本 subchange 只迁移 guidance 类 skill，不处理 gate/reviewer skills。

迁移原则来自 `docs/skill-slimming-policy.md` 和 `../agent-standards/references/skill-design.md`：`SKILL.md` 保持短入口，低频细节放入同 skill `references/`，公共契约只引用 canonical source，不复制正文。

## 目标 / 非目标

**目标：**
- 瘦身 `opsx-explore`、`opsx-knowledge`、`opsx-codemap` 的入口文件。
- 按容量瘦身 `opsx-lite`、`opsx-slice`、`opsx-auto-drive`、`opsx-bugfix`。
- 为每个受影响 skill 建立可按需读取的 `references/`。
- 保留入口文件中必须立即可见的硬性安全规则。
- 增加或调整测试，防止 guidance skill 重新膨胀或丢失 reference 导航。

**非目标：**
- 不迁移 `opsx-plan-review`、`opsx-task-analyze`、`opsx-verify`、`opsx-review`、`opsx-archive` 等 gate/reviewer skills。
- 不改变 `.openspec.yaml` gates、StageResult、audit-log 或 review-report 协议。
- 不改变 `.aiknowledge` lifecycle，只改变 skill 文档布局。
- 不执行 `opsx install-skills`、发布包或同步项目 adapter。

## 需求追踪

- [R1] -> [U1], [U2]
- [R2] -> [U1], [U2]
- [R3] -> [U3]
- [R4] -> [U1], [U2], [U3]
- [R5] -> [U1], [U2], [U3]
- [R6] -> [U4]

## 实施单元

### [U1] `opsx-explore` 入口瘦身
- 关联需求: [R1], [R2], [R4], [R5]
- 模块边界:
  - `skills/opsx-explore/SKILL.md`
  - `skills/opsx-explore/references/*.md`
- 验证方式: 检查入口文件仍包含只读边界、OpenSpec/slice 转入规则、codemap-first 规则和 reference 导航；长切入点、收敛流程、示例和 codemap 细节迁入 references。
- 知识沉淀: `opsx-explore` 是对话型入口，硬性“不写代码”和“需要变更时转入 slice/plan”的规则必须留在入口。

### [U2] `.aiknowledge` guidance skills 入口瘦身
- 关联需求: [R1], [R2], [R4], [R5]
- 模块边界:
  - `skills/opsx-knowledge/SKILL.md`
  - `skills/opsx-knowledge/references/*.md`
  - `skills/opsx-codemap/SKILL.md`
  - `skills/opsx-codemap/references/*.md`
- 验证方式: 检查入口文件仍要求写入前读取 `.aiknowledge/README.md`、保持 source_refs、更新 index 和月度日志；目录结构、模板、场景步骤和 stale/merge/deprecate 细节迁入 references。
- 知识沉淀: `.aiknowledge/README.md` 是 lifecycle canonical source，skill 入口只保留执行时不可遗漏的安全摘要和导航。

### [U3] 次级 guidance skills 入口瘦身
- 关联需求: [R3], [R4], [R5]
- 模块边界:
  - `skills/opsx-lite/SKILL.md`
  - `skills/opsx-lite/references/*.md`
  - `skills/opsx-slice/SKILL.md`
  - `skills/opsx-slice/references/*.md`
  - `skills/opsx-auto-drive/SKILL.md`
  - `skills/opsx-auto-drive/references/*.md`
  - `skills/opsx-bugfix/SKILL.md`
  - `skills/opsx-bugfix/references/*.md`
- 验证方式: 检查入口文件继续保留 lite 升级条件、fresh evidence、slice cohesion 判定、auto-drive 门控、bugfix root-cause 铁律；长模板和细节迁入 references。
- 知识沉淀: 次级 guidance skills 可以保守迁移；若某个文件已经健康，只迁出明显模板，不为压行数牺牲入口可执行性。

### [U4] 验证与回归测试
- 关联需求: [R6]
- 模块边界:
  - `tests/skill-slimming.test.mjs`
  - `tests/workflow-discipline.test.mjs`
  - `scripts/check-skill-slimming.mjs`
  - `docs/skill-slimming-inventory.md`
- 验证方式: `npm test`；`node scripts/check-skill-slimming.mjs --json`；必要时使用 `wc -l` 和 `rg` 检查入口行数、reference 导航、canonical contract 重复。
- 知识沉淀: 测试应验证迁移后的结构和关键硬规则，不应把所有 reference 正文重新固定到入口文件测试中。

## 迁移策略

1. 每个 skill 先按标题和语义切分：入口文件保留触发、边界、核心流程和护栏；长模板/示例/细节复制到 `references/<topic>.md`。
2. Reference 文件按主题拆分，优先采用 `workflow.md`、`templates.md`、`lifecycle.md`、`examples.md`、`routing.md` 等 kebab-case 文件名。
3. 入口文件的 reference 导航必须写清“何时读”，避免 agent 为了执行基础路径一次性加载全部 reference。
4. 对已有脏文件（例如 `opsx-lite/SKILL.md` 的中文模板修正）保留并吸收，不回退用户或其它流程的修改。
5. 迁移完成后更新 `docs/skill-slimming-inventory.md` 的行数和状态，作为 `03-migrate-gate-skills` 的新基线。

## 风险 / 权衡

- [风险] 迁移过度导致 agent 入口信息不足 -> [缓解] 硬性门控、读写边界和退出契约必须留在 `SKILL.md`。
- [风险] references 命名过细导致查找成本上升 -> [缓解] 每个 skill 控制在少量主题文件，并在入口列出读取时机。
- [风险] 迁移中误改 workflow 语义 -> [缓解] 使用现有 tests 和 `rg` 检查关键语句；review 阶段逐项比对行为不变。
- [风险] 次级 skill 范围过大 -> [缓解] 主要 guidance skills 必做，次级 skills 只迁出明显模板和长流程；若容量不足，不把健康入口强行拆散。

## Open Questions

- `03-migrate-gate-skills` 是否应复用本次新增的测试结构来约束 gate/reviewer skills 的 StageResult 引用？当前判断是复用检查脚本和新增测试模式，但具体收紧留到 `03`。
