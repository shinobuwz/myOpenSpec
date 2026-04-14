---
name: opsx-slice
description: 在规划前做 change 切分与交付边界判定。凡是涉及全栈、多模块、多 capability、前后端联动、用户明确提到“拆分/切分/slice/分模块/是否要多个 change/任务太大”等情况时，都应优先使用这个 skill；它负责判断应该保持一个 change 还是拆成多个 change，并给出每个 slice 的边界、依赖和下一步建议。
---

切分 Skill。它不是规划，也不是实现；它只负责把一个模糊的大需求压缩成可进入 `opsx-plan` 的单一交付单元。

## 输入 / 输出边界

**读取：**
- 用户当前需求、目标、约束
- `openspec/changes/` 下现有活动 change（判断是否重复或冲突）
- `.aiknowledge/codemap/index.md` + 命中模块（按需）
- `.aiknowledge/pitfalls/index.md` + 命中领域（按需）

**默认写入：**
- 无

**在用户明确同意下可写入：**
- `proposal.md`
- `design.md`
- `specs/<capability>/spec.md`

**边界约束：**
- slice 默认只做分析和定界，不创建 change，不写 `.openspec.yaml`
- slice 不生成 `tasks.md`，不写 gates，不写审查报告
- slice 的目标是决定“接下来应该为哪个交付单元执行 `opsx-plan`”，而不是把设计细节写满

## 核心问题

收到需求后，优先回答这 4 个问题：

1. 这是否还是一个**单一交付单元**？
2. 如果不是，最自然的切分轴是什么：用户能力、业务能力、系统边界、还是技术探针？
3. 哪些部分必须一起做，哪些部分可以延期而不阻塞当前价值交付？
4. 哪个 slice 最适合作为当前轮次进入 `opsx-plan`？

## 工作流程

### 1. 建立最小上下文

1. 运行 `bash .claude/opsx/bin/changes.sh list`，确认是否已有相似活动 change
2. 读取 `.aiknowledge/codemap/index.md`，判断需求涉及哪些模块；命中则继续读取对应 codemap
3. 读取 `.aiknowledge/pitfalls/index.md`，识别是否存在影响切分的已知风险
4. 只收集“判定切分”所必需的信息，不要过早进入详细设计

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

### 4. 给出结论

只允许给出以下三类结论之一：

- **KEEP_ONE_CHANGE**：仍然是一个交付单元，进入单个 `opsx-plan`
- **SPLIT_MULTI_CHANGE**：已经存在多个独立交付单元，必须拆成多个 change
- **NEED_EXPLORE_FIRST**：当前未知数太大，先回到 `opsx-explore` 或做技术探针，再决定切分

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

### 推荐切分
1. `<slice-name>`
   - 范围：...
   - 不包含：...
   - 依赖：...
   - 建议 change 名：`YYYY-MM-DD-...`

### 当前建议
- 现在应该进入：`opsx-plan <recommended-slice>` / `opsx-explore`
- 暂不进入的部分：...
```

如果结论是 `KEEP_ONE_CHANGE`，也必须写出“为什么不拆”。

## 护栏

- 不要把“前端一个 change、后端一个 change”当作默认切法；优先按交付价值切
- 同一个用户能力的前后端通常应留在同一个 change 内
- 如果几个模块必须围绕同一条主链路一起验证，就不要为了目录整齐强拆
- 如果你已经发现 2 个及以上独立交付单元，不要建议用户直接进入一个大 `opsx-plan`
- 如果只是 task 粒度不够细，不要误判成多 change；那是 `opsx-tasks` / `opsx-task-analyze` 的问题

## 退出契约

- 输出切分报告
- 明确指出“下一步应使用哪个 skill”
- 若结论为 `SPLIT_MULTI_CHANGE`：必须先选定一个 slice，再进入 `opsx-plan`
- 若结论为 `KEEP_ONE_CHANGE`：可直接转入 `opsx-plan`
- 若结论为 `NEED_EXPLORE_FIRST`：必须先转入 `opsx-explore`
