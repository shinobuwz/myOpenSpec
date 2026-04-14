---
name: opsx-continue
description: 恢复中断的 OpenSpec 工作流。自动检测当前 change 的真实状态，并路由到下一合法步骤。
---

恢复一个已经开始但中断的 OpenSpec change。

这个 skill 不再维护另一套“每次推进一个产出物”的独立流程。它的职责只有一个：**读取当前 change 的真实状态，然后恢复到下一步唯一合法动作。**

## 输入 / 输出边界

**读取：**
- `openspec/changes/<name>/.openspec.yaml`
- `proposal.md`、`design.md`、`specs/`、`tasks.md`、`test-report.md` 的存在状态
- `.aiknowledge/codemap/` 和 `.aiknowledge/pitfalls/`（仅在补规划制品时按需读取）

**直接写入：**
- 仅当缺失规划制品时，补齐其中一个：`proposal.md` / `specs/<capability>/spec.md` / `design.md`

**间接副作用（通过转入下游 skill）：**
- `audit-log.md`
- `.openspec.yaml` 的 gates
- `tasks.md`
- 代码和测试文件

**边界约束：**
- continue 只恢复下一步唯一合法动作，不虚构状态机字段
- 如已进入后续 stage，continue 自身不直接写 later-stage gates 或审查报告

## 真实状态来源

只使用仓库中真实存在、可验证的状态：

- `openspec/changes/<name>/.openspec.yaml` 中的 `schema` 和 `gates.*`
- `proposal.md`、`design.md`、`tasks.md` 是否存在
- `specs/` 下是否已有 `spec.md`
- `tasks.md` 中是否还有未完成复选框
- `test-report.md` 是否存在（仅作验证辅助事实，不作为路由前提）

**步骤**

1. **确定要恢复的 change**

   如果用户显式提供了 change 名称，使用它。

   如果没有提供：
   - 运行 `bash .claude/opsx/bin/changes.sh list` 查看活动 change
   - 如果没有活动 change：停止恢复流程；若需求尚未切分，提示先用 `opsx-slice`，否则改用 `opsx-plan` 创建新 change
   - 如果只有 1 个活动 change：自动选择它
   - 如果有多个活动 change：向用户询问要恢复哪个 change，不要猜测

2. **读取最小恢复状态**

   读取 `openspec/changes/<name>/.openspec.yaml`，以及以下真实文件状态：

   - `proposal.md` 是否存在
   - `specs/` 下是否至少存在一个 `spec.md`
   - `design.md` 是否存在
   - `tasks.md` 是否存在
   - `gates.plan-review` 是否存在
   - `gates.task-analyze` 是否存在
   - `gates.verify` 是否存在
   - `gates.review` 是否存在
   - 如果存在 `tasks.md`：统计 `- [ ]` 和 `- [x]` 数量

   **禁止**依赖仓库中并不存在的 `artifacts.status`、`ready/blocked` 等虚构状态。

3. **如果还处于规划阶段，继续补齐下一个缺失制品**

   仅在以下三种情况下，本 skill 自己继续生成产出物；每次只补一个：

   - 缺 `proposal.md` → 生成 `proposal.md`
   - 已有 `proposal.md` 但没有任何 `specs/<capability>/spec.md` → 生成 `specs/`
   - 已有 `proposal.md` + `specs/` 但缺 `design.md` → 生成 `design.md`

   如果要补规划制品，执行以下最小上下文加载：
   - 读取 `openspec/config.yaml` 中的 `context:` 和 `rules:`
   - 读取已存在的依赖制品
   - 读取 `.aiknowledge/codemap/index.md`，按需读取命中模块
   - 读取 `.aiknowledge/pitfalls/index.md`，按需读取命中领域

   生成完成后立即停止，并输出当前进度与下一步。

4. **如果规划制品已齐，按固定判定表恢复下一步**

   使用下面的顺序判断，命中第一条就执行，不继续往后猜：

   - `design.md` 已存在，但缺 `gates.plan-review` → 转入 `opsx-plan-review`
   - `gates.plan-review` 已存在，但缺 `tasks.md` → 转入 `opsx-tasks`
   - `tasks.md` 已存在，但缺 `gates.task-analyze` → 转入 `opsx-task-analyze`
   - `gates.task-analyze` 已存在，且 `tasks.md` 仍有未完成项 → 转入 `opsx-implement`
   - `tasks.md` 全部完成，但缺 `gates.verify` → 转入 `opsx-verify`
   - `gates.verify` 已存在，但缺 `gates.review` → 转入 `opsx-review`
   - `gates.review` 已存在 → 转入 `opsx-archive`

5. **输出恢复结果**

   每次恢复后，输出：
   - 当前 change 名称
   - 关键状态摘要（哪些制品已存在，哪些 gate 已通过）
   - 本次执行了什么
   - 下一步是什么

## 判定优先级（唯一合法顺序）

```text
proposal
-> specs
-> design
-> plan-review
-> tasks
-> task-analyze
-> implement
-> verify
-> review
-> archive
```

## 护栏

- `opsx-continue` 不是新的主线入口，只是恢复入口
- 不要绕过 gate 直接跳到更后面的 skill
- 不要依赖不存在的元数据状态机
- 如果发现状态自相矛盾（例如 `gates.review` 存在但 `gates.verify` 缺失），先停下并提示用户修复状态，再继续
