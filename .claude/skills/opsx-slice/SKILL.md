---
name: opsx-slice
description: 在规划前做 change 切分与交付边界判定。凡是涉及全栈、多模块、多 capability、前后端联动、用户明确提到“拆分/切分/slice/分模块/是否要多个 change/任务太大”等情况时，都应优先使用这个 skill；它负责判断应该保持一个 change 还是拆成多个 change，并给出每个 slice 的边界、依赖和下一步建议。
---

切分 Skill。它不是设计，也不是实现；它负责把一个模糊的大需求压缩成一个父 change + 多个可独立推进的 subchange，并为每个 subchange 初始化正式 `proposal.md`。

## 输入 / 输出边界

**读取：**
- 用户当前需求、目标、约束
- `openspec/changes/` 下现有活动 change（判断是否重复或冲突）
- `.aiknowledge/codemap/index.md` + 命中模块（按需）
- `.aiknowledge/pitfalls/index.md` + 命中领域（按需）

**默认写入：**
- `openspec/changes/<group>/.openspec.group.yaml`
- `openspec/changes/<group>/subchanges/<name>/.openspec.yaml`
- `openspec/changes/<group>/subchanges/<name>/proposal.md`

**边界约束：**
- slice 创建父 change 容器与 subchange proposal，但不生成 `design.md`、`specs/`、`tasks.md`
- slice 不写 gates、`test-report.md`、`review-report.md`
- 父 group 是最小运行态容器；slice 不写父级 `index.md`、`audit-log.md`
- slice 的目标是定义 subchange 的边界、依赖和执行拓扑，而不是强行决定下一步必须执行哪个 plan

## 核心问题

收到需求后，优先回答这 4 个问题：

1. 这是否还是一个**单一交付单元**？
2. 如果不是，最自然的切分轴是什么：用户能力、业务能力、系统边界、还是技术探针？
3. 哪些部分必须一起做，哪些部分可以延期而不阻塞当前价值交付？
4. 这些 subchange 的执行关系是串行、并行，还是混合？

## 工作流程

### 1. 建立最小上下文

1. 运行 `bash .claude/opsx/bin/changes.sh list`，确认是否已有相似活动 change
2. 读取 `.aiknowledge/codemap/index.md`，判断需求涉及哪些模块；命中则继续读取对应 codemap
3. 读取 `.aiknowledge/pitfalls/index.md`，识别是否存在影响切分的已知风险
4. 只收集“判定切分和 proposal 定界”所必需的信息，不要过早进入详细设计

### 2. 识别能力簇

把需求拆成若干 capability cluster。每个 cluster 至少写清：

- 用户价值
- 依赖的模块或子系统
- 主要输入/输出
- 是否依赖其他 cluster 先落地

优先按“用户可感知能力”切，不要先按“前端 / 后端 / 数据库”切。

### 3. 做 change cohesion 判定

对每个能力簇，检查以下信号：

- 是否可以独立验证
- 是否可以独立演示或独立上线
- 其中一个延期时，是否不应阻塞其余部分
- 是否共享同一组关键设计决策
- 是否能在一次 `implement -> verify` 周期内稳定收敛

### 4. 落地父 change 与 subchanges

当结论为 `SPLIT_MULTI_CHANGE` 时，必须执行以下落地动作：

1. 运行 `bash .claude/opsx/bin/changes.sh init-group <group-name>` 创建父 change 容器
2. 为每个 subchange 运行 `bash .claude/opsx/bin/changes.sh init-subchange <group-name> <subchange-name> spec-driven`
3. 为每个 subchange 写正式 `proposal.md`
4. 写入 group 级拓扑信息：`execution_mode`、`recommended_order`、可选 `suggested_focus`

当结论为 `KEEP_ONE_CHANGE` 时：

1. 直接创建单个 change 或单个 subchange proposal
2. 下一步进入 `opsx-plan`

当结论为 `NEED_EXPLORE_FIRST` 时：

1. 不创建任何 change 结构
2. 转回 `opsx-explore`

## 输出格式

始终使用这个结构：

```markdown
## 切分结论

### 总判断
- 结论：KEEP_ONE_CHANGE | SPLIT_MULTI_CHANGE | NEED_EXPLORE_FIRST
- 理由：...

### 能力簇
| 簇 | 用户价值 | 主要模块 | 独立交付性 | 备注 |
|----|----------|----------|------------|------|

### 推荐切分 / Subchanges
1. `<slice-name>`
   - 范围：...
   - 不包含：...
   - 依赖：...
   - 建议 subchange 名：`01-...`
   - proposal 关注点：...

### 执行拓扑
- 父 change：`YYYY-MM-DD-...`
- execution_mode：`serial | parallel | mixed`
- recommended_order：`01-a -> 02-b -> 03-c`（如适用）
- suggested_focus：`01-a`（可选）
- 现在应该进入：`opsx-plan <group-name>` / `opsx-plan <group-name>/<subchange-name>` / `opsx-explore`
- 暂不进入的部分：...
```

如果结论是 `KEEP_ONE_CHANGE`，也必须写出“为什么不拆”。

## proposal.md 模板要求

slice 为每个 subchange 初始化的 `proposal.md` 至少包含：

- Goal
- In Scope
- Out of Scope
- Depends On
- Done Means

proposal 的职责是固定 subchange 的关注点和边界；后续 `opsx-plan` 可以小修，但不应从零重写。

## 护栏

- 不要把“前端一个 change、后端一个 change”当作默认切法；优先按交付价值切
- 同一个用户能力的前后端通常应留在同一个 change 内
- 如果几个模块必须围绕同一条主链路一起验证，就不要为了目录整齐强拆
- 如果你已经发现 2 个及以上独立交付单元，必须创建父 change + subchanges，而不是建议用户直接进入一个大 `opsx-plan`
- 如果只是 task 粒度不够细，不要误判成多 change；那是 `opsx-tasks` / `opsx-task-analyze` 的问题
- 不要为同一个 subchange 维护第二份 proposal 草稿；唯一 proposal 放在 `subchanges/<name>/proposal.md`

## 退出契约

- 输出切分报告
- 持久化父级 `.openspec.group.yaml` 和各 subchange `proposal.md`
- 明确指出”下一步应使用哪个 skill”
- 若结论为 `SPLIT_MULTI_CHANGE`：必须写清执行拓扑；`active_subchange` 仅在用户明确选择当前焦点或已有唯一运行态焦点时才写入
- 若结论为 `KEEP_ONE_CHANGE`：可直接转入 `opsx-plan`
- 若结论为 `NEED_EXPLORE_FIRST`：必须先转入 `opsx-explore`
