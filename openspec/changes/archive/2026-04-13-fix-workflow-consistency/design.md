## 上下文

OpenSpec 工作流由 16 个 opsx skill 组成，通过退出契约串联成流水线。审计发现三类系统性问题：门控可跳过、知识预加载不一致、描述冲突。本次变更直接修改 SKILL.md 文件来修复这些问题。

变更对象全部是 `.claude/skills/opsx-*/SKILL.md` 纯 Markdown 文件，不涉及可执行代码。因此"门控状态写入"通过在 skill 指令中增加 bash 命令来实现（操作 `.openspec.yaml`），不需要修改 `changes.sh` 脚本。

## 目标 / 非目标

**目标：**
- 让门控结论可被后续 skill 程序化验证
- 让所有规划路径（plan/continue/ff）具备相同的知识预加载行为
- 消除已识别的描述冲突

**非目标：**
- 不修改 `changes.sh` 或 `schema.yaml` 的结构
- 不改变工作流的阶段划分或产出物类型
- 不新增 skill

## 需求追踪

- [R1] -> [U1] 门控写入
- [R2] -> [U2] 门控校验
- [R3] -> [U3] 退出契约路由修正
- [R9] -> [U3] skill 定位描述歧义修正
- [R8] -> [U3] 步骤编号修正
- [R4] -> [U4] continue/ff 知识预加载
- [R5] -> [U5] bugfix pitfalls 读取
- [R6] -> [U6] explore pitfalls 读取
- [R7] -> [U7] L3 消费指引

## 实施单元

### [U1] 门控写入指令
- 关联需求: [R1]
- 模块边界: `opsx-plan-review/SKILL.md`、`opsx-task-analyze/SKILL.md`、`opsx-verify/SKILL.md`、`opsx-review/SKILL.md`
- 验证方式: 检查每个 skill 的退出契约中包含 `echo` 或 `yq` 写入 gates 字段的 bash 命令
- 知识沉淀: 纯指令层面的状态持久化模式——用 yaml 写入替代文字约束

### [U2] 门控校验指令
- 关联需求: [R2]
- 模块边界: `opsx-tasks/SKILL.md`、`opsx-implement/SKILL.md`、`opsx-archive/SKILL.md`
- 验证方式: 检查每个 skill 的启动序列中包含读取 `.openspec.yaml` gates 字段并在缺失时拒绝执行的指令
- 知识沉淀: 前置条件校验模式——启动序列首步即校验

### [U3] 描述冲突修正
- 关联需求: [R3] [R8] [R9]
- 模块边界: `opsx-task-analyze/SKILL.md`、`opsx-continue/SKILL.md`、`opsx-archive/SKILL.md`、`opsx-tdd/SKILL.md`、`opsx-apply/SKILL.md`、`opsx-tasks/SKILL.md`、`opsx-bugfix/SKILL.md`
- 验证方式: 逐文件检查 description/退出契约/步骤编号是否已修正
- 知识沉淀: 无

### [U4] continue/ff 知识预加载
- 关联需求: [R4]
- 模块边界: `opsx-continue/SKILL.md`、`opsx-ff/SKILL.md`
- 验证方式: 检查两个 skill 中包含 codemap + pitfalls index-first 读取步骤
- 知识沉淀: 规划路径一致性原则——任何能生成 design 的 skill 都必须预加载知识库

### [U5] bugfix pitfalls 读取
- 关联需求: [R5]
- 模块边界: `opsx-bugfix/SKILL.md`
- 验证方式: 检查步骤 2 和步骤 3 之间插入了 pitfalls 读取指令
- 知识沉淀: 无

### [U6] explore pitfalls 读取
- 关联需求: [R6]
- 模块边界: `opsx-explore/SKILL.md`
- 验证方式: 检查源码搜索强制协议中增加了 pitfalls 读取步骤
- 知识沉淀: 无

### [U7] L3 消费指引
- 关联需求: [R7]
- 模块边界: `opsx-tdd/SKILL.md`、`opsx-apply/SKILL.md`、`opsx-implement/SKILL.md`、`opsx-review/SKILL.md`
- 验证方式: 检查每个 skill 的 pitfalls 读取指令中包含"L2 命中后继续读 L3 条目"的要求
- 知识沉淀: 三层披露的消费侧协议——写了 L3 就必须消费 L3

## 决策

1. **gates 写入方式**：使用 `yq` 命令直接操作 `.openspec.yaml`，而非修改 `changes.sh`。理由：保持 changes.sh 的职责单一（脚手架管理），门控写入是 skill 层面的逻辑。
2. **不合并 apply 和 implement**：保留两个 skill，通过 description 明确区分。理由：两者的 TDD 执行力度不同，合并会丢失灵活性。

## 风险 / 权衡

- [风险] `yq` 命令在某些环境中不可用 → 缓解：同时提供 `sed` 回退方案或使用 python -c 内联脚本
- [风险] 现有进行中的变更没有 gates 字段 → 缓解：校验逻辑在字段缺失时提示"关卡未执行"而非崩溃

## 知识沉淀

- 门控状态持久化模式：纯指令工作流中用 yaml 状态字段替代文字约束
- 知识预加载一致性原则：所有能生成 design 的入口路径必须预加载 codemap + pitfalls
