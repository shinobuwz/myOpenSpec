---
status: active
created_at: 2026-04-13
created_from: metadata-backfill
last_verified_at: 2026-04-28
last_verified_by: opsx-archive
verification_basis: changes-status-detail + thin-npm-opsx archive + aiknowledge-lifecycle change + opsx-lite-workflow archive + superpowers-discipline archive + subagent-workflow-adapter archive + subagent-smoke-eval archive + workflow-skill-adoption archive + parallel-worker-policy archive + skill-md-slimming archive + guidance-skill-slimming archive + gate-workflow-skill-slimming archive + subagent-dispatch-model-policy archive + subagent-roster-lifecycle-policy archive
applies_to:
  - skills
  - skills/opsx-*/references
  - bin/opsx.mjs
  - runtime/bin/changes.sh
  - runtime/schemas
  - scripts/check-skill-slimming.mjs
  - scripts/eval-subagent-smoke.mjs
  - scripts/lib/subagent-trace-parser.mjs
  - evals/subagent-smoke
  - tests/skill-slimming.test.mjs
  - tests/subagent-trace-parser.test.mjs
  - docs/skill-slimming-policy.md
  - docs/skill-slimming-inventory.md
  - docs
  - .aiknowledge
source_refs:
  - change:2026-04-27-aiknowledge-lifecycle
  - change:2026-04-27-opsx-lite-workflow
  - change:2026-04-28-superpowers-discipline
  - lite-run:2026-04-28-codex-subagent-docs
  - change:2026-04-28-subagent-workflow-adapter/01-subagent-contract
  - change:2026-04-28-subagent-workflow-adapter/02-workflow-skill-adoption
  - change:2026-04-28-subagent-workflow-adapter/03-parallel-worker-policy
  - change:2026-04-28-subagent-workflow-adapter/04-subagent-smoke-eval
  - change:2026-04-28-skill-md-slimming/01-slimming-structure
  - change:2026-04-28-skill-md-slimming/02-migrate-guidance-skills
  - change:2026-04-28-skill-md-slimming/03-migrate-gate-skills
  - change:2026-04-28-subagent-dispatch-model-policy
  - change:2026-04-28-subagent-roster-lifecycle-policy
  - review-report:openspec/changes/archive/2026-04-28-subagent-workflow-adapter-02-workflow-skill-adoption/review-report.md
  - review-report:openspec/changes/archive/2026-04-28-subagent-workflow-adapter-03-parallel-worker-policy/review-report.md
  - review-report:openspec/changes/archive/2026-04-28-skill-md-slimming-01-slimming-structure/review-report.md
  - review-report:openspec/changes/archive/2026-04-28-skill-md-slimming-02-migrate-guidance-skills/review-report.md
  - review-report:openspec/changes/archive/2026-04-28-skill-md-slimming-03-migrate-gate-skills/review-report.md
  - review-report:openspec/changes/archive/2026-04-28-subagent-dispatch-model-policy/review-report.md
  - review-report:openspec/changes/archive/2026-04-28-subagent-roster-lifecycle-policy/review-report.md
superseded_by:
---

# openspec-skills

## 职责
OpenSpec 工作流的单一真相源。所有 skill 以 Markdown 文件存放于 `skills/<name>/SKILL.md`，由 `opsx install-skills` 分发到全局 `~/.agents/skills`，必要时由 `scripts/sync.sh` 分发为项目 adapter `.claude/skills/<name>/SKILL.md`。通用 change runtime 位于 `runtime/bin/changes.sh`，其中 `list` 是紧凑清单，`status` 是项目级诊断视图。Skill 入口瘦身政策位于 `docs/skill-slimming-policy.md`，当前库存位于 `docs/skill-slimming-inventory.md`，检查脚本为 `scripts/check-skill-slimming.mjs`；03 归档后 checker 输出为 `totalLines=1388`、`oversized=0`、`duplicates=0`。全部主要 OPSX workflow skills 已采用薄入口 + 同 skill `references/` 的渐进披露结构，包括 guidance、gate/reviewer、execution-support、implement 和 archive。可选模型 eval 位于 `scripts/eval-subagent-smoke.mjs` 与 `evals/subagent-smoke/`，用于手动验证 Codex subagent runtime trace，不参与默认 `npm test`。长期知识维护规则位于 `.aiknowledge/README.md`，审计入口索引为 `.aiknowledge/log.md`，月度日志位于 `.aiknowledge/logs/YYYY-MM.md`，`opsx-knowledge` 与 `opsx-codemap` 必须共享同一套 lifecycle 语义。

## Skill 清单（19 个）

| Skill | 角色 | 前置关卡 |
|-------|------|----------|
| `opsx-explore` | 思考伙伴，探索想法/调查问题/澄清需求，收敛阶段一次一问、方案对比、逐段确认，禁止写代码 | 无 |
| `opsx-slice` | 创建父 change + subchanges，初始化每个 subchange 的 proposal，并定义执行拓扑（execution_mode / recommended_order / 可选 suggested_focus） | 无 |
| `opsx-plan` | 为当前 resolved change root 生成/修订 specs + design，必要时小修 proposal | 无 |
| `opsx-continue` | 恢复中断的当前 change；group 场景下先按 active_subchange，否则按 suggested_focus / recommended_order / 唯一 subchange 路由 | 无 |
| `opsx-lite` | 轻量小改动工作流，不创建正式 change，记录 lite-run 事实留档；范围扩大时升级到 slice→plan | 无 |
| `opsx-subagent` | Codex 默认、Claude 兼容的 subagent 派发契约；统一 worker/reviewer/explorer 的角色边界、dispatch class、默认模型推荐、roster lifecycle、写入边界、status 和 fallback 规则 | 无 |
| `opsx-plan-review` | spec↔plan 一致性审查（关卡1），硬性门控；通过 `opsx-subagent` reviewer contract 派遣 1 个只读 reviewer，输出 StageResult JSON，写 audit-log.md | design 已生成 |
| `opsx-tasks` | 将 design+specs 转化为带 TDD 标签、bite-sized、可执行验证方法的 tasks.md | `gates.plan-review` |
| `opsx-task-analyze` | plan↔tasks 一致性审查（关卡2），硬性门控；通过 `opsx-subagent` reviewer contract 执行只读审查 | tasks 已生成 + plan-review 已通过 |
| `opsx-tdd` | 红绿重构循环，按 task 标签执行（test-first/characterization-first/direct） | 无（被 implement 调用） |
| `opsx-implement` | 按 tasks.md 逐项实施，每项强制 TDD 循环；通过 `opsx-subagent` implementation worker contract 默认串行，只有 explicit disjoint parallel eligibility 成立时才允许多 worker，主 agent 串行整合 | `gates.plan-review` + `gates.task-analyze` |
| `opsx-verify` | Spec compliance + 四维验证（完整性/正确性/一致性/测试留档），要求 fresh evidence 支撑完成声明，通过 `opsx-subagent` reviewer contract 派遣 1 个只读 reviewer 输出 StageResult JSON | 实施完成 |
| `opsx-review` | 独立代码审查，聚焦 code quality / release risk；通过 `opsx-subagent` reviewer contract 审查，发现 compliance drift 时路由回 verify | `gates.verify` 已通过 |
| `opsx-report` | 读取 `audit-log.md`、`test-report.md`、`review-report.md` 及产出物文件，渲染 self-contained HTML RunReport | 无（按需触发） |
| `opsx-archive` | 归档变更 + knowledge + codemap + git；归档后的 knowledge/codemap worker 通过 `opsx-subagent` contract 限定写入边界 | `gates.verify` + `gates.review` |
| `opsx-bugfix` | 精简 bugfix 流程：定位→根因调查→单一假设→测试策略→修复→验证→经验沉淀 | 无 |
| `opsx-codemap` | 维护 `.aiknowledge/codemap/` 架构认知地图 | 无（独立工具） |
| `opsx-knowledge` | 经验沉淀到 `.aiknowledge/pitfalls/` | 无（独立工具） |
| `opsx-auto-drive` | 自动驱动引擎，AI 自主执行完整工作流循环 | 无（编排层） |

## 工作流拓扑

```
explore ─── 需求澄清 ───┐
                         ▼
slice ──── 父 change / subchanges / active_subchange ───┤
                         ▼
plan ───────────────────→ proposal → specs → design
                                          │
                   continue ──────────────┘  (恢复到当前合法节点)
                                          │
                      plan-review ◄───────┘  (关卡1: spec↔plan)
                           │
                           ▼
                        tasks ──→ tasks.md
                           │
                      task-analyze ◄──────── (关卡2: plan↔tasks)
                           │
                           ▼
                        implement ─────────→ 代码变更
                           │
                           └─── tdd (红绿重构循环)
                           ▼
                         verify ─────────── (关卡3: tasks↔code)
                           │
                         review ─────────── (代码审查)
                           │
                         archive ──→ 归档 + knowledge + codemap + git
```

**旁路流程**：
- `bugfix`：跳过规划，直接 定位→修复→验证→经验沉淀
- `codemap` / `knowledge`：独立维护工具，不参与主流程
- `auto-drive`：编排层，自主驱动上述完整循环

## 隐式约束
- Skills 被 git 追踪在仓库根目录 `skills/`（`.gitignore` 精确忽略 `settings.local.json` 等敏感文件）
- 关卡结果写入 `.openspec.yaml` 的 `gates.*` 字段，下游 skill 读取该字段做准入校验
- 所有 skill 按需读取 `.aiknowledge/`（index-first 策略，禁止全量扫描）
- Skill 文件变更后需运行 `opsx install-skills` 更新全局 skills；只有工具不支持全局 skills 时才运行 `scripts/sync.sh` 同步到目标仓库
- 通用 runtime 归属于 npm 包入口 `bin/opsx.mjs`、`runtime/bin/changes.sh` 与 `runtime/schemas`，不再复制到目标项目 `.claude/opsx`
- `opsx changes list` 与 `opsx changes status` 语义必须分离：`list` 只列 active changes，`status` 读取 gates/reports/tasks 并给出 next-step 诊断
- `opsx-plan-review`、`opsx-task-analyze`、`opsx-verify` 遵循 Stage Packet Protocol v2：派遣 subagent 直接读取权威产物文件 → 输出 StageResult JSON → 主 agent 追加写 `audit-log.md`；无 context/ JSON 文件，无 StagePacket 组装步骤
- subagent 文案以 `opsx-subagent` 为 canonical contract：Codex 默认使用 `spawn_agent`，Claude Code 兼容映射为 `Task` tool；主 agent 保留 controller 权限，subagent 不写 gates 或最终完成声明。
- `opsx-subagent` 按 dispatch class 维护默认模型推荐：简单检索走 `retrieval-explorer`，明确实现走 `implementation-worker`，gate/release 审查走 `gate-reviewer`，归档后知识维护走 `maintenance-worker`，长上下文审计走 `long-running-auditor`；具体 prompt 仍由触发的 workflow skill 注入。
- `opsx-subagent` 的 Agent Roster 是主 agent 运行态责任；Codex 没有 skill 可调用的 list-all subagents API，roster 只能来自 `spawn_agent`、`wait_agent`、notification 和 `close_agent`。运行态 JSON 位于 `.opsx/subagents/*.json` 且不作为 gate 依据，change 级摘要位于 `subagent-roster.md`。
- 会派发 subagent 的 workflow skills（implement、plan-review、task-analyze、verify、review、explore、archive follow-up）必须显式引用 `opsx-subagent`，只保留自身 stage 的输入、输出、gate 和产物规则；禁止在各 skill 中维护另一套 Claude-only 或平台分叉的派发说明。
- `opsx-implement` 的 implementation workers 是 serial-by-default / 默认串行；只有任务簇独立、disjoint write sets、明确 file ownership 且不并发修改 public interface、migration、schema、config、package/build scripts 时，主 agent 才能派发多个 workers。共享 artifact（`tasks.md`、`test-report.md`、`.openspec.yaml`、`audit-log.md`、`review-report.md`）始终由主 agent 串行写入。
- `skills/*/SKILL.md` 应保持薄入口，只保留触发条件、执行入口、gate 和关键安全约束；长流程、模板、示例和可复用公共契约迁入 `references/` 或 canonical skill/doc，通过渐进披露按需读取。
- guidance-heavy skills 已迁移：`opsx-explore/references/` 承载探索 workflow、对话模式和 codemap-first 细节；`opsx-knowledge/references/` 与 `opsx-codemap/references/` 承载 `.aiknowledge` lifecycle 流程和模板；`opsx-lite`、`opsx-slice`、`opsx-auto-drive`、`opsx-bugfix` 的长模板和详细流程也在各自 `references/`。
- gate/reviewer 和执行支撑 skills 已迁移：`opsx-plan-review`、`opsx-task-analyze`、`opsx-verify`、`opsx-review`、`opsx-tasks`、`opsx-tdd`、`opsx-report`、`opsx-implement`、`opsx-archive` 的长 prompt、审查维度、模板、risk taxonomy、worker contract 和 archive routing 均位于各自 `references/` 或 canonical docs。
- `scripts/check-skill-slimming.mjs` 是 skill 瘦身的仓库级静态检查入口，用于报告 oversized `SKILL.md` 和重复公共契约候选；`docs/skill-slimming-inventory.md` 必须与脚本输出一致，03 后 oversized 与 duplicate candidates 均为 0。
- `opsx-verify` 拥有 Spec Compliance Review；`opsx-review` 不重复完整 compliance，只审查 code quality / release risk，发现明显需求遗漏或范围外实现时输出 `VERIFY_DRIFT` 并路由回 verify。
- `opsx-bugfix` 在修复前必须说明 root cause 与证据；同一问题连续 3 次修复失败时停止叠加补丁并重新审视假设或架构。
- `opsx-verify` 与 `opsx-lite` 的完成声明必须基于当前轮 fresh verification evidence；未验证只能说明待验证，不能宣称通过。
- `opsx-report` 从 `audit-log.md`（plan-review/verify）、`test-report.md`（tdd）、`review-report.md`（review）读取各 stage 决定，结合 `.openspec.yaml` gates 字段渲染 HTML；不读取 `run-report-data.json`
- `opsx-knowledge` 和 `opsx-codemap` 在写入 `.aiknowledge/` 前必须读取 `.aiknowledge/README.md`；新增、更新、合并、废弃或 lint 修复后必须追加当前月度日志 `.aiknowledge/logs/YYYY-MM.md`
- OpenSpec change、commit、audit-log、test-report 和 review-report 是默认事实来源；`codemap/` 与 `pitfalls/` 是 LLM 维护层，可以演化但必须保留 `source_refs`
- 合并或替代正式知识条目时，默认保留 `superseded` tombstone；只有未索引、未引用、从未正式消费的孤儿文件才允许删除
