## 上下文

OPSX 已经有多个 skill 使用 subagent：`opsx-implement` 派 implementation worker，`opsx-plan-review` / `opsx-task-analyze` / `opsx-verify` 派 reviewer，`opsx-review` 做代码质量 / 发布风险审查，`opsx-explore` 在大范围搜索时建议使用探索型 subagent。当前这些说明分散在各 skill 中，且部分文字仍以 Claude Code 的 `Task` / `subagent_type` 语义为中心。

近期已在 `docs/supported-tools.md` 中补充 Codex-first / Claude-compatible 映射，但这只是文档层说明。下一步需要把 subagent 编排规则提升为 canonical OPSX contract，使后续 workflow skill 可以引用同一套角色、边界和结果处理语义。

## 目标 / 非目标

**目标：**
- 新增或等价建立 canonical `opsx-subagent` contract。
- 明确 Codex 是默认执行模型，Claude Code 是兼容映射。
- 明确 main agent / subagent 权责边界和共享 artifact 写入边界。
- 明确 prompt/message framing、implementation status、reviewer StageResult 边界和 fallback。
- 用测试和 codemap 锁定长期约束。

**非目标：**
- 不迁移全部现有 workflow skill 到新 contract（后续 subchange 负责）。
- 不改变 `opsx-implement` 的执行策略或并行度。
- 不新增 CLI dispatcher 或 runtime agent registry。
- 不改变 StageResult、audit-log、review-report 或 `.openspec.yaml` gate schema。

## 需求追踪

- [R1] -> [U1]
- [R2] -> [U1] [U2] [U3]
- [R3] -> [U1] [U2]
- [R4] -> [U1] [U3]
- [R5] -> [U1] [U3]
- [R6] -> [U2] [U4] [U5]

## 实施单元

### [U1] 新增 canonical subagent contract skill
- 关联需求: [R1] [R2] [R3] [R4] [R5]
- 模块边界: `skills/opsx-subagent/SKILL.md`
- 验证方式: 文档检查确认 skill 包含 Codex 默认映射、Claude Code 兼容映射、controller 权限、写入边界、status 处理和 fallback 章节。
- 知识沉淀: subagent 编排规则应集中在 contract skill，而不是分散复制到每个 workflow skill。

### [U2] 更新支持工具文档
- 关联需求: [R2] [R3] [R6]
- 模块边界: `docs/supported-tools.md`
- 验证方式: 测试确认 Codex 默认入口、Claude Code 兼容入口和 subagent 映射表存在；skill 清单与 `skills/opsx-*` 目录一致。
- 知识沉淀: 平台适配是 contract 的公开入口，不能只藏在单个 skill 内。

### [U3] 增加 prompt/status contract 细节
- 关联需求: [R2] [R4] [R5]
- 模块边界: `skills/opsx-subagent/SKILL.md`
- 验证方式: 文档检查确认 implementation status 至少包含 `DONE`、`DONE_WITH_CONCERNS`、`NEEDS_CONTEXT`、`BLOCKED`，reviewer 输出仍指向 StageResult / review-report 证据，且 subagent 不可用时有串行降级策略。
- 知识沉淀: Superpowers 的 status 语义可以吸收，但必须落到 OPSX gate 和 StageResult 体系中。

### [U4] 增加回归测试
- 关联需求: [R6]
- 模块边界: `tests/workflow-discipline.test.mjs`
- 验证方式: `npm test`；测试应覆盖 `opsx-subagent` 存在、Codex-first 映射存在、Claude-only subagent wording 不可单独出现、supported-tools skill 清单真实。
- 知识沉淀: 文案型 workflow 规则需要测试锁定，否则后续 skill 演化容易漂移。

### [U5] 更新架构知识
- 关联需求: [R6]
- 模块边界: `.aiknowledge/codemap/index.md`, `.aiknowledge/codemap/openspec-skills.md`, `.aiknowledge/logs/2026-04.md`
- 验证方式: 检查 codemap 将 `opsx-subagent` 纳入 skill 清单和隐式约束；月度日志追加本次知识更新。
- 知识沉淀: 后续 agent 通常先读 codemap，必须能从知识地图发现 subagent contract。

## 决策

- **新增 `opsx-subagent` skill，而不是只写 docs**：skill 是 OPSX workflow 的可执行说明来源，后续 `opsx-implement` / `opsx-verify` / `opsx-review` / `opsx-explore` 能直接引用它。
- **Codex-first，Claude-compatible**：当前项目执行环境默认 Codex；Claude Code 仍通过 `Task` tool 等价执行，不维护第二套 prompt 产物。
- **不引入 named agent registry**：Codex 没有 Claude 风格 named agent registry；contract 只规定如何把 prompt 模板和上下文填入 `message`。
- **主 agent 是唯一 controller**：subagent 不能写 gates 或最终完成声明，避免局部成功覆盖 OPSX gate。
- **Reviewer 结果不脱离 StageResult**：plan-review/task-analyze/verify 仍使用 StageResult JSON；review 仍写 `review-report.md`，不引入 Superpowers 的自由文本审查结论作为 gate source。

## 风险 / 权衡

- 新增 skill 会增加一个 workflow 概念；通过让它只承担 subagent contract，避免变成第二套执行流程。
- 过早抽象可能让现有 skill 还没迁移就出现双重说明；本 subchange 只建立 contract，迁移放到后续 subchange。
- Codex/Claude tool 名称未来可能变化；通过 docs 和 tests 集中维护，降低分散修改成本。
- Fallback 允许主 agent 串行执行，但必须保留质量提示，避免无 subagent 环境悄悄降低审查强度。

## 知识沉淀

- 更新 `.aiknowledge/codemap/openspec-skills.md`：增加 `opsx-subagent` skill，记录 Codex-first subagent contract。
- 如实现中发现 Claude-only 文案回流问题，可新增 pitfall；本 subchange 先通过测试约束处理。
