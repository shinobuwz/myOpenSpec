## 上下文

当前 gate review 依赖多个 subagent 独立审查 `plan-review` 和 `verify`，但共享上下文的组织方式仍然是“各自重新读 change 产出物 + 各自重新探索项目知识”。结果是 token 成本高、review prompt 在多个模板里重复维护，而且 shared context 与 blind review 的边界没有被系统化表达。

第一版目标不是重做整个 OpenSpec 工作流，而是在现有 gate review 流程上增加一层轻量基础设施：
- 给 gate reviewers 提供统一的 facts bundle
- 让 facts 与 findings 分离
- 保持 reviewer blind
- 只在 reviewer 冲突时引入可选 arbiter

## 目标 / 非目标

**目标：**
- 为 `plan-review` 和 `verify` 建立共享 facts bundle 的第一版框架
- 在 `openspec instructions apply --json` 中暴露 gate review 事实输入
- 支持 change-local context 声明层（可选）
- 明确 blind reviewer 与 arbiter 的运行契约
- 保持现有输出格式与主要工作流兼容

**非目标：**
- 不把 `context/*.md` 提升为 schema 强制 artifact
- 不改造 explore / implement / review 等非 gate 工作流
- 不在第一版中引入复杂评分系统或长期持久化 run-scoped bundle
- 不要求 `task-analyze` 第一版消费 `.aiknowledge` 引用

## 需求追踪

- [R1] -> [U1]
- [R2] -> [U2]
- [R3] -> [U3]
- [R4] -> [U3]
- [R5] -> [U1]
- [R6] -> [U3]

## 实施单元

### [U1] Apply JSON 中的 gateReview facts 输出
- 关联需求: [R1], [R5]
- 模块边界: `src/commands/workflow/shared.ts`, `src/commands/workflow/instructions.ts`, `test/commands/artifact-workflow.test.ts`
- 验证方式: `openspec instructions apply --json` 在 context 文件存在/缺失时都返回稳定的 `gateReview` 字段；旧字段保持兼容
- 知识沉淀: run-scoped bundle 不应写入 `.aiknowledge`，change-local context 只作为声明层输入

### [U2] plan-review 的 blind facts 消费模式
- 关联需求: [R2]
- 模块边界: `src/core/templates/workflows/plan-review.ts`
- 验证方式: 模板文案显式要求先读 `gateReview`，并规定 reviewer 可见/不可见信息边界
- 知识沉淀: blind review 的关键不是“无上下文”，而是“共享事实、不共享判断”

### [U3] verify 的 blind reviewers 与可选 arbiter
- 关联需求: [R3], [R4], [R6]
- 模块边界: `src/core/templates/workflows/verify.ts`
- 验证方式: 模板文案要求 A/B/C/D 共享同一 facts bundle；仅在 existence/severity/intent conflict 时触发 arbiter
- 知识沉淀: arbiter 应只聚焦冲突点与证据，不能退化为第二轮全量 verify

## 决策

### 决策 1：事实包从 `instructions apply --json` 输出，而不是单独新增 CLI
- 选择原因：`instructions apply` 已经是实现前统一读取 change 上下文的入口，天然适合附带 gateReview facts
- 替代方案：新增独立 `gate-review-context` 命令
- 不选原因：会引入额外命令面与重复装配逻辑，第一版过重

### 决策 2：change-local context 放在 `openspec/changes/<name>/context/`，但保持可选
- 选择原因：这些文件语义上属于 change 的本地声明层，而不是长期知识库
- 替代方案：放到 `.aiknowledge/` 或 schema 强制 artifacts
- 不选原因：前者污染长期知识，后者会牵动整个 artifact workflow

### 决策 3：`.aiknowledge` 只作为长期知识源，第一版只在 context 中声明引用
- 选择原因：保持长期知识与运行时事实的分层清晰
- 替代方案：把 `.aiknowledge` 正文复制到 change 或 bundle 中
- 不选原因：容易造成漂移、增加 token、破坏单一真相源

### 决策 4：arbiter 只在冲突时触发
- 选择原因：保留 blind reviewer 的独立性，同时控制成本
- 替代方案：每次 verify 都固定运行 arbiter
- 不选原因：第一版 token 增幅过大，且很多情况下只是重复汇总

## 风险 / 权衡

- [风险] `gateReview` 字段过大，反而把重复探索变成重复注入  
  → 缓解措施：第一版仅输出最小事实字段，不输出 findings、severity 或长摘要

- [风险] `context/*.md` 与真实 artifacts 漂移  
  → 缓解措施：将其定义为声明层；authoritative source 仍然是 specs/design/tasks，本地 context 缺失时优雅降级

- [风险] blind reviewer 规则写得不清，导致 reviewer 继续互相污染  
  → 缓解措施：在 `plan-review`/`verify` 模板中显式声明可见/不可见信息边界

- [风险] arbiter 范围膨胀为全量第二审  
  → 缓解措施：把 arbiter 限定为 conflict-only，并明确只处理 existence/severity/intent conflict

## 知识沉淀

- “共享上下文”要区分 facts 与 findings；共享事实不会自动削弱独立复核，但共享结论会。
- change-local context 更适合作为声明层，而不是知识副本或正式 schema artifact。
- gate review 的第一版应优先优化 `plan-review` 与 `verify`，避免一次性侵入所有 workflows。
