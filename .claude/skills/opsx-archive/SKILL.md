---
name: opsx-archive
description: 归档已完成的变更。当用户想要在实现完成后最终确定并归档变更时使用。
---

归档已完成的变更。

**输入**：可选指定变更名称。如果省略，检查是否可以从对话上下文中推断。如果模糊或不明确，你**必须**提示获取可用变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 `ls openspec/changes/ | grep -v archive` 获取可用变更。使用 **AskUserQuestion tool** 让用户选择。

   仅显示活动变更（未归档的）。
   如果可用，包括每个变更使用的 Schema。

   **重要提示**：不要猜测或自动选择变更。始终让用户选择。

2. **校验前置关卡**

   读取 `openspec/changes/<name>/.openspec.yaml`，**校验 `gates.verify` 和 `gates.review` 字段均存在**。任一缺失则拒绝执行并提示"请先完成缺失的关卡：opsx-verify / opsx-review"。此校验不可被用户确认绕过。

3. **检查产出物完成状态**

   读取 `openspec/changes/<name>/.openspec.yaml` 获取 schema 定义，然后检查各产出物文件是否已存在来判断产出物完成情况。

   解析以了解：
   - `schemaName`：正在使用的工作流
   - `artifacts`：产出物列表及其状态（`done` 或其他）

   **如果有任何产出物未 `done`：**
   - 显示列出未完成产出物的警告
   - 使用 **AskUserQuestion tool** 确认用户是否要继续
   - 如果用户确认，则继续

4. **检查任务完成状态**

   阅读任务文件（通常是 `tasks.md`）以检查未完成的任务。

   统计标记为 `- [ ]`（未完成）与 `- [x]`（已完成）的任务。

   **如果发现未完成的任务：**
   - 显示警告，显示未完成任务的数量
   - 使用 **AskUserQuestion tool** 确认用户是否要继续
   - 如果用户确认，则继续

   **如果没有任务文件存在：** 继续，无需任务相关警告。

5. **评估增量规范同步状态**

   检查 `openspec/changes/<name>/specs/` 中的增量规范。如果不存在，则在没有同步提示的情况下继续。

   **如果存在增量规范：**
   - 将每个增量规范与其在 `openspec/specs/<capability>/spec.md` 对应的各主规范进行比较
   - 确定将应用哪些更改（添加、修改、移除、重命名）
   - 在提示前显示综合摘要

   **提示选项：**
   - 如果需要更改："立即同步（推荐）"、"归档而不同步"
   - 如果已同步："立即归档"、"仍然同步"、"取消"

   如果用户选择同步，直接根据上面的增量分析在当前流程内完成规范同步，然后继续归档。无论选择如何，都继续归档。

6. **执行归档**

   如果归档目录不存在，则创建它：
   ```bash
   mkdir -p openspec/changes/archive
   ```

   使用当前日期生成目标名称：`YYYY-MM-DD-<change-name>`

   **检查目标是否已存在：**
   - 如果是：失败并报错，建议重命名现有归档或使用不同日期
   - 如果否：将变更目录移动到归档

   ```bash
   mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
   ```

7. **显示摘要**

   显示归档完成摘要，包括：
   - 变更名称
   - 使用的 Schema
   - 归档位置
   - 规范是否已同步（如果适用）
   - 关于任何警告的说明（未完成的产出物/任务）

**成功时的输出**

```
## 归档完成

**变更：** <change-name>
**模式：** <schema-name>
**归档至：** openspec/changes/archive/YYYY-MM-DD-<name>/

所有产出物已完成。所有任务已完成。
```

**归档后强制执行（按序）**

归档目录移动成功后，依次执行以下步骤，**全部强制，不可跳过**：

**8. 知识沉淀（强制）**

调用 **opsx-knowledge** skill，将本次变更的可复用经验写入 `.aiknowledge/pitfalls/`。
这一步不只是“新增条目”，还包括：
- 刷新命中旧条目的 `last_verified_at`
- 发现旧条目失效时标记 `superseded` / `deprecated`

使用 Task tool（subagent_type: "general-purpose"）：
> "使用 Skill tool 调用 opsx-knowledge。上下文：刚刚归档了变更 '<name>'。从本次变更的实现、修复和审查发现中提取可复用经验。尽量复用已有的 pitfall 条目，对仍然有效的知识刷新 `last_verified_at`，对已失效的条目标记 `superseded` 或 `deprecated`，而不是静默覆盖。"

**9. Codemap 更新（强制）**

使用 Task tool（subagent_type: "general-purpose"）：
> "使用 Skill tool 调用 opsx-codemap。上下文：刚刚归档了变更 '<change-name>'。为本次变更影响的模块创建或更新 codemap。若现有 codemap 条目与代码不一致，先将其标记为 `stale`，验证后恢复为 `active` 并更新 `last_verified_at`。若 codemap 尚不存在，从头创建——不可跳过。"

**10. Git 操作（强制）**

```bash
git add -A
git commit -m "archive: <change-name>"
```

如果用户需要打 tag 或推送远程：
```bash
git tag <version>          # 可选，询问用户
git push                   # 可选，询问用户是否推送
```

**防护措施**
- 如果未提供变更，始终提示选择
- 使用产出物图（读取 `.openspec.yaml` 并检查文件存在）进行完成度检查
- 不要在警告时阻止归档 - 只需告知并确认
- 移动到归档时保留 .openspec.yaml（它与目录一起移动）
- 显示清晰的操作摘要
- 如果请求同步，在当前 skill 内直接执行同步逻辑，不依赖额外 skill
- 如果存在增量规格说明，始终运行同步评估并在提示前显示综合摘要
- **归档后三步（knowledge → codemap → git）是强制序列**
