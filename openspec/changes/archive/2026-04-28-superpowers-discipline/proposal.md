## 为什么

当前 OPSX workflow 已经具备 OpenSpec gates、TDD 标签、verify/review 等关键节点，但部分纪律仍然依赖 agent 自觉：

- bugfix 可以直接进入修复，缺少明确的 root cause gate。
- verify/lite 的“完成”表述没有统一要求 fresh evidence。
- tasks.md 约束了字段和 TDD 标签，但对 task 粒度、占位符、可执行性要求还不够强。
- review 已使用 subagent，但 verify/review 的职责边界需要更清晰：spec compliance 应由 verify 负责，review 聚焦代码质量和发布风险。
- skill description 中有些条目容易把流程摘要塞进触发描述，存在模型只看 description 而跳过正文的风险。

这些问题会让小改动变快但不够稳，大改动变完整但审查信号混杂。

## 变更内容

- 强化 `opsx-bugfix`：修复前必须完成根因调查、单一假设和最小验证；多次失败后停止并质疑架构。
- 强化 `opsx-verify` 和 `opsx-lite`：完成声明必须基于当前轮 fresh verification evidence。
- 强化 `opsx-tasks`：tasks 必须是 bite-sized、无占位符、包含可执行验证命令或明确验证方式。
- 强化 `opsx-verify` / `opsx-review` 边界：verify 承担 spec compliance，review 聚焦 code quality / release risk，并在发现 verify drift 时回退 verify。
- 引入 skill description 写作约束：description 只描述触发条件，不总结流程细节。

## 功能 (Capabilities)

### 新增功能
- `opsx-workflow-discipline`: OPSX workflow discipline rules for debugging, verification, task planning, review structure, and skill metadata.

### 修改功能
- `opsx-bugfix`: 增加 root cause gate 和失败重试上限。
- `opsx-verify`: 增加 evidence-before-claims 约束。
- `opsx-lite`: 增加轻量流程的 fresh evidence 和 scope review 约束。
- `opsx-tasks`: 增加 bite-sized / no-placeholder / executable verification 约束。
- `opsx-review`: 聚焦 code quality / release risk；发现 compliance drift 时路由回 verify。

## 影响

- 影响 `skills/opsx-bugfix/SKILL.md`
- 影响 `skills/opsx-verify/SKILL.md`
- 影响 `skills/opsx-lite/SKILL.md`
- 影响 `skills/opsx-tasks/SKILL.md`
- 影响 `skills/opsx-review/SKILL.md`
- 可能影响 `skills/opsx-explore/SKILL.md` 的 description 写法
- 可能更新 `.aiknowledge/codemap/openspec-skills.md`

## 非目标

- 不引入新的 CLI 子命令。
- 不新增真实 subagent 自动调度系统。
- 不强制所有实现任务都用 subagent 执行。
- 不删除现有 `opsx-lite` 轻量路径。
- 不改变 OpenSpec change/runtime 数据结构。
