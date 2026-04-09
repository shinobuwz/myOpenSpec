---
name: openspec-verify
description: 验证实现是否与变更产出物匹配（完整性/正确性/一致性）。实施完成后或归档前使用。
license: MIT
compatibility: 需要 openspec CLI。
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.2.0-cc.4"
---

验证实现是否与变更产出物（规范、任务、设计）匹配。

**输入**：可选指定变更名称。如果省略，检查是否可以从对话上下文中推断。如果模糊或不明确，你**必须**提示获取可用变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 `openspec-cn list --json` 获取可用变更。使用 **AskUserQuestion tool** 让用户选择。

   显示具有实现任务的变更（存在任务产出物）。
   如果可用，包括每个变更使用的 Schema。
   将任务未完成的变更标记为 "(进行中)"。

   **重要提示**：不要猜测或自动选择变更。始终让用户选择。

2. **检查状态以了解 Schema**
   ```bash
   openspec-cn status --change "<name>" --json
   ```
   解析 JSON 以了解：
   - `schemaName`：正在使用的工作流模式
   - 此变更存在哪些产出物

3. **获取变更目录并加载产出物**

   ```bash
   openspec-cn instructions apply --change "<name>" --json
   ```

   这会返回变更目录和上下文文件。从 `contextFiles` 读取所有可用产出物。

4. **并行 subagent 审查**

   三个维度（完整性、正确性、一致性）**完全独立**，使用 Agent tool 并行派遣 3 个 subagent 同时执行。

   在**同一条消息**中发起 3 个 Agent tool 调用（这样它们会并行运行）：

   **Subagent A — 完整性检查**：
   ```
   Agent({
     description: "验证完整性",
     subagent_type: "general-purpose",
     prompt: `检查变更 '<name>' 的完整性。

     读取以下文件：
     <列出 contextFiles 中的 tasks.md 和 specs 路径>

     任务完成情况：
     - 读取 tasks.md，统计 [x] vs [ ] 复选框数量
     - 为每个未完成任务生成 CRITICAL 问题

     规范覆盖率：
     - 读取 openspec/changes/<name>/specs/ 中的增量规范
     - 提取所有需求（"### 需求:"）
     - 对每个需求在代码库中搜索实现证据
     - 未实现的需求生成 CRITICAL 问题

     输出格式：
     ## 完整性检查报告
     **任务**: X/Y 已完成
     **需求覆盖**: M/N
     ### 问题列表
     - [CRITICAL/WARNING/SUGGESTION] 具体描述`
   })
   ```

   **Subagent B — 正确性检查**：
   ```
   Agent({
     description: "验证正确性",
     subagent_type: "general-purpose",
     prompt: `检查变更 '<name>' 的正确性。

     读取以下文件：
     <列出 contextFiles 中的 specs 路径>

     需求实现映射：
     - 对增量规范中的每个需求，搜索代码库确认实现是否符合需求意图
     - 偏差生成 WARNING

     场景覆盖率：
     - 对每个场景（"#### 场景:"），检查代码处理和测试覆盖
     - 未覆盖的场景生成 WARNING

     输出格式：
     ## 正确性检查报告
     **需求映射**: X/Y 符合
     **场景覆盖**: M/N
     ### 问题列表
     - [CRITICAL/WARNING/SUGGESTION] 具体描述`
   })
   ```

   **Subagent C — 一致性检查**：
   ```
   Agent({
     description: "验证一致性",
     subagent_type: "general-purpose",
     prompt: `检查变更 '<name>' 的一致性。

     读取以下文件：
     <列出 contextFiles 中的 design.md 路径>

     设计遵循情况：
     - 如果存在 design.md：提取关键决策，验证代码是否遵循
     - 矛盾生成 WARNING
     - 无 design.md 则跳过并注明

     代码模式一致性：
     - 审查新代码与项目模式的一致性（文件命名、目录结构、编码风格）
     - 重大偏差生成 SUGGESTION

     输出格式：
     ## 一致性检查报告
     **设计遵循**: 是/否/跳过
     **模式一致**: 是/否
     ### 问题列表
     - [CRITICAL/WARNING/SUGGESTION] 具体描述`
   })
   ```

   等待 3 个 subagent 全部返回后，进入汇总步骤。

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
   ```

   **按优先级分类的问题**：

   1. **CRITICAL**（归档前必须修复）：未完成的任务、缺失的需求实现
   2. **WARNING**（应该修复）：规范/设计偏差、缺失的场景覆盖
   3. **SUGGESTION**（最好修复）：模式不一致、小改进

   **最终评估**：
   - 有 CRITICAL 问题 → "发现 X 个关键问题。归档前请修复。"
   - 只有警告 → "没有关键问题。有 Y 个警告需要考虑。可以归档（但建议改进）。"
   - 全部通过 → "所有检查通过。可以归档。"

**优雅降级**

- 如果只存在 tasks.md：仅派遣 Subagent A（完整性），跳过 B 和 C
- 如果存在任务 + 规范：派遣 A + B，跳过 C
- 如果存在完整产出物：三个 subagent 全部派遣
- 始终注明跳过了哪些检查以及原因

**验证启发式方法**

- 不确定时，优先使用 SUGGESTION 而非 WARNING，WARNING 而非 CRITICAL
- 每个问题都必须有具体的、可操作的建议（附文件/行引用）
- 不要使用模糊的建议，如 "考虑审查"

## 退出契约

- 输出验证报告
- **如果验证通过**：必须转入 **openspec-review** 进行代码审查。这不是建议，是强制要求。
- **如果验证未通过**：列出需要修复的问题，禁止继续后续流程。必须修复后重新执行 openspec-verify。
