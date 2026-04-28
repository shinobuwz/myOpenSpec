## 上下文

`01-slimming-structure` 已建立 `SKILL.md` 薄入口政策、库存和检查脚本；`02-migrate-guidance-skills` 已将 guidance-heavy skills 迁移到入口 + `references/` 的渐进披露结构。当前剩余风险集中在 gate/reviewer 和 execution support skills：`opsx-verify`、`opsx-archive`、`opsx-review` 仍超过 180 行，`opsx-plan-review` 和 `opsx-verify` 仍复制 StageResult schema。

本 subchange 负责收尾：迁移 gate/reviewer prompts、StageResult 示例、audit/report 模板、TDD/report 模板和长规则表，同时保持 gate 顺序、StageResult schema、verify/review 职责边界和 archive grouped-change 路由语义不变。

## 目标 / 非目标

**目标：**
- 瘦身 gate/reviewer skills 的入口文件。
- 瘦身 execution support skills 中的长模板和长规则表。
- 将 StageResult、audit-log、subagent platform mapping 等公共契约改为 canonical 引用。
- 更新检查与测试，锁定 03 的迁移结果。
- 更新库存文档，作为后续维护基线。

**非目标：**
- 不改变 `.openspec.yaml` gates 字段。
- 不改变 `docs/stage-packet-protocol.md` 的 StageResult schema。
- 不改变 `opsx-verify` 与 `opsx-review` 的职责分工。
- 不新增 workflow stage。
- 不执行 `opsx install-skills`、npm publish 或 adapter sync。

## 需求追踪

- [R1] -> [U1]
- [R2] -> [U1]
- [R3] -> [U1], [U4]
- [R4] -> [U1], [U2], [U3], [U4]
- [R5] -> [U1]
- [R6] -> [U2]
- [R7] -> [U3]
- [R8] -> [U2], [U3]
- [R9] -> [U3]
- [R10] -> [U4]
- [R11] -> [U4]
- [R12] -> [U4]

## 实施单元

### [U1] Gate/reviewer skills 入口瘦身
- 关联需求: [R1], [R2], [R3], [R4], [R5]
- 模块边界:
  - `skills/opsx-plan-review/SKILL.md`
  - `skills/opsx-plan-review/references/*.md`
  - `skills/opsx-task-analyze/SKILL.md`
  - `skills/opsx-task-analyze/references/*.md`
  - `skills/opsx-verify/SKILL.md`
  - `skills/opsx-verify/references/*.md`
  - `skills/opsx-review/SKILL.md`
  - `skills/opsx-review/references/*.md`
- 验证方式: 文本测试确认 gate 前置条件、StageResult canonical 引用、subagent canonical 引用、verify/review 职责边界和 `VERIFY_DRIFT` 路由仍在入口文件中。
- 知识沉淀: reviewer prompt 可以迁入 references，但 gate pass/fail、audit/review report 写入责任、下一阶段路由必须留在入口。

### [U2] Tasks/TDD/Report 模板迁移
- 关联需求: [R6], [R8]
- 模块边界:
  - `skills/opsx-tasks/SKILL.md`
  - `skills/opsx-tasks/references/*.md`
  - `skills/opsx-tdd/SKILL.md`
  - `skills/opsx-tdd/references/*.md`
  - `skills/opsx-report/SKILL.md`
  - `skills/opsx-report/references/*.md`
- 验证方式: 文本测试确认 `opsx-tasks` 仍保留测试不是独立 task、TDD 标签选择、bite-sized 规则；`opsx-tdd` 仍保留红绿重构铁律和 `[manual]` 处理；完整模板迁入 references。
- 知识沉淀: 模板可按需读取，但核心行为选择规则必须留在入口，避免 implement 阶段误判任务类型。

### [U3] Implement/Archive worker 与 route 规则瘦身
- 关联需求: [R4], [R7], [R8], [R9]
- 模块边界:
  - `skills/opsx-implement/SKILL.md`
  - `skills/opsx-implement/references/*.md`
  - `skills/opsx-archive/SKILL.md`
  - `skills/opsx-archive/references/*.md`
- 验证方式: 文本测试确认 serial-by-default、disjoint write sets、共享 artifact 主 agent 串行写入、tasks/test-report 勾选证据、verify/review gate 前置、grouped subchange 顶层 archive 路径和父 group route 更新规则仍在入口。
- 知识沉淀: worker prompt 正文迁入 references；共享 artifact ownership 和 grouped archive 路由规则必须直接可见。

### [U4] 检查、库存和回归测试
- 关联需求: [R3], [R4], [R10], [R11], [R12]
- 模块边界:
  - `tests/skill-slimming.test.mjs`
  - `tests/workflow-discipline.test.mjs`
  - `scripts/check-skill-slimming.mjs`
  - `docs/skill-slimming-inventory.md`
- 验证方式: `npm test`；`node scripts/check-skill-slimming.mjs --json`；必要时 `rg` 检查 StageResult schema、subagent platform mapping、lite-run 英文字段和 oversized 入口。
- 知识沉淀: 检查应锁定公共契约不回流到入口文件，而不是锁死每个 reference 的长正文。

## 迁移策略

1. 保留入口中的硬规则：gate prerequisites、read/write boundary、decision model、failure route、next stage、main-agent ownership。
2. 将长正文按主题迁入 references：`reviewer-prompt.md`、`review-dimensions.md`、`templates.md`、`worker-contract.md`、`archive-routing.md`、`report-template.md`。
3. 对公共契约只引用 canonical source：`docs/stage-packet-protocol.md`、`skills/opsx-subagent/SKILL.md`、`.aiknowledge/README.md`。
4. 对 tests 采用行为级断言：入口必须包含关键硬词、reference 文件必须存在、重复契约检查必须通过。
5. 迁移完成后更新库存文档，记录 03 后的新总行数、剩余 oversized 和 duplicate candidates。

## 风险 / 权衡

- [风险] 过度瘦身导致 gate 执行时缺少关键前置条件 -> [缓解] gate、失败路由、写入责任和下一阶段路由留在入口并由测试锁定。
- [风险] reviewer prompt 迁出后 subagent 输入不完整 -> [缓解] 入口导航写清何时读取 prompt/reference，tasks 中要求迁移后跑 workflow discipline tests。
- [风险] StageResult 检查误报 references 中的合法示例 -> [缓解] duplicate 检查目标是非 canonical `SKILL.md` 入口，不禁止 references 持有 stage-specific prompt。
- [风险] archive route 规则被压缩后语义丢失 -> [缓解] grouped archive 路径和父 group route 更新规则必须留在入口并由现有 archive tests 覆盖。

## Open Questions

- 是否将 `opsx-plan-review` / `opsx-task-analyze` 的详细 reviewer prompt 放入同 skill references，还是统一放入 `docs/stage-packet-protocol.md`？当前判断：stage-specific prompt 放同 skill references，公共 schema 留在 `docs/stage-packet-protocol.md`。
