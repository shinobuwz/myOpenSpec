## 1. 门控写入（关卡通过后持久化状态）

- [x] 1.1 [R1][U1][direct] 在 opsx-plan-review 退出契约中增加 gates 写入指令：通过时执行 `yq -i '.gates.plan-review = "<timestamp>"' .openspec.yaml`
  - 文件: `.claude/skills/opsx-plan-review/SKILL.md`
  - 验收: 退出契约"通过"分支包含 gates 写入 bash 命令

- [x] 1.2 [R1][U1][direct] 在 opsx-task-analyze 退出契约中增加 gates 写入指令
  - 文件: `.claude/skills/opsx-task-analyze/SKILL.md`
  - 验收: 退出契约"可实施"分支包含 `gates.task-analyze` 写入命令

- [x] 1.3 [R1][U1][direct] 在 opsx-verify 退出契约中增加 gates 写入指令
  - 文件: `.claude/skills/opsx-verify/SKILL.md`
  - 验收: 退出契约"通过"分支包含 `gates.verify` 写入命令

- [x] 1.4 [R1][U1][direct] 在 opsx-review 退出契约中增加 gates 写入指令
  - 文件: `.claude/skills/opsx-review/SKILL.md`
  - 验收: 退出契约"无 CRITICAL"分支包含 `gates.review` 写入命令

## 2. 门控校验（启动时验证前置关卡）

- [x] 2.1 [R2][U2][direct] 在 opsx-tasks 启动序列首步增加 plan-review 门控校验
  - 文件: `.claude/skills/opsx-tasks/SKILL.md`
  - 验收: 启动序列包含读取 `.openspec.yaml` 的 `gates.plan-review` 字段，缺失时拒绝执行

- [x] 2.2 [R2][U2][direct] 在 opsx-implement 启动序列增加双关卡校验
  - 文件: `.claude/skills/opsx-implement/SKILL.md`
  - 验收: 启动序列包含 `gates.plan-review` 和 `gates.task-analyze` 两项校验

- [x] 2.3 [R2][U2][direct] 在 opsx-archive 启动序列增加 verify+review 门控校验
  - 文件: `.claude/skills/opsx-archive/SKILL.md`
  - 验收: 启动序列包含 `gates.verify` 和 `gates.review` 两项校验，缺失时拒绝执行

## 3. 退出契约路由修正

- [x] 3.1 [R3][U3][direct] 修正 opsx-task-analyze 失败路由：从 opsx-plan 改为 opsx-tasks
  - 文件: `.claude/skills/opsx-task-analyze/SKILL.md`
  - 验收: 退出契约"需补充"分支指向 opsx-tasks

## 4. skill 定位描述修正

- [x] 4.1 [R9][U3][direct] 修正 opsx-continue 的 description：去掉"替代 opsx-plan"
  - 文件: `.claude/skills/opsx-continue/SKILL.md`
  - 验收: frontmatter description 不含"替代"字样，改为说明轻量路径定位

- [x] 4.2 [R9][U3][direct] 修正 opsx-archive 的 description：去掉"实验性"
  - 文件: `.claude/skills/opsx-archive/SKILL.md`
  - 验收: frontmatter description 不含"实验性"字样

- [x] 4.3 [R9][U3][direct] 修正 opsx-tdd 的 description：与 direct 模式不矛盾
  - 文件: `.claude/skills/opsx-tdd/SKILL.md`
  - 验收: description 表述与 `[direct]` 模式跳过 TDD 的行为不矛盾

- [x] 4.4 [R9][U3][direct] 修正 opsx-apply 的 description：增加定位说明区分 implement
  - 文件: `.claude/skills/opsx-apply/SKILL.md`
  - 验收: description 明确说明与 opsx-implement 的区别

## 5. 步骤编号修正

- [x] 5.1 [R8][U3][direct] 修正 opsx-tasks 启动序列重复步骤编号
  - 文件: `.claude/skills/opsx-tasks/SKILL.md`
  - 验收: 启动序列步骤编号连续无重复

- [x] 5.2 [R8][U3][direct] 修正 opsx-bugfix 步骤编号重复
  - 文件: `.claude/skills/opsx-bugfix/SKILL.md`
  - 验收: 步骤编号连续无重复

## 6. 知识预加载补齐

- [x] 6.1 [R4][U4][direct] 在 opsx-continue 中增加 codemap+pitfalls 预加载步骤
  - 文件: `.claude/skills/opsx-continue/SKILL.md`
  - 验收: 包含与 opsx-plan 一致的 index-first 知识预加载指令

- [x] 6.2 [R4][U4][direct] 在 opsx-ff 中增加 codemap+pitfalls 预加载步骤
  - 文件: `.claude/skills/opsx-ff/SKILL.md`
  - 验收: 包含 codemap index 和 pitfalls index 的预加载指令

- [x] 6.3 [R5][U5][direct] 在 opsx-bugfix 步骤 2 后增加 pitfalls 读取步骤
  - 文件: `.claude/skills/opsx-bugfix/SKILL.md`
  - 验收: codemap 定位后、测试策略决定前有 pitfalls 读取指令

- [x] 6.4 [R6][U6][direct] 在 opsx-explore 源码搜索协议中增加 pitfalls 读取
  - 文件: `.claude/skills/opsx-explore/SKILL.md`
  - 验收: 源码搜索强制协议中包含 pitfalls index 读取步骤

## 7. L3 消费指引

- [x] 7.1 [R7][U7][direct] 在 opsx-tdd 的 pitfalls 读取指令中增加 L3 读取要求
  - 文件: `.claude/skills/opsx-tdd/SKILL.md`
  - 验收: pitfalls 读取指令包含"L2 命中后继续读 L3 条目"

- [x] 7.2 [R7][U7][direct] 在 opsx-apply 的 pitfalls 读取指令中增加 L3 读取要求
  - 文件: `.claude/skills/opsx-apply/SKILL.md`
  - 验收: pitfalls 读取指令包含"L2 命中后继续读 L3 条目"

- [x] 7.3 [R7][U7][direct] 在 opsx-implement 的 pitfalls 读取指令中增加 L3 读取要求
  - 文件: `.claude/skills/opsx-implement/SKILL.md`
  - 验收: pitfalls 读取指令包含"L2 命中后继续读 L3 条目"

- [x] 7.4 [R7][U7][direct] 在 opsx-review 的 pitfalls 读取指令中增加 L3 读取要求
  - 文件: `.claude/skills/opsx-review/SKILL.md`
  - 验收: pitfalls 读取指令包含"L2 命中后继续读 L3 条目"
