## 上下文

`2026-04-09-add-gate-review-facts-bundle` 引入了 gate review facts bundle，证明了"共享事实、不共享判断"的可行性。但它留下了三个结构性缺口：

1. facts bundle 是隐式契约——没有 schema，字段靠 SKILL.md 散文描述，无法校验。
2. reviewer subagent 输出是自由文本——主 agent 靠自然语言解析汇总，格式不可预测。
3. 审查结果没有持久化消费面——散落在对话上下文里，无法跨会话追踪。

本次变更将 facts bundle 升级为 **OPSX Stage Packet Protocol**：一层阶段化协议，统一 subagent 的输入（StagePacket）和输出（StageResult），并提供 HTML 展示面（RunReport）。

当前仓库知识分层保持不变：
- Layer 1：项目级上下文（`openspec/config.yaml`）
- Layer 2：长期共享知识（`.aiknowledge/codemap/` + `.aiknowledge/pitfalls/`）
- Layer 3：change 级共享事实 → **本次升级为 Stage Packet Protocol**

## 目标 / 非目标

**目标：**
- 定义 StagePacket / StageResult 基础 schema，含 Packet Budget 和 Lazy Hydration Contract
- 派生 PlanReviewPacket 和 VerifyPacket 两个阶段特化类型
- 改造 `opsx-plan-review` 和 `opsx-verify` SKILL.md 为 Packet In / Result Out 模式
- 交付 RunReport HTML v1（Run Overview / Trace Overview / Reviewer Results / Conflict Board）
- HTML 与 Phase 1 同步交付，不后置

**非目标：**
- 不碰 tasks、implement、review、explore、plan 的 packet 化（Phase 2-4）
- 不引入消息总线、事件系统或运行时服务
- 不改变 authoritative sources 的位置（proposal/specs/design/tasks 仍在原处）
- 不把 `.aiknowledge` 正文复制进 packet
- 不做 packet 的跨 change 共享

## 需求追踪

- [R1] -> [U1]
- [R2] -> [U1]
- [R3] -> [U1]
- [R4] -> [U1]
- [R5] -> [U2]
- [R6] -> [U2]
- [R7] -> [U2]
- [R8] -> [U5]
- [R9] -> [U5]
- [R10] -> [U5]
- [R11] -> [U5]
- [R12] -> [U5]
- [R13] -> [U3]
- [R14] -> [U3]
- [R15] -> [U3]
- [R16] -> [U4]
- [R17] -> [U4]
- [R18] -> [U4]
- [R19] -> [U4]

## 实施单元

### [U1] StagePacket / StageResult 基础 schema 定义
- 关联需求: [R1], [R2], [R3], [R4]
- 模块边界: `docs/stage-packet-protocol.md`（协议规范文档）
- 实施内容:
  - 定义 StagePacket YAML schema：必填字段（version, run_id, change_id, stage, packet_id, created_at, producer）、`core_payload` / `optional_refs` 分层、`source_refs` 数组（path + kind）、`knowledge_refs` 对象（codemap + pitfalls）
  - 定义 StageResult YAML schema：必填字段（version, run_id, change_id, stage, packet_id, agent_role, summary, decision）、可选字段（needs_arbiter, metrics, findings, evidence_refs, next_actions）
  - 定义 finding 条目结构：id, severity, dimension, message, trace_id（可选）, evidence_ref（可选）
  - `source_refs.kind` 枚举：proposal / spec / design / tasks / test-report / context / code
  - `decision` 枚举：pass / pass_with_warnings / fail / skip
- 验证方式: 用 PlanReviewPacket 和 VerifyPacket 的具体实例验证 schema 完整性
- 知识沉淀: 协议 schema 应作为独立文档维护，不嵌入 SKILL.md

### [U2] Packet Budget 引擎与 Lazy Hydration Contract
- 关联需求: [R5], [R6], [R7]
- 模块边界: `docs/stage-packet-protocol.md`（协议规范文档中的 Budget 和 Hydration 章节）
- 实施内容:
  - 定义 `budget` 元数据块：estimated_tokens, soft_limit (2000), hard_limit (4000), truncated_fields, shard_count
  - 定义固定降维顺序：多行摘要→一行摘要 > 内容→纯引用 > task trace→计数/索引 > 分片
  - 定义 Lazy Hydration 规则：subagent 只能读取 packet 中 source_refs 和 knowledge_refs 列出的路径；扩展读取必须通过 next_actions 声明；arbiter 只能读取冲突相关 evidence_refs
  - 定义 blind 隔离规则：同一 stage 的 reviewer 共享 StagePacket、不共享 StageResult；主 agent 是唯一汇总点
- 验证方式: 构造超限 packet 实例，验证降维顺序产出合规 packet
- 知识沉淀: budget 的 soft/hard limit 值需要在实际使用中校准；首版 2K/4K 是保守估计

### [U3] PlanReviewPacket assembler + reviewer StageResult 改造
- 关联需求: [R13], [R14], [R15]
- 模块边界: `.claude/skills/opsx-plan-review/SKILL.md`
- 实施内容:
  - 改造启动序列：主 agent 组装 PlanReviewPacket 而非自由读取
  - `core_payload` 字段：R 全集（编号+一行摘要）、R→U 映射、U 标题列表、artifact 存在性标记
  - `optional_refs` 字段：spec 文件引用、design.md 引用、proposal.md 引用、codemap/pitfalls 引用
  - 组装后校验 budget（R5）：超过 soft_limit 记录警告并可选预降维，超过 hard_limit 则必须降维
  - 改造审查方式：subagent prompt 要求输出 StageResult JSON（而非自由文本报告）
  - 每个 reviewer 的 `agent_role`：trace-reviewer / granularity-reviewer / uniqueness-reviewer / design-integrity-reviewer
  - 改造汇总逻辑：主 agent 从 StageResult 合并 findings，生成追踪矩阵和问题列表
  - 无论 gate 通过与否，packet + results 写入 `context/run-report-data.json`
- 验证方式: 对已有 archived change 模拟运行，验证 PlanReviewPacket 可组装、StageResult 可解析
- 知识沉淀: reviewer 维度命名应与 finding dimension 标签一一对应（TRACE_GAP↔trace-reviewer 等）

### [U4] VerifyPacket assembler + reviewer StageResult 改造
- 关联需求: [R16], [R17], [R18], [R19]
- 模块边界: `.claude/skills/opsx-verify/SKILL.md`
- 实施内容:
  - 改造启动序列：主 agent 组装 VerifyPacket 而非自由读取再派发
  - `core_payload` 字段：task 完成度（completed/total）、R→U→Task 追踪关系、TDD 标签摘要、test-report 存在性、artifact 存在性标记
  - `optional_refs` 字段：tasks.md 引用、spec 文件引用、design.md 引用、proposal.md 引用、test-report.md 引用、codemap 引用，以及从 tasks.md“涉及文件”提取的实现证据文件引用（`kind: code`）
  - 组装 packet 时必须填充全部 StagePacket 顶层元数据：run_id、packet_id、created_at、producer
  - 组装后校验 budget（R5）：超过 soft_limit 记录警告并可选预降维，超过 hard_limit 则必须降维
  - **消除双读模式**：subagent 从 core_payload 获取结构化事实，只通过 optional_refs 中的 `code` 引用按需回读代码证据，禁止重读 tasks/specs/design 全文
  - 改造 subagent prompt：要求输出 StageResult JSON
  - 每个 reviewer 的 `agent_role`：verify-completeness / verify-correctness / verify-consistency / verify-test-report
  - 改造汇总逻辑：检测冲突（同一问题不同 severity）→ 必要时触发 arbiter → 合并 findings
  - 无论 gate 通过与否，packet + results 写入 `context/run-report-data.json`
- 验证方式: 对已有 archived change 模拟运行，验证 VerifyPacket 可组装、双读已消除
- 知识沉淀: 消除双读的关键是 core_payload 足够结构化，subagent 不需要"重新理解"原文件

### [U5] RunReport HTML v1 数据模型与渲染
- 关联需求: [R8], [R9], [R10], [R11], [R12]
- 模块边界: `.claude/skills/opsx-report/SKILL.md`（新增 skill）、`context/run-report-data.json`（数据源）、`context/run-report.html`（输出）
- 实施内容:
  - 定义 RunReport 数据模型：从 `context/run-report-data.json` 读取各 stage 的 packet + results
  - 数据模型顶层字段：run_id, change_id, current_stage, gate_status, stages（各 stage 条目）；同一 change 的后续 stage 更新必须复用已有 run_id
  - HTML 渲染为单文件 self-contained HTML（内联 CSS，无外部依赖）
  - 四个板块：
    1. **Run Overview**：change 名称、run_id、当前阶段、gate pass/fail/pending 状态、findings 按 severity 计数
    2. **Trace Overview**：R→U 矩阵、task 覆盖计数、缺失追踪计数、TRACE_GAP 高亮；若尚无 verify 数据则显示 "task coverage unavailable until verify stage"
    3. **Reviewer Results**：按 stage 分组，每个 reviewer 卡片显示 summary / severity 计数 / decision / findings 列表
    4. **Conflict Board**：冲突点、涉及 reviewer、各自立场、arbiter 裁决；无冲突时显示 "No conflicts detected"
  - 首版只展示 plan-review 和 verify 两个 stage，其他 stage 显示 "not_tracked"
  - 新增 `opsx-report` skill，触发方式为 `/opsx:report <change-name>`
- 验证方式: 生成 HTML 在浏览器中打开，确认四个板块均可渲染
- 知识沉淀: HTML 必须是 self-contained 单文件，避免引入构建工具或外部 CDN 依赖

## 决策

### 决策 1：协议 schema 作为独立文档，不嵌入 SKILL.md
- 选择原因：schema 是跨 skill 共享的协议，嵌入任一 SKILL.md 会导致重复维护
- 替代方案：在每个 SKILL.md 中内联 schema 描述
- 不选原因：当前 plan-review 和 verify 已有隐式 bundle 描述，如果继续内联，Phase 2 扩展时会更加碎片化
- 落地位置：`docs/stage-packet-protocol.md`

### 决策 2：packet + results 持久化到 `context/run-report-data.json`
- 选择原因：RunReport 需要跨 stage 聚合数据；JSON 文件是最简单的持久化方式，不引入数据库或外部服务
- 替代方案 A：每个 stage 写独立 JSON 文件
- 不选原因：增加文件管理复杂度，聚合时仍需合并
- 替代方案 B：只在内存中传递，不持久化
- 不选原因：gate review 跨会话执行，内存数据会丢失
- 追加文件到 `context/` 不需要改 `.openspec.yaml` 的 artifacts 配置

### 决策 3：HTML 渲染为 self-contained 单文件
- 选择原因：用户可以直接在浏览器打开，无需启动服务器或安装依赖
- 替代方案：引入模板引擎（Handlebars/EJS）或静态站点生成
- 不选原因：Phase 1 只有 4 个板块，单文件 HTML + 内联 CSS 完全够用；引入构建工具是过早优化

### 决策 4：新增 `opsx-report` skill 而非嵌入现有 skill
- 选择原因：report 生成是独立动作，可以在任意时刻触发（不一定绑定到 gate 退出）
- 替代方案：在 plan-review / verify 的退出契约中自动生成 HTML
- 不选原因：不是每次都需要 HTML，自动生成会增加不必要的 I/O；用户按需触发更灵活

### 决策 5：Packet Budget 的 token 估算采用字符数 / 4 的近似公式
- 选择原因：不引入 tokenizer 依赖，对于 schema 级约束来说精度足够
- 替代方案：引入 tiktoken 或类似库精确计算
- 不选原因：packet 内容以英文关键字 + 短中文摘要为主，字符/4 的近似误差 < 20%，在 soft/hard limit 的 2x 缓冲区内可接受

### 决策 6：`run-report-data.json` 采用追加式更新
- 选择原因：plan-review 和 verify 在不同会话执行，每个 stage 完成后追加自己的 packet + results 到同一文件
- 写入规则：如果文件不存在则创建；如果已存在则读取后合并当前 stage 的数据再写回
- 冲突处理：同一 stage 重复执行时覆盖该 stage 的旧数据（以最新一次为准）

### 决策 7：同一 change 的 StagePacket 必须复用已有 run_id
- 选择原因：RunReport 以 `run_id` 聚合同一次 gate 工作流；若每个 stage 自行生成新的 run_id，会把同一个 change 的 plan-review 与 verify 拆成多个伪 run
- 规则：首次写入 `context/run-report-data.json` 的 stage 生成 run_id；后续 stage 若发现文件已存在，则必须复用该 run_id；只有用户显式删除/重置该文件时才开启新 run

## 风险 / 权衡

- [风险] subagent 不遵守 StageResult schema（输出自由文本而非 JSON）
  → 缓解措施：在 SKILL.md 的 subagent prompt 中用 JSON 示例明确格式要求；主 agent 汇总时做基本格式校验，格式不合规则要求 subagent 重试一次

- [风险] Packet Budget 的 char/4 估算不够准确
  → 缓解措施：soft_limit 设为 hard_limit 的 50%，留足缓冲；后续可根据实际使用数据校准

- [风险] `context/run-report-data.json` 与实际 gate 状态漂移（如手动改了 .openspec.yaml 但没重跑 review）
  → 缓解措施：RunReport 显示 `created_at` 时间戳，用户可自行判断数据新鲜度；`opsx-report` 生成时校验 gate 时间戳是否匹配

- [风险] Lazy Hydration 过于严格，导致 reviewer 缺少必要上下文
  → 缓解措施：core_payload 设计足够结构化，覆盖 reviewer 80% 的判断需求；剩余 20% 通过 optional_refs 按需回读；如果实践中发现回读率过高，后续调整 core_payload 的字段范围

- [风险] HTML 单文件在 change 复杂时过大
  → 缓解措施：Phase 1 只有两个 stage，数据量可控；Phase 2+ 扩展时再评估是否需要分页或折叠

## 知识沉淀

- Stage Packet Protocol 的核心价值不是"标准化 JSON 格式"，而是为 subagent 建立**有边界的读取契约**。没有边界的 subagent 最终会退化成"重新读一遍仓库"。
- Packet Budget 和 Lazy Hydration 是互补约束：Budget 控制输入大小，Hydration 控制读取范围。两者缺一会让另一个失效。
- facts 与 findings 分离的原则从前作继承，本次升级没有改变这个原则，只是把它从散文约定变成了 schema 约束。
- HTML 消费面是协议能否被用户感知的关键。没有 HTML，StagePacket/StageResult 只是"给 AI 看的 JSON"。
