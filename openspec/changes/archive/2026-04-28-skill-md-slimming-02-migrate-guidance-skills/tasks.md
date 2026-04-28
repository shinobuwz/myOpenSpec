# Tasks

## Task 1：瘦身 `opsx-explore` 入口

**需求追踪**：[R1], [R2], [R4], [R5] → [U1]
**执行方式**：[characterization-first]
**涉及文件**：
- `skills/opsx-explore/SKILL.md` — 入口文案
- `skills/opsx-explore/references/*.md` — 迁出的详细流程、示例和 codemap 细节
- `tests/skill-slimming.test.mjs` 或 `tests/workflow-discipline.test.mjs` — 文案回归测试

**验收标准**：
- [x] `opsx-explore/SKILL.md` 直接保留只读边界、禁止写产品代码、OpenSpec 转入规则、codemap-first 规则、主 agent controller 规则。
- [x] 长切入点说明、方案收敛流程、输出示例和 codemap 目录细节迁入 `references/`。
- [x] 入口文件提供 reference 导航，并说明何时读取每个 reference。
- [x] 对应测试或检查能验证入口仍引用 `opsx-subagent`、保留硬边界，并存在 reference 文件。

**验证命令 / 方法**：
- `node --test tests/skill-slimming.test.mjs tests/workflow-discipline.test.mjs`，预期：通过
- `wc -l skills/opsx-explore/SKILL.md`，预期：显著低于迁移前 432 行

**依赖**：无

## Task 2：瘦身 `opsx-knowledge`

**需求追踪**：[R1], [R2], [R4], [R5] → [U2]
**执行方式**：[characterization-first]
**涉及文件**：
- `skills/opsx-knowledge/SKILL.md` — 入口文案
- `skills/opsx-knowledge/references/*.md` — 迁出的 lifecycle 步骤、模板、领域表和一致性检查
- `tests/skill-slimming.test.mjs` 或 `tests/workflow-discipline.test.mjs` — 文案回归测试

**验收标准**：
- [x] `opsx-knowledge/SKILL.md` 直接保留写入前读取 `.aiknowledge/README.md`、source_refs、index 更新、月度日志追加和 tombstone 规则摘要。
- [x] 目录结构、领域表、条目模板、更新/合并/替代/废弃步骤和一致性检查迁入 `references/`。
- [x] 入口文件导航到 references，且不复制 `.aiknowledge` lifecycle 的完整正文。

**验证命令 / 方法**：
- `node --test tests/skill-slimming.test.mjs tests/workflow-discipline.test.mjs`，预期：通过
- `node scripts/check-skill-slimming.mjs --json`，预期：不出现 `aiknowledge-lifecycle` duplicate

**依赖**：Task 1

## Task 3：瘦身 `opsx-codemap`

**需求追踪**：[R1], [R2], [R4], [R5] → [U2]
**执行方式**：[characterization-first]
**涉及文件**：
- `skills/opsx-codemap/SKILL.md` — 入口文案
- `skills/opsx-codemap/references/*.md` — 迁出的模板、场景步骤、stale 判定和写入规则
- `tests/skill-slimming.test.mjs` 或 `tests/workflow-discipline.test.mjs` — 文案回归测试

**验收标准**：
- [x] `opsx-codemap/SKILL.md` 直接保留 codemap-only 写入边界、写入前读取 `.aiknowledge/README.md`、index-first、月度日志追加和 freshness 规则摘要。
- [x] codemap index/module/chain 模板、入口初始化、出口更新、stale 判定细节迁入 `references/`。
- [x] 入口文件导航到 references，且不复制 `.aiknowledge` lifecycle 的完整正文。

**验证命令 / 方法**：
- `node --test tests/skill-slimming.test.mjs tests/workflow-discipline.test.mjs`，预期：通过
- `node scripts/check-skill-slimming.mjs --json`，预期：`opsx-codemap` 行数显著下降

**依赖**：Task 2

## Task 4：瘦身 `opsx-lite` 与 `opsx-slice`

**需求追踪**：[R3], [R4], [R5] → [U3]
**执行方式**：[characterization-first]
**涉及文件**：
- `skills/opsx-lite/SKILL.md` — 入口文案
- `skills/opsx-lite/references/*.md` — lite-run 模板和详细流程
- `skills/opsx-slice/SKILL.md` — 入口文案
- `skills/opsx-slice/references/*.md` — 输出格式和 proposal 模板
- `tests/skill-slimming.test.mjs` 或 `tests/workflow-discipline.test.mjs` — 文案回归测试

**验收标准**：
- [x] `opsx-lite/SKILL.md` 保留 lite 判定、升级条件、fresh evidence、中文 lite-run 字段和知识沉淀规则。
- [x] `opsx-slice/SKILL.md` 保留 cohesion 判定、group/subchange 落地规则和执行拓扑规则。
- [x] lite-run 模板、slice 输出模板和 proposal 模板迁入 references，并被入口导航。
- [x] 保留已有中文模板修正，不回退其它流程已做的改动。

**验证命令 / 方法**：
- `node --test tests/skill-slimming.test.mjs tests/workflow-discipline.test.mjs`，预期：通过
- `rg -n '^## Intent|^- Intent$' skills/opsx-lite .aiknowledge/lite-runs/README.md`，预期：无英文 lite-run 模板字段回流

**依赖**：Task 3

## Task 5：瘦身 `opsx-auto-drive` 与 `opsx-bugfix`

**需求追踪**：[R3], [R4], [R5] → [U3]
**执行方式**：[characterization-first]
**涉及文件**：
- `skills/opsx-auto-drive/SKILL.md` — 入口文案
- `skills/opsx-auto-drive/references/*.md` — 迭代记录模板、引擎循环和恢复细节
- `skills/opsx-bugfix/SKILL.md` — 入口文案
- `skills/opsx-bugfix/references/*.md` — 详细步骤和知识沉淀细节
- `tests/skill-slimming.test.mjs` 或 `tests/workflow-discipline.test.mjs` — 文案回归测试

**验收标准**：
- [x] `opsx-auto-drive/SKILL.md` 保留目标/指标输入、门控、停止条件和 summary 输出契约。
- [x] `opsx-bugfix/SKILL.md` 保留适用条件、根因铁律、连续失败停止规则和知识沉淀入口。
- [x] 详细循环、记录模板、恢复步骤和长流程迁入 references，并被入口导航。

**验证命令 / 方法**：
- `node --test tests/skill-slimming.test.mjs tests/workflow-discipline.test.mjs`，预期：通过
- `node scripts/check-skill-slimming.mjs --json`，预期：不新增 duplicate candidates

**依赖**：Task 4

## Task 6：更新瘦身库存和验证留档

**需求追踪**：[R6] → [U4]
**执行方式**：[direct]
**涉及文件**：
- `docs/skill-slimming-inventory.md` — 更新迁移后行数和备注
- `openspec/changes/2026-04-28-skill-md-slimming/subchanges/02-migrate-guidance-skills/test-report.md` — 记录验证证据
- `openspec/changes/2026-04-28-skill-md-slimming/subchanges/02-migrate-guidance-skills/tasks.md` — 勾选任务和验收标准

**验收标准**：
- [x] 库存文档反映本 subchange 后 guidance skills 的最新行数和迁移状态。
- [x] `node scripts/check-skill-slimming.mjs --json` 输出不新增 canonical contract duplicate。
- [x] `npm test` 通过，并在 `test-report.md` 记录 red/green/refactor 或 direct 验证证据。
- [x] 所有完成任务和验收标准被勾选。

**验证命令 / 方法**：
- `node scripts/check-skill-slimming.mjs --json`，预期：通过并输出最新 inventory
- `npm test`，预期：通过

**依赖**：Task 5
