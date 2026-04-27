## 为什么

`2026-04-09-add-gate-review-facts-bundle` 引入了 gate review facts bundle，但它只在 `plan-review` 和 `verify` 有弱消费，其余环节仍然各读各的。当前问题：

1. **无统一输入协议** — `plan-review`、`verify` 的 facts bundle 是隐式契约，没有 schema 约束，字段靠 SKILL.md 文档描述。
2. **无统一输出协议** — 各 reviewer subagent 输出格式各异，主 agent 汇总靠自由文本解析。
3. **无人类消费面** — 审查结果散落在对话上下文里，无法跨会话追踪。

需要把 facts bundle 从"零散概念"升级为 **OPSX Stage Packet Protocol**：一层阶段化协议，统一 subagent 的输入（StagePacket）和输出（StageResult），并提供 HTML 展示面（RunReport）。

## 变更内容

- 定义 `StagePacket` 基础 schema：版本号、run_id、change_id、stage、budget 元数据、source_refs、knowledge_refs、core_payload / optional_refs 分层。
- 定义 `StageResult` 基础 schema：agent_role、summary、decision、metrics、findings、evidence_refs、next_actions。
- 在 `StagePacket` 中内置 Packet Budget 约束（soft 2K / hard 4K tokens），超限时按固定降维顺序截断。
- 在 `StagePacket` 中内置 Lazy Hydration Contract：subagent 只能读取 packet 中列出的 source_refs，不允许无边界全局扫描。
- 基于上述 schema，派生 `PlanReviewPacket` 和 `VerifyPacket` 两个阶段特化类型。
- 改造 `opsx-plan-review` SKILL.md，使其 assembler 产出 `PlanReviewPacket`、reviewer subagent 输出 `StageResult`。
- 改造 `opsx-verify` SKILL.md，使其 assembler 产出 `VerifyPacket`、reviewer subagent 输出 `StageResult`。
- 新增 `RunReport` HTML v1 数据模型与渲染，覆盖 Run Overview / Trace Overview / Reviewer Results / Conflict Board 四个板块。
- 首版不碰 tasks、implement、review、explore、plan 的 packet 化。

## 功能 (Capabilities)

### 新增功能
- `stage-packet-schema`: StagePacket / StageResult 基础 schema 定义，包含 Packet Budget 和 Lazy Hydration Contract。
- `run-report`: RunReport HTML v1 数据模型与渲染（Run Overview / Trace Overview / Reviewer Results / Conflict Board）。

### 修改功能
- `opsx-plan-review-skill`: plan-review 改造为 PlanReviewPacket in / StageResult out 协议。
- `opsx-verify-skill`: verify 改造为 VerifyPacket in / StageResult out 协议。

## 影响

- `.claude/skills/opsx-plan-review/SKILL.md` — assembler 与 reviewer 协议改造
- `.claude/skills/opsx-verify/SKILL.md` — assembler 与 reviewer 协议改造
- `openspec/changes/<change>/context/` — packet 可持久化到此目录
- `docs/workflows.md` — 更新"公用知识如何共享"章节，补充 Stage Packet Protocol 说明
- 新增 HTML 渲染相关产出物（位置待 design 阶段确定）
