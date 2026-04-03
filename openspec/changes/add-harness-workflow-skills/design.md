# 设计：OpenSpec 完整工作流 Harness Skills

## 架构概览

```
┌──────────────────────────────────────────────────┐
│  自动驱动引擎（Auto-Opt）                          │
│  目标 + 量化指标 + 验证命令 → 自主循环              │
│  ┌─ 手动模式：用户逐步触发 skill                   │
│  └─ 自动模式：引擎自主调度 skill 链                │
├──────────────────────────────────────────────────┤
│  Skill 工作流层（10 个中文 skill）                  │
│                                                  │
│  启动引导(hook) → 探索 → 脑暴 → 规划              │
│  → 测试先行 + 实施 → 验证 → 代码审查 → 归档上线    │
├──────────────────────────────────────────────────┤
│  OpenSpec-cn CLI（状态 oracle）                    │
│  openspec-cn status/instructions/list --json      │
└──────────────────────────────────────────────────┘
```

## 文件结构

```
.claude/
├── hooks/
│   ├── hooks.json              # SessionStart hook 声明
│   └── session-start           # 注入 bootstrap skill 内容
├── skills/
│   └── openspec/               # 所有 skill 目录（英文命名，中文说明）
│       ├── bootstrap/
│       │   └── SKILL.md        # 启动引导（中文内容）
│       ├── explore/
│       │   └── SKILL.md        # 探索（中文内容）
│       ├── brainstorm/
│       │   └── SKILL.md        # 脑暴（中文内容）
│       ├── plan/
│       │   └── SKILL.md        # 规划（中文内容）
│       ├── tdd/
│       │   ├── SKILL.md        # 测试先行（中文内容）
│       │   └── anti-patterns.md
│       ├── implement/
│       │   └── SKILL.md        # 实施（中文内容）
│       ├── verify/
│       │   └── SKILL.md        # 验证（中文内容）
│       ├── review/
│       │   ├── SKILL.md        # 代码审查（中文内容）
│       │   └── reviewer-prompt.md
│       ├── ship/
│       │   └── SKILL.md        # 归档上线（中文内容）
│       └── auto-drive/
│           ├── SKILL.md        # 自动驱动（中文内容）
│           └── references/
│               ├── loop-protocol.md
│               └── results-logging.md
└── commands/
    └── openspec/
        └── auto.md             # /openspec:auto 命令入口
```

## Skill 详细设计

### 1. 启动引导

**触发**：SessionStart hook（匹配 `startup|clear|compact`）

**机制**：`hooks/session-start` 脚本读取 `启动引导/SKILL.md` 内容，通过 JSON `additionalContext` 注入会话。

**内容**：
- skill 清单及触发条件表
- 铁律："有 1% 可能性适用就必须调用"
- 合理化借口防护表（"这太简单了不需要" → 停！简单任务才最容易出纰漏）
- skill 优先级：流程类 skill 优先于实施类 skill

### 2. 探索

**触发条件**：用户说"看看"、"调研"、"了解"、"分析"等探索性意图

**行为**：
- 读代码、文档、git history、OpenSpec 现有 specs
- 运行 `openspec-cn list --json` 查看活跃 change
- 画 ASCII 图、提问、分析
- **绝不写代码，绝不创建文件**
- 可建议转入 `脑暴` 或 `规划`

### 3. 脑暴

**触发条件**：用户说"做"、"加"、"实现"、"构建"等创建性意图

**流程**：
1. 检查项目上下文（文件、OpenSpec specs、git log）
2. 逐一提问澄清需求（一次一个，优先选择题）
3. 提出 2-3 方案 + 权衡 + 推荐
4. 逐段呈现设计，每段确认
5. 确认后转入 `规划`

**硬性门控**：设计未被用户确认前，禁止写任何代码或创建任何文件。

### 4. 规划

**触发条件**：脑暴确认后自动转入，或用户直接指定任务

**流程**：
1. `openspec-cn new change "<name>"` 创建 change folder
2. 依次生成 artifact（按 schema DAG 依赖顺序）：
   - `openspec-cn instructions proposal --change "<name>" --json` → 填写 proposal.md
   - `openspec-cn instructions specs --change "<name>" --json` → 填写 specs/
   - `openspec-cn instructions design --change "<name>" --json` → 填写 design.md
   - `openspec-cn instructions tasks --change "<name>" --json` → 填写 tasks.md
3. 每个 artifact 写完后 git commit
4. 展示最终状态，转入 `实施`

**关键约束**：
- 使用 `openspec-cn instructions` 返回的 template 作为结构
- context/rules 仅作为 AI 约束，不复制进产出文件
- tasks.md 中每个 task 必须包含：精确文件路径、预期行为、验证方式

### 5. 测试先行

**触发条件**：任何需要写产品代码的时刻

**铁律**：没有失败的测试就不写产品代码。如果先写了代码再补测试，代码必须删除。

**多语言探测**：
```
项目根目录扫描 →
  CMakeLists.txt 或 *.cpp     → gtest/catch2, 运行: cmake --build && ctest
  pytest.ini 或 pyproject.toml → pytest, 运行: pytest
  package.json                 → 读 scripts.test, 运行: npm test / vitest
  build.gradle 或 pom.xml     → JUnit, 运行: gradle test / mvn test
  *.xcodeproj 或 *.xcworkspace → XCTest, 运行: xcodebuild test
  多框架共存时                  → 按当前修改文件的语言选择对应框架
```

**红绿重构循环**：
```
RED:    写最小失败测试 → 运行 → 确认失败（且失败原因正确）
GREEN:  写最小实现使测试通过 → 运行 → 确认通过
REFACTOR: 改善代码结构 → 运行 → 确认仍通过
```

**反模式清单**（独立文件 `反模式.md`）：
1. 测试 mock 行为而非真实行为
2. 在产品代码中添加仅测试用的方法
3. 不理解依赖就 mock
4. mock 不完整导致误绿
5. 测试作为事后补充

### 6. 实施

**触发条件**：规划完成后，tasks.md 就绪

**流程**：
1. `openspec-cn instructions apply --change "<name>" --json` → 获取任务列表
2. 读取所有 contextFiles（proposal/design/specs）
3. 逐项执行 task：
   a. 展示当前 task 内容
   b. 调用 `测试先行` skill 的 TDD 循环
   c. 在 tasks.md 中标记 `[x]`
   d. git commit（消息格式：`feat(<change-name>): <task描述>`）
4. 遇到以下情况暂停：task 不明确、发现设计问题、测试无法通过
5. 全部完成后转入 `验证`

### 7. 验证

**触发条件**：实施完成后，或用户主动请求

**三维检查**：
1. **完整性**：tasks.md 全部 `[x]`；delta specs 中每条需求在代码中有对应实现
2. **正确性**：每条需求有对应测试用例；所有测试通过；运行验证命令确认
3. **一致性**：实现与 design.md 架构决策一致；代码模式与设计匹配

**输出格式**：
```
## 验证报告
### 记分卡
完整性: ✓/✗  正确性: ✓/✗  一致性: ✓/✗

### 问题列表
[严重] ...
[警告] ...
[建议] ...

### 结论
可归档 / 需修复后归档
```

### 8. 代码审查

**触发条件**：验证通过后，或用户主动请求

**行为**：
- 使用 subagent 执行审查（审查员看实际代码，不信任实施者报告）
- 输出质量指标：圈复杂度、测试覆盖率、lint 分数
- 问题分级：CRITICAL / WARNING / SUGGESTION
- CRITICAL 必须修复，WARNING 建议修复，SUGGESTION 记录

### 9. 归档上线

**触发条件**：代码审查通过后

**流程**：
1. 检查 change 状态（artifact 完整性、task 完成度）
2. 检查 delta specs → 与 main specs 对比
3. 执行 sync（合并 delta specs 到 openspec/specs/）
4. 执行 archive（`mv` 到 `openspec/changes/archive/YYYY-MM-DD-<name>/`）
5. git 操作（可选：创建 PR、打 tag）

### 10. 自动驱动（Auto-Opt 引擎）

**触发条件**：用户说"自动"、"自驱动"、"auto"、"迭代优化"等

**启动配置**（通过 AskUserQuestion 交互式收集）：
```yaml
目标: string          # 要完成什么
范围: glob            # 可修改的文件范围
指标: string          # coverage / errors / lint-score / 自定义
方向: higher | lower  # 指标优化方向
验证命令: string      # 提取指标的命令
守卫命令: string      # 可选，必须通过的 pass/fail 检查
门控: none | design | all  # 哪些阶段需要人类审批
最大迭代: number      # 可选，默认无限
```

**引擎循环**（每轮迭代）：

```
Phase 0 - 预检
  git 状态检查（干净工作区、无 stale lock、非 detached HEAD）

Phase 1 - 审视
  读取：OpenSpec change 状态 + git log --oneline -20 + 结果日志最近 10-20 行
  判断当前处于工作流哪个阶段

Phase 2 - 决策
  根据当前阶段决定下一步动作：
  - 无活跃 change → 创建 change（规划 skill）
  - 有 change, artifact 未完成 → 填写下一个 artifact（规划 skill）
  - artifact 全部完成 → 实施下一个 task（实施 + 测试先行 skill）
  - task 全部完成 → 验证（验证 skill）
  - 验证通过 → 归档（归档上线 skill）
  - 已归档 → 根据指标决定是否开始新一轮

Phase 3 - 执行
  执行 Phase 2 决定的单一动作（原子性：一次只做一件事）

Phase 4 - 提交
  git add <具体文件> && git commit（在验证前提交，便于回滚）
  消息格式：experiment(<change-name>): <描述>

Phase 5 - 度量
  运行验证命令，提取数值指标
  如有守卫命令，运行守卫检查

Phase 6 - 裁决
  指标改善 + 守卫通过 → KEEP（保留提交）
  指标改善 + 守卫失败 → REWORK（最多重试 2 次，然后 DISCARD）
  指标未改善或退步     → DISCARD（git revert HEAD --no-edit）
  崩溃                → 尝试修复最多 3 次，然后 revert

Phase 7 - 记录
  追加 TSV 日志行：
  迭代  提交hash  指标值  变化量  守卫  状态  描述

Phase 8 - 继续
  返回 Phase 1（有界模式达到最大迭代次数则停止并输出总结）
```

**卡住恢复**：连续 5+ 次 DISCARD 时：
1. 重新读取所有范围内文件
2. 重新读取原始目标
3. 审视完整结果日志寻找模式
4. 尝试组合之前成功的变更
5. 尝试与失败方案相反的方向
6. 尝试激进的架构级变更

**门控配置**：
- `none`：全自主，不暂停
- `design`：仅在 design.md 生成后暂停等待审批
- `all`：proposal、design、实施前、归档前均暂停

## Skill 编写准则

基于 awesome-harness-engineering/cache 中 7 篇核心文章提炼的设计约束：

### 准则 1：SKILL.md 是地图，不是百科

- 每个 SKILL.md 控制在 **100 行以内**
- 只包含：触发条件、启动序列、终态定义、退出契约、指针列表
- 详细参考（反模式、协议、提示词模板）放在独立文件中，agent 按需读取
- **来源**：humanlayer_writing-a-good-claude-md.md、openai_harness-engineering.md

### 准则 2：每个 Skill 必须有启动序列和退出契约

**启动序列**（每个 skill 开头必须执行）：
```
1. 确认当前目录是 git 仓库
2. openspec-cn status --change "<name>" --json（如适用）
3. git status 确认工作区状态
4. 读取相关状态文件/日志
```

**退出契约**（每个 skill 结束前必须满足）：
```
1. 所有变更已 git commit（不留半成品）
2. OpenSpec artifact 状态与实际文件一致
3. 输出结构化总结（做了什么、下一步是什么）
```

- **来源**：anthropic_effective-harnesses-for-long-running-agents.md

### 准则 3：定义终态，不过度指定路径

- 每个 skill 定义**完成条件**（artifacts 存在、测试通过、状态变更），不规定具体工具调用顺序
- agent 自行决定实现路径，skill 只检查终态
- 中间检查点用于部分评分和断点恢复，不用于强制路径
- **来源**：anthropic_demystifying-evals-for-ai-agents.md

### 准则 4：机械化强制优于散文指令

- 代码风格 → 用 linter + Stop hook 强制，不写进 SKILL.md
- TDD 铁律 → 用 PreToolUse hook 检测"是否有对应测试文件变更"辅助提醒
- commit 消息格式 → 用 commit-msg hook 校验
- SKILL.md 只保留**需要 AI 判断力**的指令
- **来源**：humanlayer_writing-a-good-claude-md.md、openai_harness-engineering.md

### 准则 5：渐进式上下文加载

- SKILL.md 中用 `@file` 指针引用参考文件，不内联大段内容
- agent 在需要时读取具体参考文件（如 `@anti-patterns.md`、`@loop-protocol.md`）
- OpenSpec 的 context/rules 已经是 just-in-time 注入（通过 `instructions --json`），保持这个模式
- **来源**：anthropic_effective-context-engineering-for-ai-agents.md

### 准则 6：原子增量 + 逐项验证

- 每个 skill 操作一个原子单元（一个 artifact、一个 task、一轮迭代）
- 操作完成后立即验证（测试通过、文件存在、状态正确）
- 验证失败则停止，不继续下一个
- **来源**：anthropic_effective-harnesses-for-long-running-agents.md、anthropic_building-effective-agents.md

### 准则 7：工具响应高信噪比

- `openspec-cn --json` 返回结构化数据，skill 直接消费
- 错误响应必须包含：什么错了、正确输入长什么样、如何修正
- 避免原始 UUID 或大段无关输出进入上下文
- **来源**：anthropic_writing-tools-for-agents.md

## 技术决策

### 状态管理
- **唯一状态源**：OpenSpec-cn CLI（`openspec-cn status/instructions --json`）
- **补充状态**：git history（作为学习记忆）+ TSV 结果日志（作为指标索引）
- **不引入额外数据库或状态文件**

### 命名约定
- Skill 目录名：英文 kebab-case（`tdd/`、`auto-drive/`），与 OpenSpec 现有风格一致
- SKILL.md frontmatter name：英文（`openspec-tdd`、`openspec-auto-drive`）
- SKILL.md 内容（说明、流程描述、提示词、防护表）：全部中文
- 命令名：`/openspec:auto`（Auto-Opt 入口）
- 现有 `/opsx:*` 命令保持不变，新 skill 与其互补而非替代

### Hook 机制
- **SessionStart hook**：注入 bootstrap skill
- **Stop hook**：运行项目 linter/formatter（机械化强制代码风格，不浪费 SKILL.md 指令预算）
- **PreToolUse hook**（可选）：在 `Bash(git commit)` 前检查 commit 消息格式
- 不添加高频 hook 以避免性能开销

### 与现有 `/opsx:*` 命令的关系
- **互补**：`/opsx:new`、`/opsx:ff`、`/opsx:apply`、`/opsx:verify`、`/opsx:archive` 继续可用
- **增强**：新 skill 在调用这些命令的基础上添加 TDD 强制、自动驱动、多语言适配
- **不替代**：用户仍可直接使用 `/opsx:*` 命令进行轻量操作
