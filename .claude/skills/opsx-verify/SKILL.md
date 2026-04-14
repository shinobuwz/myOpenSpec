---
name: opsx-verify
description: 验证实现是否与变更产出物匹配（完整性/正确性/一致性）。实施完成后或归档前使用。
---

验证实现是否与变更产出物（规范、任务、设计）匹配。

**输入**：可选指定变更名称。如果省略，检查是否可以从对话上下文中推断。如果模糊或不明确，你**必须**提示获取可用变更。

## 输入 / 输出边界

**读取：**
- `openspec/changes/<name>/.openspec.yaml`
- `openspec/changes/<name>/tasks.md`
- `openspec/changes/<name>/specs/**/*.md`（存在时）
- `openspec/changes/<name>/design.md`（存在时）
- `openspec/changes/<name>/test-report.md`（存在且需要测试留档检查时）
- `tasks.md` 中列出的实现 / 测试 / skill / docs 文件
- 命中的 `.aiknowledge/codemap/`（按需）

**产出：**
- `openspec/changes/<name>/audit-log.md`（追加，pass 和 fail 均写入）
- `openspec/changes/<name>/.openspec.yaml` 的 `gates.verify`（仅通过时）
- 不读取 / 不写入任何 `context/` 目录文件
- 不写入 `run-report-data.json`

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 `bash .claude/opsx/bin/changes.sh` 获取可用变更（含阶段和进度）。使用 **AskUserQuestion tool** 让用户选择。

   显示具有实现任务的变更（存在任务产出物）。
   如果可用，包括每个变更使用的 Schema。
   将任务未完成的变更标记为 "(进行中)"。

   **重要提示**：不要猜测或自动选择变更。始终让用户选择。

2. **检查变更目录结构**

   列出 `openspec/changes/<name>/` 下的文件，确认存在的产出物（tasks.md、specs/、design.md 等）。

3. **subagent 审查**

   使用 Agent tool 派遣 1 个 subagent，直接读取以下文件进行审查：
   - `openspec/changes/<name>/tasks.md`
   - `openspec/changes/<name>/specs/**/*.md`（存在时）
   - `openspec/changes/<name>/design.md`（存在时）
   - `openspec/changes/<name>/test-report.md`（存在时）
   - tasks.md 中"涉及文件"字段列出的代码文件

   subagent 在同一轮完成四个维度的检查，输出 1 个 StageResult JSON（见 `docs/stage-packet-protocol.md` 第 1 节）。

   subagent prompt 模板：

   ```
   你是 verify reviewer。验证变更 '<change_id>' 的实现。

   ## 输入
   直接读取以下文件：
   - `openspec/changes/<name>/tasks.md` — 任务列表
   - `openspec/changes/<name>/specs/**/*.md` — 规格文件（如存在）
   - `openspec/changes/<name>/design.md` — 设计文档（如存在）
   - `openspec/changes/<name>/test-report.md` — 测试报告（如存在）
   - tasks.md 中"涉及文件"字段列出的代码文件

   ## 审查维度
   顺序执行以下四个维度，并将所有 findings 合并到同一个 StageResult JSON 中。

   ### 一、完整性检查（dimension: VERIFY_COMPLETENESS）
   统计 tasks.md 中 [x] vs [ ] 得到完成度。
   为每个未完成任务生成 critical finding。
   从 specs/ 获取需求列表，通过代码文件搜索实现证据。

   ### 二、正确性检查（dimension: VERIFY_CORRECTNESS）
   如 specs/ 不存在，在 summary 中注明跳过原因。
   否则从 specs/ 读取需求场景，通过代码文件验证实现。

   ### 三、一致性检查（dimension: VERIFY_CONSISTENCY）
   如 design.md 不存在，在 summary 中注明跳过原因。
   否则读取 design.md 关键决策，通过代码文件验证代码遵循。

   ### 四、测试留档检查（dimension: VERIFY_TEST_REPORT）
   统计 tasks.md 中 [test-first] 和 [characterization-first] task 数量。
   如为 0，在 summary 中注明 "No TDD tasks — test-report.md check skipped"。
   否则检查 test-report.md 是否存在；缺失则报 critical。

   ## 输出要求
   输出一个 StageResult JSON：
   {
     "version": 1,
     "run_id": "<生成一个 ISO8601-short-hash 格式的唯一标识>",
     "change_id": "<change 目录名>",
     "stage": "verify",
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

4. **汇总验证报告**

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
  1. 追加 `openspec/changes/<name>/audit-log.md`，格式：
     ```
     ## verify | <ISO8601 时间戳> | pass
     方向：tasks.md + specs/**/*.md + design.md + 代码文件 → 验证通过
     修正：<修正项列表，每行一条；无发现时写"无发现">
     ```
     若写入 audit-log.md 时文件损坏（已存在但无法追加），中止并报错，禁止继续。
  2. 写入门控状态：在 `.openspec.yaml` 的 `gates:` 下添加 `verify: "<ISO8601 时间戳>"`
  3. 必须转入 **opsx-review** 进行代码审查。这不是建议，是强制要求。
- **如果验证未通过**：
  1. 追加 `openspec/changes/<name>/audit-log.md`，格式：
     ```
     ## verify | <ISO8601 时间戳> | fail
     方向：tasks.md + specs/**/*.md + design.md + 代码文件 → 验证未通过
     问题：<问题列表，每行一条>
     需修正：<需修正内容，每行一条>
     ```
     若写入时文件损坏，中止并报错。
  2. 不写入 gates
  3. 列出需要修复的问题，禁止继续后续流程。必须修复后重新执行 opsx-verify。
