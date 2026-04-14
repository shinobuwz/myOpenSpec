---
name: opsx-plan
description: 创建 OpenSpec change 并生成规划产出物（proposal/design/specs）。当需求已明确、准备进入规划阶段时使用。
---

规划 Skill。为当前选中的 change root 补齐规划产出物集合；在 grouped change 场景下，它主要消费 slice 已生成的 `proposal.md`，并专注于 `specs/` 与 `design.md`。

## 输入 / 输出边界

**读取：**
- `.aiknowledge/codemap/index.md` + 命中模块（按需）
- `.aiknowledge/pitfalls/index.md` + 命中领域（按需）

**产出：**
- `proposal.md`（新建或基于 slice 已初始化的 proposal 小修）
- `design.md`（新建）
- `specs/<capability>/spec.md`（新建，可多个）
- `.openspec.yaml`（新建，初始化 schema）

**边界约束：**
- plan 只产出规划制品，不生成 `tasks.md`
- plan 不写任何 gates、`audit-log.md`、`test-report.md`、`review-report.md`
- 不要求在 plan 阶段执行 git 提交；只有用户明确要求时才提交
- 如请求明显涉及全栈、多模块、多 capability 或用户正在纠结是否拆分 change，应先转入 `opsx-slice`

## Change Root 解析

- 用户输入的 `<name>` 可以是：
  - 顶层单个 change：`2026-04-14-add-auth`
  - 父 change：`2026-04-14-lucky-guess`
  - subchange 简写：`2026-04-14-lucky-guess/01-auth`
- 执行前必须先运行 `bash .claude/opsx/bin/changes.sh resolve <name>`，得到真实 change root。
- 如果 `<name>` 是父 change，则优先用 `active_subchange`；若为空，再退化到 `suggested_focus`、`recommended_order` 的首项或唯一 subchange。
- 后文所有 `proposal.md`、`design.md`、`specs/`、`tasks.md` 路径，均指 **resolved change root** 下的文件。

## 启动序列

1. 确认需求已经过脑暴或探索阶段的澄清
2. 执行 `bash .claude/opsx/bin/changes.sh` 检查是否已有相关变更（含阶段和进度）
3. 如果用户已经经过 `opsx-slice`，先消费对应 subchange 的 `proposal.md`，只为**当前选中的单一交付单元**做规划
4. 如果用户没有经过 `opsx-slice`，但当前范围明显就是一个单一交付单元，可继续；如果范围明显过大或存在多个弱依赖能力簇，停止并要求先执行 `opsx-slice`
5. 先读 `.aiknowledge/codemap/index.md`，判断目标模块是否已有 codemap；已有则继续读对应 `<module>.md` 和必要的 `chains/*.md`，没有则先调用 `opsx-codemap`
6. 读取 `.aiknowledge/pitfalls/index.md` 和相关领域的 `index.md`，在设计中规避已知陷阱
7. 收集必要的上下文信息

## 流程

### 1. 创建变更
- 如果是未切分的小 change：使用 `bash .claude/opsx/bin/changes.sh init YYYY-MM-DD-<name> spec-driven` 创建新变更目录结构
- 如果是 grouped change：不得重新创建 change；直接在 resolved subchange root 下继续
- **变更名称必须带日期前缀**（如 `2026-04-03-add-auth`），便于按时间追溯
- 名称部分简洁、描述性强，使用 kebab-case

### 2. 指令循环
逐个生成以下产出物，每个都经过用户确认：

**proposal.md** - 提案
- 问题陈述和目标
- 范围界定（做什么、不做什么）
- 成功标准
- grouped change 场景下优先沿用 slice 已生成的 `proposal.md`，只在发现边界偏差时修订

**design.md** - 设计
- 架构方案和关键决策
- 接口定义和数据模型
- 依赖关系和集成点
- **R 编号铁律**：design.md 中出现的所有 R 编号必须来自 specs/ 中的 `**Trace**: R?` 声明，禁止在 design 中自行发明 R 编号。实现细节不需要单独的 R 编号，归入对应需求的实施单元（U）即可
- **实施单元铁律**：每个 `[U?]` 必须包含 `模块边界` 字段，列出涉及的具体文件路径；缺少 `模块边界` 的实施单元视为不完整，不得进入 plan-review

**specs/** - 规格说明
- 按能力拆分的详细规格
- 每个 spec 包含输入、输出、行为描述
- 边缘情况和错误处理
- **颗粒度自检**：每条需求只描述一个独立的可验证行为。如果一条需求中出现"并且"、"同时"、"以及"等连接词，或描述了多个独立场景，应主动拆分为多条需求
- **Trace 唯一性铁律**：当 `specs/` 下存在多个 `spec.md` 时，必须把它们视为同一个 change 的统一编号空间；所有 `**Trace**: R<number>` 必须全局唯一，禁止在不同 spec 文件里重复使用同一个 `R<number>`

### 3. split-or-continue 检查点（proposal + specs 初稿后，design 定稿前）
- 在 proposal 和 specs 初稿形成后，必须再次判断 `opsx-slice` 的结论是否仍然成立；这次判断比启动序列更严格，因为已经看到了 capability 切片和需求分布
- 重点检查：
  - `specs/` 是否已经自然分成多个几乎互不依赖的 capability
  - 这些 capability 是否可以各自拥有独立 proposal / design / tasks / verify 结论
  - 是否某一部分延期时，不应阻塞其余部分交付
  - 是否已经无法在一个 design 中清晰讲清全部决策
  - 是否预期会形成一个**难以一次评审、一次验证、一次实现收敛**的大 change
- **如果命中以上信号**：暂停当前 plan，回到 `opsx-slice` 重新切分；不要硬把多个独立能力继续塞进一个 design
- **如果仍是同一个交付单元**：继续在一个 change 中完成 design，并允许 `specs/` 下保留多个 capability spec

### 4. 工作量护栏
- 同一个 change 可以包含多个 spec，但前提是它仍然能作为**一次完整评审、一次完整任务拆解、一次完整验证**来收敛
- 不要用“同一个 change 下很多 spec 文件”作为拆分依据；要用“是否仍然是一个交付单元”作为依据
- 当 scope 已大到 proposal、design、tasks 任一环节明显失去可读性时，应优先拆 change，而不是继续追加 spec 或 task

### 5. 可选提交
- 如用户明确要求，可在规划制品确认后再执行 git 提交
- 未获明确要求时，不把 git 提交视为 plan 的完成条件

## 完成条件

- 所有产出物已生成并获得用户确认

## 硬性门控

**在 design.md 和 specs/ 生成后，必须转入 opsx-plan-review 进行 spec↔plan 审查。** plan-review 通过后由 opsx-tasks 生成 tasks.md，禁止在 plan skill 内部生成 tasks.md。

## 退出契约

- 输出变更摘要（proposal.md、design.md、specs/ 概述）
- **必须**转入 **opsx-plan-review** 审查 spec↔plan 一致性。这不是建议，是强制要求。
