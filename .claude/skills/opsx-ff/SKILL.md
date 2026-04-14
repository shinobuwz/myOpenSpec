---
name: opsx-ff
description: 快速创建实现所需的所有产出物。当用户想要快速创建实现所需的所有产出物，而不是逐个创建时使用；如果请求明显是全栈、多模块或多 capability 的复杂需求，先做 `opsx-slice` 切分，再由 ff 推进选中的 slice。
---

提案新变更。快速创建规划产出物，并串起三道强制关卡后进入实施。

完整流程：
```
slice（必要时）
→ 创建 planning artifacts
→ [plan-review: spec↔plan]
→ [tasks]
→ [task-analyze: plan↔tasks]
→ [implement]
→ [verify: tasks↔code]
```

## 输入 / 输出边界

**读取：**
- 用户请求中的变更目标或需求描述
- `openspec/changes/<name>/.openspec.yaml`
- `.aiknowledge/codemap/` 和 `.aiknowledge/pitfalls/`（按需）
- 已存在的规划产出物（如继续已有 change）

**直接写入：**
- `openspec/changes/<name>/.openspec.yaml`
- `proposal.md`
- `design.md`
- `specs/<capability>/spec.md`

**间接副作用（通过下游 skill）：**
- `tasks.md`
- `audit-log.md`
- `.openspec.yaml` 的 gates
- 代码、测试和 `test-report.md`

**边界约束：**
- ff 是编排入口，不依赖虚构的 `ready/blocked` 状态
- ff 不维护独立状态机；权威状态以文件存在性和 gates 为准
- git 提交不是 ff 的隐含步骤；只有用户明确要求时才执行

**输入**：用户的请求应包含变更名称（kebab-case）或对他们想要构建内容的描述。

## 步骤

1. **如果没有提供明确输入，先问清要做什么**

   直接询问用户：
   > "您想要处理什么变更？请描述您想要构建或修复的内容。"

   根据描述推导一个 kebab-case 名称（例如："add user authentication" → `add-user-auth`）。

2. **创建或接续 change**

   如果请求明显涉及多个交付单元，先转入 `opsx-slice`，选定当前轮次只做的 slice，再继续。

   如果同名活动 change 已存在，先确认是继续它还是创建新的。

   如需新建：
   ```bash
   bash .claude/opsx/bin/changes.sh init <name> spec-driven
   ```

3. **知识预加载（index-first）**

   在创建任何产出物之前，先加载共享知识：
   - 读取 `.aiknowledge/codemap/index.md`（如存在），识别目标模块；已覆盖则读对应 `<module>.md`，未覆盖则调用 `opsx-codemap`
   - 读取 `.aiknowledge/pitfalls/index.md`（如存在），识别相关领域；读取命中领域的 `<domain>/index.md`，在产出物创建中规避已知陷阱

4. **创建规划产出物**

   读取 `openspec/changes/<name>/.openspec.yaml` 中的 schema 定义、模板和输出路径，按依赖顺序生成：
   - `proposal.md`
   - `specs/<capability>/spec.md`
   - `design.md`

   规则：
   - 只根据真实已存在的依赖文件推进，不推导 `ready/blocked` 之类的虚构状态
   - 如果同一 change 下存在多个 spec 文件：严格检查所有 `**Trace**: R<number>` 是否跨文件唯一；发现重复时先修正编号，禁止继续
   - 如果在 proposal/specs 阶段再次暴露出多个独立交付单元：暂停 ff，回到 `opsx-slice`
   - 如果上下文不清楚，向用户澄清后继续

5. **执行强制关卡并推进到实施**

   a. **[关卡1] design 生成后，立即执行 plan-review（spec↔plan 审查）**
   - 调用 **opsx-plan-review** skill
   - 如果审查未通过（有 TRACE_GAP 或 ORPHAN）：必须修正 design 后重审，**禁止继续生成 tasks**

   b. **生成 tasks**
   - 关卡1通过后，转入 **opsx-tasks** 生成 `tasks.md`

   c. **[关卡2] tasks 生成后，立即执行 task-analyze（plan↔tasks 审查）**
   - 调用 **opsx-task-analyze** skill
   - 如果审查未通过（有 GAP、MISMATCH 或严重 QUALITY 问题）：必须修正 tasks 后重审，**禁止进入实施**

   d. **进入实施**
   - 关卡1、关卡2均通过后，转入 **opsx-implement**

6. **[关卡3] 实施完成后，执行 verify（tasks↔code 验证）**
   - 调用 **opsx-verify** skill
   - 如果验证未通过：列出需修复的问题，修复后重新验证
   - 验证通过后，可以转入归档

7. **显示最终状态**

   读取 `openspec/changes/<name>/.openspec.yaml`，结合实际文件存在情况，显示当前阶段和已完成产出物。

## 输出

完成所有关卡后，总结：
- 变更名称和位置
- 已创建产出物的列表及简要描述
- 三道关卡审查结果
- 提示："接下来使用 `opsx-archive` 归档变更。"

## 产出物创建指南

- 遵循每个产出物类型的 `.openspec.yaml` 中 `artifacts` 配置的 `instruction` 字段
- Schema 定义了每个产出物应包含的内容，按模板生成，不自行发明额外文件
- 在创建新产出物之前阅读依赖产出物以获取上下文
- `context` 和 `rules` 是生成约束，不是产出物正文，不要复制进文件

## 护栏

- 创建实现所需的规划产出物，并串起后续强制关卡
- 在创建新产出物之前始终阅读依赖产出物
- **三道关卡是强制的，不可跳过**：design 后必须 plan-review，tasks 后必须 task-analyze，实施后必须 verify
- 如果上下文极其不清楚，询问用户，但倾向于做出合理决定保持推进
- 如果同名变更已存在，先确认是继续还是新建
- 每次写入后都检查对应文件是否真实存在
