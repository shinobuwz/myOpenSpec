---
name: opsx-verify
description: 验证实现是否与变更产出物匹配（完整性/正确性/一致性）。实施完成后或归档前使用。
license: MIT
compatibility: 不需要外部 CLI，直接读取文件系统。
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.2.0-cc.4"
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

3. **构建共享 facts bundle**

   变更目录为 `openspec/changes/<name>/`。主 agent 先组装一个共享 facts bundle，供所有 reviewer 复用：
   - `tasks.md`（必须）
   - `specs/` 下所有 .md 文件（如存在）
   - `design.md`（如存在）
   - `proposal.md`（如存在）
   - `context/knowledge-refs.md`、`context/review-scope.md`、`context/artifact-index.md`（如存在，作为声明性事实输入）
   - `test-report.md` 的存在性，以及 tasks 中 TDD 标签的摘要事实

   约束：
   - `context/*.md` 是 change-local 声明层，不是权威源；与 specs/design/tasks 冲突时以后者为准
   - facts bundle 只包含事实，不包含 findings、severity 或修复建议

4. **subagent 审查**

   使用 Agent tool 派遣 1 个 subagent，顺序执行四个维度的检查：

   ```
   Agent({
     description: "验证变更实现",
     subagent_type: "general-purpose",
     prompt: `验证变更 '<name>' 的实现，顺序执行以下四个维度检查：

     变更目录：openspec/changes/<name>/
     （在每项检查开始前读取所需文件）

     ## 一、完整性检查
     读取 tasks.md 和 specs/ 下所有 .md 文件（如存在）。

     任务完成情况：
     - 统计 tasks.md 中 [x] vs [ ] 复选框数量
     - 为每个未完成任务生成 CRITICAL 问题

     规范覆盖率：
     - 提取 specs/ 中所有需求（"### 需求:"）
     - 对每个需求在代码库中搜索实现证据
     - 未实现的需求生成 CRITICAL 问题
     - 如无 specs/ 则注明跳过

     ## 二、正确性检查
     读取 specs/ 下所有 .md 文件（如存在，否则跳过本节并注明）。

     需求实现映射：
     - 对每个需求，搜索代码库确认实现是否符合需求意图
     - 偏差生成 WARNING

     场景覆盖率：
     - 对每个场景（"#### 场景:"），检查代码处理和测试覆盖
     - 未覆盖的场景生成 WARNING

     ## 三、一致性检查
     读取 design.md（如存在，否则跳过设计遵循检查并注明）。

     设计遵循情况：
     - 如果存在 design.md：提取关键决策，验证代码是否遵循，矛盾生成 WARNING
     - 无 design.md 则跳过并注明

     代码模式一致性：
     - 审查新代码与项目模式的一致性（文件命名、目录结构、编码风格）
     - 重大偏差生成 SUGGESTION

     ## 四、测试留档检查
     读取 tasks.md 和 test-report.md（如存在）。

     检查逻辑：
     1. 统计 tasks.md 中标注 [test-first] 或 [characterization-first] 的 task 数量
     2. 如果数量为 0：输出 "No TDD tasks — test-report.md check skipped"，结束本节
     3. 如果存在 TDD tasks：检查 test-report.md 是否存在
     4. 如果 test-report.md 不存在：报 CRITICAL "test-report.md missing — TDD results not documented"
     5. 如果存在：逐一检查每个 [test-first]/[characterization-first] task 是否有对应的 ## Task N 节
     6. 检查每个 task 节是否同时包含 🔴 红阶段 和 🟢 绿阶段 两个子节
     7. 缺少任意一项：报 CRITICAL，注明具体缺失的 task 编号和阶段名称
     8. 全部完整：报 "Test report complete: N/N TDD tasks documented"

     ## 输出格式
     ## 验证报告：<name>
     **完整性**: X/Y 任务，N 需求
     **正确性**: M/N 需求已覆盖（或"跳过"）
     **一致性**: 已遵循/存在问题/跳过
     **测试留档**: N/N TDD tasks（或"跳过"）
     ### 问题列表
     - [CRITICAL/WARNING/SUGGESTION/INFO] 具体描述（附文件/行引用）`
   })
   ```

5. **汇总验证报告**

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
- **如果验证通过**：必须转入 **opsx-review** 进行代码审查。这不是建议，是强制要求。
- **如果验证未通过**：列出需要修复的问题，禁止继续后续流程。必须修复后重新执行 opsx-verify。
