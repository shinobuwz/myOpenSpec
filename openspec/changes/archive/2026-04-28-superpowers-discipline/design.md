## 上下文

Superpowers workflow 中可吸纳的重点不是完整流程，而是若干纪律机制：root cause before fix、evidence before claims、bite-sized plans、review feedback verification、review responsibility separation。OPSX 已有正式 change gates、`opsx-lite` 旁路、`.aiknowledge` 知识沉淀，因此应把这些机制嵌入现有 skill，而不是新增一套平行 workflow。

## 目标 / 非目标

**目标：**
- 让 bugfix 在修复前先证明根因。
- 让 verify/lite 的完成声明必须绑定 fresh evidence。
- 让 tasks 生成更适合 agent 执行，减少含糊任务。
- 让 verify/review 职责更清晰：verify 查是否满足需求，review 查代码质量和发布风险。
- 让 skill metadata 避免 description 泄漏流程摘要。

**非目标：**
- 不把 Superpowers 的 “任何改动都必须完整 brainstorming” 搬进 OPSX。
- 不要求每个 task 都派 subagent。
- 不在本 change 中实现新的 agent dispatcher。
- 不调整 npm launcher/runtime。

## 需求追踪

- [R1] -> [U1]
- [R2] -> [U2]
- [R3] -> [U3]
- [R4] -> [U4]
- [R5] -> [U5]

## 实施单元

### [U1] Bugfix root-cause gate
- 关联需求: [R1]
- 模块边界: `skills/opsx-bugfix/SKILL.md`
- 验证方式: 文档检查确认包含 root cause investigation、single hypothesis、minimal test、3+ failed fixes escalation。
- 知识沉淀: bugfix 不能用猜修替代根因定位。

### [U2] Fresh evidence completion gate
- 关联需求: [R2]
- 模块边界: `skills/opsx-verify/SKILL.md`, `skills/opsx-lite/SKILL.md`
- 验证方式: 文档检查确认完成声明、验证报告、lite-run 都要求记录本轮实际执行命令和结果。
- 知识沉淀: 没有 fresh verification evidence 时不能宣称完成。

### [U3] Bite-sized task planning
- 关联需求: [R3]
- 模块边界: `skills/opsx-tasks/SKILL.md`
- 验证方式: 文档检查确认 tasks 需无占位符、单动作、包含验证命令或验证方法、禁止 “处理边界情况” 类空泛验收。
- 知识沉淀: tasks 是给 agent 执行的最小操作单元，不是意图清单。

### [U4] Verify/review responsibility split
- 关联需求: [R4]
- 模块边界: `skills/opsx-verify/SKILL.md`, `skills/opsx-review/SKILL.md`
- 验证方式: 文档检查确认 verify 明确执行 Spec Compliance Review；review 聚焦 code quality / release risk，并在发现 compliance drift 时回退 verify。
- 知识沉淀: 需求符合性属于 verify gate，代码质量和发布风险属于 review gate。

### [U5] Skill metadata discipline
- 关联需求: [R5]
- 模块边界: `skills/opsx-*.md`, `.aiknowledge/codemap/openspec-skills.md`
- 验证方式: 抽查本次触达 skill 的 description 只描述触发条件，不承载流程摘要；codemap 更新 source_refs。
- 知识沉淀: description 是触发索引，不是流程压缩包。

## 决策

- **不新增 workflow skill**：这些规则是横切纪律，应嵌入现有节点。
- **subagent 做法吸收为职责边界**：当前 `opsx-verify` / `opsx-review` 已有 subagent 入口，本 change 强化各自 prompt 和输出语义，不增加新的自动并行实现系统。
- **正式 change 继续走 existing gates**：本 change 不改变 `.openspec.yaml` gates schema，只强化 skill 文档约束。
- **轻量路径保留**：`opsx-lite` 只吸收 evidence gate，不被强制升级成正式 OpenSpec change。

## 风险 / 权衡

- 规则过强会让小修变慢；通过只在 `opsx-lite` 中要求最小验证证据缓解。
- verify/review 边界调整可能让 review 少报需求类问题；通过 `VERIFY_DRIFT` 兜底，发现明显需求遗漏时回退 verify。
- skill description 缩短后可能降低召回；通过正文保留详细流程、description 保留触发关键词缓解。

## 知识沉淀

- 更新 `.aiknowledge/codemap/openspec-skills.md` 的 verified date 和 source_refs。
- 如实现过程中发现 skill description 触发问题，可新增 pitfall。
