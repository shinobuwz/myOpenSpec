# 实施任务

## 阶段 1：基础设施

- [ ] **创建 skill 目录结构**
  - 在 `.claude/skills/openspec/` 下创建 10 个 skill 目录（英文命名：bootstrap, explore, brainstorm, plan, tdd, implement, verify, review, ship, auto-drive）
  - 每个目录包含 SKILL.md（英文 frontmatter name 如 `openspec-tdd`，内容用中文）
  - 验证：`ls .claude/skills/openspec/` 显示 10 个目录

- [ ] **实现 SessionStart hook**
  - 创建 `.claude/hooks/hooks.json`（匹配 `startup|clear|compact`）
  - 创建 `.claude/hooks/session-start` 脚本（读取 bootstrap/SKILL.md 并输出 JSON）
  - 验证：手动执行 `bash .claude/hooks/session-start` 输出有效 JSON

- [ ] **实现 Stop hook（linter/formatter 强制）**
  - 在 `hooks.json` 中添加 Stop hook，运行项目 linter
  - 代码风格通过 hook 机械化强制，不写进 SKILL.md
  - 验证：Stop hook 在代码变更后自动运行 linter

## 阶段 2：前期 Skills

- [ ] **实现 bootstrap/SKILL.md**
  - 内容：skill 清单表、触发条件、优先级规则、合理化借口防护表
  - 验证：SessionStart hook 能正确注入内容

- [ ] **实现 explore/SKILL.md**
  - 触发条件：探索性意图关键词
  - 行为：读代码/文档/git/OpenSpec，不写代码不创建文件
  - 引用 `openspec-cn list --json` 查询活跃 change
  - 验证：skill 描述中包含明确触发条件

- [ ] **实现 brainstorm/SKILL.md**
  - 触发条件：创建性意图关键词
  - 流程：项目上下文 → 逐一提问 → 2-3 方案 → 确认 → 转入规划
  - 硬性门控：设计未确认前禁止写代码
  - 验证：skill 包含完整流程和硬性门控

- [ ] **实现 plan/SKILL.md**
  - 集成 `openspec-cn new/instructions` CLI 调用
  - 按 schema DAG 依序生成 artifact
  - 每个 artifact 完成后 git commit
  - 验证：skill 中每个 CLI 调用都使用 `--json` 标志

## 阶段 3：实施 Skills

- [ ] **实现 tdd/SKILL.md**
  - TDD 铁律和红绿重构循环
  - 多语言探测逻辑（C++/Python/JS/Java/OC）
  - 合理化借口防护表
  - 验证：skill 包含完整探测逻辑和至少 5 种语言支持

- [ ] **创建 tdd/anti-patterns.md**
  - 5 个测试反模式的详细说明（中文）
  - 验证：每个反模式有具体代码示例

- [ ] **实现 implement/SKILL.md**
  - 集成 `openspec-cn instructions apply --json` 获取任务
  - 逐项 TDD 执行、标记、提交
  - 暂停条件定义
  - 验证：skill 明确引用测试先行 skill

## 阶段 4：后期 Skills

- [ ] **实现 verify/SKILL.md**
  - 三维检查逻辑（完整性/正确性/一致性）
  - 结构化报告输出格式
  - 验证：skill 包含明确的检查项清单

- [ ] **实现 review/SKILL.md + review/reviewer-prompt.md**
  - subagent 审查机制
  - 质量指标输出
  - 问题分级
  - 验证：reviewer-prompt.md 可独立作为 subagent prompt

- [ ] **实现 ship/SKILL.md**
  - specs sync + archive + git 操作
  - 归档前检查逻辑
  - 验证：skill 流程与 `/opsx:archive` 兼容

## 阶段 5：自动驱动引擎

- [ ] **实现 auto-drive/SKILL.md**
  - 启动配置交互式收集
  - 8 阶段引擎循环（预检→审视→决策→执行→提交→度量→裁决→记录）
  - 门控配置（none/design/all）
  - 卡住恢复协议
  - 验证：skill 包含完整循环伪代码和所有阶段

- [ ] **创建 auto-drive/references/loop-protocol.md**
  - 引擎循环的详细协议文档（中文）
  - git-as-memory 机制说明
  - 验证：协议覆盖所有 8 个 Phase

- [ ] **创建 auto-drive/references/results-logging.md**
  - TSV 格式定义（中文说明）
  - 日志分析和模式检测说明
  - 验证：包含 TSV schema 和示例行

- [ ] **创建 /openspec:auto 命令入口**
  - `.claude/commands/openspec/auto.md`
  - 作为自动驱动 skill 的命令触发器
  - 验证：命令文件正确引用自动驱动 skill

## 阶段 6：集成验证

- [ ] **端到端手动模式测试**
  - 使用一个小型示例项目走通完整手动流程
  - 验证：从探索到归档产出完整 OpenSpec change

- [ ] **端到端自动模式测试**
  - 配置目标和指标后启动自动驱动
  - 验证：至少完成 3 轮迭代并产出 TSV 日志
