# Harness Workflow Skills 需求规格

## 新增需求

### 需求：Skill 编写准则
每个 SKILL.md SHALL 控制在 100 行以内，作为地图而非百科。
每个 SKILL.md SHALL 包含显式启动序列（环境确认）和退出契约（干净状态）。
每个 SKILL.md SHALL 定义终态条件（完成时什么必须为真），不过度指定工具调用路径。
详细参考内容 SHALL 放在独立文件中，SKILL.md 通过 `@file` 指针按需加载。
代码风格等可机械化强制的规则 SHALL NOT 写入 SKILL.md，改用 hook 强制。

#### 场景：Skill 长度约束
- Given 任意 SKILL.md 文件
- When 检查行数
- Then 不超过 100 行

#### 场景：启动序列
- Given 任意 skill 被调用
- When skill 开始执行
- Then 先确认 git 仓库状态和 OpenSpec change 状态

#### 场景：退出契约
- Given 任意 skill 执行完毕
- When skill 退出
- Then 所有变更已 commit，状态与文件一致，输出结构化总结

### 需求：机械化强制 Hook
系统 SHALL 通过 Stop hook 运行 linter/formatter 强制代码风格。
系统 MAY 通过 PreToolUse hook 校验 commit 消息格式。

#### 场景：Stop hook 自动 lint
- Given 代码文件被修改
- When agent 完成一轮操作
- Then Stop hook 自动运行 linter 并反馈结果

### 需求：启动引导 Hook
系统 SHALL 在每次 Claude Code 会话启动时通过 SessionStart hook 注入 skill 发现规则。
系统 SHALL 包含 skill 清单、触发条件、优先级规则和合理化借口防护表。

#### 场景：会话启动
- Given 用户启动 Claude Code 会话
- When SessionStart hook 触发
- Then 启动引导 skill 内容被注入 additionalContext

### 需求：探索 Skill
系统 SHALL 提供一个探索 skill，允许调研问题空间而不产生任何代码或文件变更。
系统 SHALL 在探索中查询 OpenSpec 现有 specs 和活跃 change。

#### 场景：探索调研
- Given 用户表达探索性意图
- When 探索 skill 被调用
- Then 系统读取代码/文档/git history/OpenSpec specs
- And 系统不写代码、不创建文件

### 需求：脑暴 Skill
系统 SHALL 提供一个脑暴 skill，通过交互式问答澄清需求并确定方案。
系统 SHALL 一次只问一个问题，优先使用选择题。
系统 SHALL 提出 2-3 个方案并附带权衡分析和推荐。
系统 SHALL NOT 在设计未被用户确认前写任何代码或创建任何文件。

#### 场景：需求澄清
- Given 用户表达创建性意图
- When 脑暴 skill 被调用
- Then 系统逐一提问直到需求清晰
- And 系统提出多个方案供选择
- And 用户确认后转入规划

### 需求：规划 Skill
系统 SHALL 通过 `openspec-cn` CLI 创建 change folder 并依次生成全部 artifact。
系统 SHALL 使用 `openspec-cn instructions --json` 获取模板，不自行猜测格式。
系统 SHALL 在 tasks.md 中为每个 task 包含精确文件路径、预期行为和验证方式。

#### 场景：快速规划
- Given 脑暴确认后或用户直接指定任务
- When 规划 skill 被调用
- Then 系统创建 change folder
- And 依序生成 proposal.md、specs/、design.md、tasks.md
- And 每个 artifact 完成后 git commit

### 需求：测试先行 Skill
系统 SHALL 强制 TDD 红绿重构循环：先写失败测试，再写最小实现，再重构。
系统 SHALL NOT 允许在没有失败测试的情况下编写产品代码。
系统 SHALL 自动探测项目使用的测试框架。

#### 场景：多语言测试框架探测
- Given 项目包含 CMakeLists.txt
- When 测试先行 skill 探测测试框架
- Then 系统识别为 C++ 项目并使用 gtest/catch2 + ctest

#### 场景：多语言测试框架探测 - Python
- Given 项目包含 pyproject.toml 或 pytest.ini
- When 测试先行 skill 探测测试框架
- Then 系统识别为 Python 项目并使用 pytest

#### 场景：多语言测试框架探测 - JavaScript
- Given 项目包含 package.json
- When 测试先行 skill 探测测试框架
- Then 系统读取 scripts.test 字段确定测试运行器

#### 场景：TDD 红绿重构
- Given 需要编写产品代码
- When 开发者开始实施
- Then 系统先写失败测试并确认失败原因正确
- And 写最小实现使测试通过
- And 重构并确认测试仍通过

### 需求：实施 Skill
系统 SHALL 按 tasks.md 逐项执行任务，每项任务走 TDD 循环。
系统 SHALL 在每项任务完成后标记 `[x]` 并 git commit。
系统 SHALL 在任务不明确或发现设计问题时暂停。

#### 场景：逐项实施
- Given tasks.md 中有待完成任务
- When 实施 skill 被调用
- Then 系统逐项执行，每项走 TDD
- And 完成后标记并提交

### 需求：验证 Skill
系统 SHALL 执行三维检查：完整性、正确性、一致性。
系统 SHALL 输出结构化验证报告，问题分为严重/警告/建议三级。

#### 场景：验证检查
- Given 实施完成
- When 验证 skill 被调用
- Then 系统检查 tasks 完成度、需求覆盖度、测试通过情况、设计一致性
- And 输出带记分卡的验证报告

### 需求：代码审查 Skill
系统 SHALL 使用 subagent 执行独立代码审查。
系统 SHALL 输出质量指标（复杂度、覆盖率、lint 分数）。
系统 SHALL 将问题分为 CRITICAL/WARNING/SUGGESTION 三级。

#### 场景：审查执行
- Given 验证通过
- When 代码审查 skill 被调用
- Then subagent 独立审查代码
- And 输出质量指标和分级问题列表

### 需求：归档上线 Skill
系统 SHALL 执行 specs 同步、change 归档和 git 操作。
系统 SHALL 在归档前检查 artifact 完整性和 task 完成度。

#### 场景：归档流程
- Given 代码审查通过
- When 归档上线 skill 被调用
- Then 系统同步 delta specs 到 main specs
- And 移动 change 到 archive 目录
- And 可选执行 git 操作（创建 PR、打 tag）

### 需求：自动驱动 Skill（Auto-Opt 引擎）
系统 SHALL 提供自动驱动模式，设定目标和量化标准后 AI 自主驱动完整工作流。
系统 SHALL 在每轮迭代中：提交前 commit、运行验证、指标改善则保留否则回滚。
系统 SHALL 追加 TSV 格式结果日志。
系统 SHALL 支持可配置门控（none/design/all）。
系统 SHALL 在连续 5+ 次失败后触发卡住恢复协议。

#### 场景：自动驱动循环
- Given 用户配置了目标、指标和验证命令
- When 自动驱动 skill 被调用
- Then 系统自主执行 OpenSpec 全流程
- And 每轮提交后验证指标
- And 改善则保留，否则回滚
- And 记录结果到 TSV 日志

#### 场景：门控配置
- Given 用户设置门控为 "design"
- When 自动驱动执行到 design.md 生成后
- Then 系统暂停等待用户审批
- And 用户确认后继续

#### 场景：卡住恢复
- Given 连续 5 次迭代均为 DISCARD
- When 系统检测到卡住
- Then 重新读取范围内文件和原始目标
- And 审视结果日志寻找模式
- And 尝试组合策略或反向策略
