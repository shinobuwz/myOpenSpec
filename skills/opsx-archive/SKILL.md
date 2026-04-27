---
name: opsx-archive
description: 归档已完成的变更。当用户想要在实现完成后最终确定并归档变更时使用。
---

## Change Root 解析

- `<name>` 可以是单个 change、父 change 或 `group/subchange` 简写。
- 执行前先运行 `opsx changes resolve <name>` 获取真实 change root。
- 后文所有读取路径、产出物检查、任务检查、spec 统计和归档源路径，均以 resolved change root 为准，而不是用户输入的原始 `<name>`。
- grouped change 场景下，archive 的唯一归档单元是 subchange；父 group 只是运行期路由容器，不是独立归档单元。
- 如果 resolved change root 是 `openspec/changes/<group>/subchanges/<subchange>`，归档目标必须是顶层 `openspec/changes/archive/<archive-dir>/`，其中 `<archive-dir>` 由 `<group>-<subchange>` 计算得到。
- 严禁在活动父 group 下创建 `openspec/changes/<group>/subchanges/archive/`，也严禁把 subchange 归档到父 group 内部。

归档已完成的变更。

**输入**：可选指定变更名称。如果省略，检查是否可以从对话上下文中推断。如果模糊或不明确，你**必须**提示获取可用变更。

## 输入 / 输出边界

**读取：**
- `resolved change root/.openspec.yaml`
- `resolved change root/tasks.md`（如存在）
- `resolved change root/specs/**/*.md`（仅做存在性和数量检查）

**直接写入：**
- `openspec/changes/archive/<archive-dir>/`（通过目录移动归档）
- `openspec/changes/<group>/.openspec.group.yaml`（仅当归档 subchange 且父 group 仍存在时，回写父 group 路由状态）

**间接副作用（通过下游 skill）：**
- `.aiknowledge/pitfalls/`
- `.aiknowledge/codemap/`

**边界约束：**
- archive 自身不改写归档目录中的 `proposal.md`、`design.md`、`specs/`、`tasks.md`
- archive 不重写任何 gates、`audit-log.md`、`review-report.md`、`test-report.md`
- git 提交不是 archive 的强制步骤；只有用户明确要求时才执行
- grouped change 的活动态父目录只保留 `.openspec.group.yaml` 与 `subchanges/`
- grouped change 的父目录中，`index.md`、父级 `audit-log.md` 及其他非最小文件都视为可删除残留

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 `ls openspec/changes/ | grep -v archive` 获取可用变更。主动询问用户让用户选择。

   仅显示活动变更（未归档的）。
   如果可用，包括每个变更使用的 Schema。

   **重要提示**：不要猜测或自动选择变更。始终让用户选择。

2. **校验前置关卡**

   读取 resolved change root 下的 `.openspec.yaml`，**校验 `gates.verify` 和 `gates.review` 字段均存在**。任一缺失则拒绝执行并提示"请先完成缺失的关卡：opsx-verify / opsx-review"。此校验不可被用户确认绕过。

3. **检查产出物完成状态**

   读取 resolved change root 下的 `.openspec.yaml` 获取 schema 定义，并按 schema 期望的产出物检查对应文件是否存在。

   **如果发现缺失的产出物文件：**
   - 显示列出缺失项的警告
   - 向用户确认是否仍要继续
   - 如果用户确认，则继续

4. **检查任务完成状态**

   阅读任务文件（通常是 `tasks.md`）以检查未完成的任务。

   统计标记为 `- [ ]`（未完成）与 `- [x]`（已完成）的任务。

   **如果发现未完成的任务：**
   - 显示警告，显示未完成任务的数量
   - 主动询问用户，确认用户是否要继续
   - 如果用户确认，则继续

   **如果没有任务文件存在：** 继续，无需任务相关警告。

5. **检查 `specs/` 产出**

   检查 resolved change root 下 `specs/` 中是否存在 spec 文件。

   **如果存在 spec 文件：**
   - 统计 spec 文件数量
   - 在最终摘要中注明“本次归档保留了 N 个 spec 文件”

   **如果不存在 spec 文件：**
   - 继续归档

6. **执行归档**

   如果归档目录不存在，则创建它：
   ```bash
   mkdir -p openspec/changes/archive
   ```

   使用 resolved change root 计算归档 slug 与目标目录：

   - 单个 change：resolved change root 为 `openspec/changes/<change>`，则 `<archive-slug>=<change>`
   - subchange：resolved change root 为 `openspec/changes/<group>/subchanges/<subchange>`，则 `<archive-slug>=<group>-<subchange>`

   然后计算归档目录名 `<archive-dir>`：
   - 如果 `<archive-slug>` 已经以 `YYYY-MM-DD-` 开头，则 `<archive-dir>=<archive-slug>`
   - 否则 `<archive-dir>=<today>-<archive-slug>`

   这个规则防止把已带日期的 change（例如 `2026-04-27-demo`）归档成 `2026-04-27-2026-04-27-demo`。

   grouped change 场景下，归档的是 resolved subchange root，而不是父 group 目录本身。

   **检查目标是否已存在：**
   - 如果是：失败并报错，建议重命名现有归档或使用不同日期
   - 如果否：将变更目录移动到归档

   ```bash
   mv <resolved-change-root> openspec/changes/archive/<archive-dir>
   ```

   如果此次归档的是 subchange，移动完成后不得在父 group 内新增任何 `archive/` 目录。

7. **收尾父 group（仅 subchange 归档时）**

   如果此次归档的是 `openspec/changes/<group>/subchanges/<subchange>`：

   - 扫描 `openspec/changes/<group>/subchanges/` 中剩余的 subchange
   - 如果仍有剩余 subchange：
     - 将 `.openspec.group.yaml` 中的 `active_subchange` 和 `suggested_focus` 更新为下一个有效 subchange
     - 将 `recommended_order` 收敛为“仍存在的 subchange 列表”，保留原有顺序；若原顺序为空或已失效，则按目录排序回填
     - 删除父 group 根目录下除 `.openspec.group.yaml` 与 `subchanges/` 之外的所有文件和空目录
   - 如果已经没有剩余 subchange：
     - 删除整个 `openspec/changes/<group>/` 目录
     - 不创建父 group 归档目录；因为所有有价值的上下文都已经落在各自的 archived subchange 中

   **清理约束：**
   - 父 group 是最小运行态容器；活动态只允许保留 `.openspec.group.yaml` 与 `subchanges/`
   - 不删除仍在使用的 `subchanges/<remaining>/`
   - 删除父 group 根目录中的 `index.md`、`audit-log.md` 及其他非最小残留，不做提示确认

8. **显示摘要**

   显示归档完成摘要，包括：
   - 变更名称
   - 使用的 Schema
   - 归档位置
   - 保留的 spec 文件数量（如果适用）
   - 关于任何警告的说明（未完成的产出物/任务）

**成功时的输出**

```
## 归档完成

**变更：** <change-name>
**模式：** <schema-name>
**归档至：** openspec/changes/archive/<archive-dir>/
**specs：** <N> 个文件（如存在）

如存在未完成产出物或未完成任务，已在本次归档摘要中明确告知。
```

**归档后强制执行（按序）**

归档目录移动成功后，依次执行以下步骤，**全部强制，不可跳过**：

**9. 知识沉淀（强制）**

调用 **opsx-knowledge** skill，将本次变更的可复用经验写入 `.aiknowledge/pitfalls/`。
这一步不只是“新增条目”，还包括：
- 刷新命中旧条目的 `last_verified_at`
- 发现旧条目失效时标记 `superseded` / `deprecated`

启动一个通用 subagent：
> "调用 opsx-knowledge。上下文：刚刚归档了变更 '<logical-change-name>'，归档路径为 `openspec/changes/archive/<archive-dir>/`。从本次变更的实现、修复和审查发现中提取可复用经验。尽量复用已有的 pitfall 条目，对仍然有效的知识刷新 `last_verified_at`，对已失效的条目标记 `superseded` 或 `deprecated`，而不是静默覆盖。"

**10. Codemap 更新（强制）**

启动一个通用 subagent：
> "调用 opsx-codemap。上下文：刚刚归档了变更 '<logical-change-name>'，归档路径为 `openspec/changes/archive/<archive-dir>/`。为本次变更影响的模块创建或更新 codemap。若现有 codemap 条目与代码不一致，先将其标记为 `stale`，验证后恢复为 `active` 并更新 `last_verified_at`。若 codemap 尚不存在，从头创建——不可跳过。"

**11. Git 操作（可选）**

如用户明确要求，可在归档完成后再执行 git 提交、打 tag 或推送远程。
未获明确要求时，不把 git 操作视为 archive 的完成条件。

## 退出契约

- 输出归档完成摘要（步骤 7 的格式）
- **归档后强制执行**（按序，不可跳过）：
  1. 必须调用 **opsx-knowledge** 沉淀经验。这不是建议，是强制要求。
  2. 必须调用 **opsx-codemap** 更新架构认知。这不是建议，是强制要求。
  3. 告知用户归档路径和可选 git 操作（commit/tag/push），git 仅在用户明确要求时执行。

**防护措施**
- 如果未提供变更，始终提示选择
- 使用产出物图（读取 `.openspec.yaml` 并检查文件存在）进行完成度检查
- 不要在警告时阻止归档 - 只需告知并确认
- 移动到归档时保留 .openspec.yaml（它与目录一起移动）
- grouped change 归档时，源路径必须是 resolved subchange root；目标路径必须落在顶层 `openspec/changes/archive/`
- grouped change 归档完成后，必须同步清理父 group 的路由状态；不得让 `active_subchange` / `suggested_focus` / `recommended_order` 继续指向已归档 subchange
- grouped change 在活动态只保留 `.openspec.group.yaml` 与 `subchanges/`；最后一个 subchange 归档后直接删除父 group 目录
- 显示清晰的操作摘要
- 如果存在 `specs/`，只做存在性/数量检查
