## Task 1：编写 StagePacket / StageResult 基础 schema 协议文档

**需求追踪**：[R1][R2][R3][R4] → [U1]
**执行方式**：[direct]
**涉及文件**：
- `docs/stage-packet-protocol.md` — 新建协议规范文档

**验收标准**：
- [x] 文档包含 StagePacket 完整 schema：必填字段（version, run_id, change_id, stage, packet_id, created_at, producer）、`core_payload` / `optional_refs` 分层定义
- [x] 文档包含 StageResult 完整 schema：必填字段（version, run_id, change_id, stage, packet_id, agent_role, summary, decision 枚举）、可选字段（needs_arbiter, metrics, findings, evidence_refs, next_actions）
- [x] 文档包含 finding 条目结构定义：id, severity 枚举, dimension, message, trace_id（可选）, evidence_ref（可选）
- [x] 文档包含 `source_refs` 数组定义：path + kind 枚举（proposal/spec/design/tasks/test-report/context/code）
- [x] 文档包含 `knowledge_refs` 对象定义：codemap 数组 + pitfalls 数组，每条含 module/domain + path
- [x] 每个字段显式标注所属层级（core_payload 或 optional_refs）
- [x] 包含一个 PlanReviewPacket 示例实例和一个 VerifyPacket 示例实例，用于验证 schema 完整性

**依赖**：无

---

## Task 2：编写 Packet Budget 和 Lazy Hydration Contract 协议章节

**需求追踪**：[R5][R6][R7] → [U2]
**执行方式**：[direct]
**涉及文件**：
- `docs/stage-packet-protocol.md` — 追加 Budget、Hydration、blind 隔离章节

**验收标准**：
- [x] 文档包含 `budget` 元数据块定义：estimated_tokens, soft_limit (2000), hard_limit (4000), truncated_fields, shard_count
- [x] 文档包含 token 估算公式说明（字符数 / 4）
- [x] 文档包含固定降维顺序：多行摘要→一行 > 内容→纯引用 > task trace→计数/索引 > 分片
- [x] 文档包含 Lazy Hydration 规则：subagent 只读 packet 内 refs 路径；扩展读取须通过 next_actions 声明；arbiter 只读冲突相关 evidence_refs
- [x] 文档包含 blind 隔离规则：reviewer 共享 StagePacket、不共享 StageResult；主 agent 是唯一汇总点
- [x] 包含一个超限 packet 降维前后的对比示例

**依赖**：Task 1

---

## Task 3：改造 opsx-plan-review SKILL.md 为 Packet In / Result Out

**需求追踪**：[R13][R14][R15] → [U3]
**执行方式**：[direct]
**涉及文件**：
- `.claude/skills/opsx-plan-review/SKILL.md` — 改造 assembler 和 reviewer 协议

**验收标准**：
- [x] 启动序列改为：主 agent 组装 PlanReviewPacket（core_payload 含 R 全集 + R→U 映射 + U 标题 + artifact 存在性标记；optional_refs 含 spec/design/proposal/codemap/pitfalls 引用）
- [x] 组装后校验 Packet Budget：超过 soft_limit 记录警告并可选预降维，超过 hard_limit 才按降维顺序截断
- [x] subagent prompt 要求输出 StageResult JSON，引用 `docs/stage-packet-protocol.md` 中的 schema 定义
- [x] 每个 reviewer 的 `agent_role` 明确：trace-reviewer / granularity-reviewer / uniqueness-reviewer / design-integrity-reviewer
- [x] findings 中的 `dimension` 使用对应标签：TRACE_GAP / COARSE_R / DUPLICATE_R / GHOST_R / ORPHAN
- [x] 汇总逻辑从 StageResult JSON 合并 findings（而非解析自由文本）
- [x] 退出契约增加：无论通过与否，将 PlanReviewPacket + 所有 StageResult 写入 `context/run-report-data.json`
- [x] run-report-data.json 追加式更新：不存在则创建，已存在则读取后合并当前 stage 数据，同一 stage 重复执行时覆盖旧数据
- [x] 不依赖任何外部 CLI 命令（遵循 pitfall: skill-avoid-external-cli-dependency）

**依赖**：Task 1, Task 2

---

## Task 4：改造 opsx-verify SKILL.md 为 Packet In / Result Out

**需求追踪**：[R16][R17][R18][R19] → [U4]
**执行方式**：[direct]
**涉及文件**：
- `.claude/skills/opsx-verify/SKILL.md` — 改造 assembler 和 reviewer 协议

**验收标准**：
- [x] 启动序列改为：主 agent 组装 VerifyPacket（core_payload 含 task 完成度 + R→U→Task 追踪 + TDD 标签摘要 + test-report 存在性 + artifact 存在性标记；optional_refs 含 tasks/spec/design/proposal/test-report/codemap 引用）
- [x] VerifyPacket 填充全部 StagePacket 顶层元数据：run_id / packet_id / created_at / producer / budget
- [x] VerifyPacket 的 optional_refs 包含实现证据文件引用（从 tasks.md“涉及文件”提取，kind 为 `code`）
- [x] 组装后校验 Packet Budget：超过 soft_limit 记录警告并可选预降维，超过 hard_limit 才按降维顺序截断
- [x] 消除双读模式：subagent 从 core_payload 获取结构化事实，只通过 optional_refs 中的 `code` 引用按需回读代码证据，禁止重读 tasks/specs/design 全文
- [x] subagent prompt 要求输出 StageResult JSON，引用 `docs/stage-packet-protocol.md` 中的 schema 定义
- [x] 每个 reviewer 的 `agent_role` 明确：verify-completeness / verify-correctness / verify-consistency / verify-test-report
- [x] 汇总逻辑含冲突检测：同一问题不同 severity 时触发 arbiter；arbiter 只读冲突相关 evidence_refs
- [x] 退出契约增加：无论通过与否，将 VerifyPacket + 所有 StageResult 写入 `context/run-report-data.json`
- [x] run-report-data.json 追加式更新：不存在则创建，已存在则读取后合并当前 stage 数据，同一 stage 重复执行时覆盖旧数据
- [x] 不依赖任何外部 CLI 命令（遵循 pitfall: skill-avoid-external-cli-dependency）

**依赖**：Task 1, Task 2

---

## Task 5：创建 opsx-report skill 和 RunReport HTML v1 渲染

**需求追踪**：[R8][R9][R10][R11][R12] → [U5]
**执行方式**：[direct]
**涉及文件**：
- `.claude/skills/opsx-report/SKILL.md` — 新增 report skill
- `openspec/changes/<name>/context/run-report.html` — HTML 输出位置

**验收标准**：
- [x] SKILL.md 定义 `/opsx:report <change-name>` 触发方式
- [x] SKILL.md 指示主 agent 读取 `context/run-report-data.json`，聚合各 stage 的 packet + results
- [x] RunReport 数据模型包含：run_id, change_id, current_stage, gate_status, stages
- [x] 同一 change 的后续 stage 更新复用已有 run_id；只有数据文件不存在或被显式重置时才生成新的 run_id
- [x] HTML 渲染为 self-contained 单文件（内联 CSS，无外部依赖）
- [x] Run Overview 板块：change 名称、run_id、当前阶段、gate pass/fail/pending 状态、findings 按 severity 计数；通过绿色/失败红色
- [x] Trace Overview 板块：R→U 矩阵、task 覆盖计数、缺失追踪高亮；无 verify 数据时显示 "task coverage unavailable until verify stage"
- [x] Reviewer Results 板块：按 stage 分组，每个 reviewer 卡片显示 summary/severity 计数/decision/findings；critical 卡片红色边框
- [x] Conflict Board 板块：冲突点 + 涉及 reviewer + arbiter 裁决；无冲突时 "No conflicts detected"
- [x] 首版只展示 plan-review 和 verify 两个 stage，其他显示 "not_tracked"
- [x] 不依赖任何外部 CLI 命令或构建工具

**依赖**：Task 1

---

## Task 6：更新 docs/workflows.md 补充 Stage Packet Protocol 说明

**需求追踪**：全局 → 文档同步
**执行方式**：[direct]
**涉及文件**：
- `docs/workflows.md` — 更新"公用知识如何共享"章节

**验收标准**：
- [x] "公用知识如何共享"章节的第 3 层更新为 Stage Packet Protocol 说明
- [x] 说明 StagePacket / StageResult 的定位：阶段化协议，不是消息总线
- [x] 说明 Packet Budget 和 Lazy Hydration Contract 的存在
- [x] 引用 `docs/stage-packet-protocol.md` 作为协议详细规范
- [x] 首版覆盖范围说明：只有 plan-review 和 verify

**依赖**：Task 1
