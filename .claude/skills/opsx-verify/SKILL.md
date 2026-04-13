---
name: opsx-verify
description: 验证实现是否与变更产出物匹配（完整性/正确性/一致性）。实施完成后或归档前使用。
---

验证实现是否与变更产出物（规范、任务、设计）匹配。

**输入**：可选指定变更名称。如果省略，检查是否可以从对话上下文中推断。如果模糊或不明确，你**必须**提示获取可用变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 `bash .claude/opsx/bin/changes.sh` 获取可用变更（含阶段和进度）。使用 **AskUserQuestion tool** 让用户选择。

   显示具有实现任务的变更（存在任务产出物）。
   如果可用，包括每个变更使用的 Schema。
   将任务未完成的变更标记为 "(进行中)"。

   **重要提示**：不要猜测或自动选择变更。始终让用户选择。

2. **检查变更目录结构**

   列出 `openspec/changes/<name>/` 下的文件，确认存在的产出物（tasks.md、specs/、design.md 等）。

3. **组装 VerifyPacket**（参照 `docs/stage-packet-protocol.md` 第 4.2 节）

   变更目录为 `openspec/changes/<name>/`。

   **core_payload 组装：**
   - `artifact_presence`：检查 proposal.md / specs/ / design.md / tasks.md / test-report.md 是否存在
   - `requirements`：从 specs/ 收集 R 编号和一行摘要
   - `trace_mapping`：从 design.md 提取 R→U 映射
   - `units`：从 design.md 提取 [U?] 标题
   - `task_completion`：统计 tasks.md 中 `[x]` vs `[ ]` 得到 `{completed: N, total: M}`
   - `task_traces`：从 tasks.md 提取每个 task 的 R/U 标签
   - `tdd_summary`：统计 test-first / characterization-first / direct 各多少
   - `test_report_present`：test-report.md 是否存在

   **optional_refs 组装：**
   - `source_refs`：列出所有存在的产出物文件路径和 kind
   - `code` 证据引用：从 tasks.md 的“涉及文件”字段提取实现文件路径，并加入 `source_refs`，`kind` 设为 `code`
   - `knowledge_refs`：读取 `.aiknowledge/codemap/index.md`，识别命中模块，只记录路径引用

   约束：
   - facts 只包含事实，不包含 findings、severity 或修复建议
   - 正文不得复制进 packet，只保留路径引用和结构化摘要

4. **校验 Packet Budget**：计算 estimated_tokens（字符数/4）。如超过 soft_limit(2000) 记录警告；如需要预降维则记录到 `budget.truncated_fields`；超过 hard_limit(4000) 必须按固定降维顺序截断后再发送（见协议文档第 2.2 节）

5. **填充 packet 元数据**

   - 填充 `version`、`stage`、`change_id`、`packet_id`、`created_at`、`producer`
   - 如 `openspec/changes/<name>/context/run-report-data.json` 已存在且 JSON 合法且包含 `run_id`，必须复用该 `run_id`
   - 如文件存在但 JSON 解析失败，必须中止并报错，禁止覆盖；由用户手动确认后才可重置
   - 否则生成新的 `run_id`（格式：`<ISO8601>-<short-hash>`）

6. **subagent 审查**

   使用 Agent tool 派遣 1 个 subagent。subagent 收到 VerifyPacket JSON 作为输入，在同一轮审查中完成四个维度的检查，并输出 1 个 StageResult。

   **消除双读规则**：subagent 从 core_payload 获取结构化事实（task_completion、task_traces、tdd_summary 等），只在需要验证具体代码证据时通过 `optional_refs.source_refs` 中 `kind: code` 的路径回读文件。禁止重读 tasks.md / specs / design 全文来获取 core_payload 中已存在的信息。

   subagent prompt 模板：

   ```
   你是 verify reviewer。验证变更 '{change_id}' 的实现。

   ## 输入 Packet
   {VerifyPacket JSON}

   ## 消除双读规则
   core_payload 中已包含 task 完成度、追踪关系、TDD 摘要等结构化事实。
   禁止重新读取 tasks.md / specs / design 全文来获取这些已有信息。
   只在需要验证具体代码证据时，通过 optional_refs.source_refs 中 `kind: "code"` 的路径回读文件。

   ## 审查维度
   顺序执行以下四个维度，并将所有 findings 合并到同一个 StageResult JSON 中。

   ### 一、完整性检查（dimension: VERIFY_COMPLETENESS）
   从 core_payload.task_completion 获取完成度。
   为每个未完成任务生成 critical finding。
   如有 specs，从 core_payload.requirements 获取需求列表，并仅通过 `kind: "code"` 的 source_refs 搜索实现证据。

   ### 二、正确性检查（dimension: VERIFY_CORRECTNESS）
   如 core_payload.artifact_presence.specs 为 false，在 summary 中注明跳过原因。
   否则从 core_payload.requirements 获取需求，通过 source_refs 中的 spec 路径回读场景，并通过 `kind: "code"` 的 source_refs 验证实现。

   ### 三、一致性检查（dimension: VERIFY_CONSISTENCY）
   如 core_payload.artifact_presence.design 为 false，在 summary 中注明跳过原因。
   否则通过 source_refs 中的 design 路径回读关键决策，并通过 `kind: "code"` 的 source_refs 验证代码遵循。

   ### 四、测试留档检查（dimension: VERIFY_TEST_REPORT）
   从 core_payload.tdd_summary 获取 TDD task 数量。
   如为 0，在 summary 中注明 "No TDD tasks — test-report.md check skipped"。
   否则检查 core_payload.test_report_present，缺失则报 critical。

   ## 输出要求
   输出一个 StageResult JSON：
   {
     "version": 1,
     "run_id": "{packet.run_id}",
     "change_id": "{packet.change_id}",
     "stage": "verify",
     "packet_id": "{packet.packet_id}",
     "agent_role": "verify-reviewer",
     "summary": "一句话总结",
     "decision": "pass|pass_with_warnings|fail|skip",
     "metrics": {"findings_total": N, "critical": N, "warning": N, "suggestion": N},
     "findings": [
       {"id": "F1", "severity": "critical|warning|suggestion", "dimension": "VERIFY_COMPLETENESS|VERIFY_CORRECTNESS|VERIFY_CONSISTENCY|VERIFY_TEST_REPORT", "message": "...", "trace_id": "R?", "evidence_ref": "path:line"}
     ]
   }

   验证启发式：不确定时优先 suggestion > warning > critical。
   ```

7. **汇总验证报告**

   主 agent 收集该 reviewer 的 StageResult JSON：

   **摘要记分卡**：
   ```
   ## 验证报告：<change-name>

   ### 摘要
   | 维度     | 状态             |
   |----------|------------------|
   | 完整性   | X/Y 任务，N 需求 |
   | 正确性   | M/N 需求已覆盖   |
   | 一致性   | 已遵循/存在问题  |
   | 测试留档 | N/N TDD tasks    |
   ```

   **按优先级分类的问题**：

   1. **CRITICAL**（归档前必须修复）：未完成的任务、缺失的需求实现、test-report.md 缺失或不完整
   2. **WARNING**（应该修复）：规范/设计偏差、缺失的场景覆盖
   3. **SUGGESTION**（最好修复）：模式不一致、小改进

   **最终评估**：
   - 有 CRITICAL 问题（含测试留档 CRITICAL）→ "发现 X 个关键问题。归档前请修复。"
   - 只有警告 → "没有关键问题。有 Y 个警告需要考虑。可以归档（但建议改进）。"
   - 全部通过 → "所有检查通过。可以归档。"

**优雅降级**

subagent prompt 中已内联降级条件，规则如下：
- 无 specs/：跳过正确性检查，注明原因
- 无 design.md：跳过设计遵循检查，注明原因
- 无 TDD tasks：跳过 test-report.md 检查，注明原因
- 始终注明跳过了哪些检查以及原因

**验证启发式方法**

- 不确定时，优先使用 SUGGESTION 而非 WARNING，WARNING 而非 CRITICAL
- 每个问题都必须有具体的、可操作的建议（附文件/行引用）
- 不要使用模糊的建议，如 "考虑审查"

## 退出契约

- 输出验证报告
- **如果验证通过**：
  1. 在 `openspec/changes/<name>/.openspec.yaml` 的 `gates:` 下添加 `verify: "<ISO8601 时间戳>"`
  2. 将 VerifyPacket + StageResult 写入 `openspec/changes/<name>/context/run-report-data.json`（追加式更新：不存在则创建，已存在且 JSON 合法则合并，JSON 损坏则中止并报错，见步骤 5）
  3. 必须转入 **opsx-review** 进行代码审查。这不是建议，是强制要求。
- **如果验证未通过**：
  1. 不写入 gates
  2. 仍将 packet + result 写入 `context/run-report-data.json`（状态为 fail；JSON 损坏则中止并报错，见步骤 5）
  3. 列出需要修复的问题，禁止继续后续流程。必须修复后重新执行 opsx-verify。
