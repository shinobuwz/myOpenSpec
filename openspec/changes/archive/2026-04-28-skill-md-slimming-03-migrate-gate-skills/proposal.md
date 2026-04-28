# 目标

按 `01-slimming-structure` 与 `02-migrate-guidance-skills` 的规则，瘦身 gate、reviewer、implementation、reporting 类 OPSX skills：把重复 prompt 模板、StageResult 细节、audit/report 模板和长规则表迁入 `references/` 或 canonical docs，同时保持每个 stage 的硬门控和退出契约可直接在入口文件中看到。

# 范围内

- 迁移 gate/reviewer-heavy skills：
  - `skills/opsx-plan-review/SKILL.md`
  - `skills/opsx-task-analyze/SKILL.md`
  - `skills/opsx-verify/SKILL.md`
  - `skills/opsx-review/SKILL.md`
- 迁移带有长模板或嵌入契约的执行支撑 skills：
  - `skills/opsx-tasks/SKILL.md`
  - `skills/opsx-tdd/SKILL.md`
  - `skills/opsx-implement/SKILL.md`
  - `skills/opsx-archive/SKILL.md`
  - `skills/opsx-report/SKILL.md`
- 将 reviewer prompt、审查维度细节、StageResult 示例、audit-log 片段、任务模板、test-report 格式、RunReport 模板和长风险表迁入同 skill `references/` 或 `docs/stage-packet-protocol.md`。
- 将重复的跨平台 subagent 文案替换为对 `skills/opsx-subagent/SKILL.md` 的引用。
- 将重复的 StageResult / audit-log schema 正文替换为对 `docs/stage-packet-protocol.md` 的引用。
- 保留各 `SKILL.md` 中必须立即可见的 stage-specific 硬规则：前置 gates、读写边界、决策规则、失败路由、完成条件和退出契约。
- 更新验证检查，防止重新引入完整 StageResult schema、平台映射正文或 oversized gate skill 入口。

# 范围外

- 不改变 gate pass/fail 语义。
- 不改变 `.openspec.yaml` schema 或 gate 字段名。
- 不改变 StageResult schema。
- 不新增 workflow stage。
- 不改变 verify/review 职责边界。
- 不安装、发布或同步迁移后的 skills。

# 依赖

- `01-slimming-structure`
- `02-migrate-guidance-skills`
- `docs/stage-packet-protocol.md`
- `skills/opsx-subagent/SKILL.md`
- `docs/skill-slimming-policy.md`
- `docs/skill-slimming-inventory.md`

# 完成定义

- Gate/reviewer skill 入口文件仍可执行，但不再嵌入完整 prompt/schema/template 正文。
- Stage-specific 审查维度、硬 gates、读写边界和退出契约仍直接保留在 `SKILL.md`。
- 共享契约通过 canonical source 引用消费，而不是重复复制。
- 检查能发现重复 StageResult schema、重复平台映射正文和 oversized gate skill 入口。
- OPSX gate 顺序保持不变：`plan-review -> tasks -> task-analyze -> implement -> verify -> review -> archive`。
