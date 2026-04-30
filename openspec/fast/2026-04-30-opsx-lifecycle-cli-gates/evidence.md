# Evidence：2026-04-30-opsx-lifecycle-cli-gates

正文默认使用中文；路径、命令、配置键名、frontmatter key 和状态枚举保持原文。

## TDD 策略证据

- 策略: test-first
- 选择理由: 目标是 CLI 强门控，先用临时 Git 仓库测试定义 branch metadata 和 merge-back 行为。
- 跳过 TDD 理由（direct 必填）:
- 替代验证:

## 命令证据

### 2026-04-30 14:42

- 命令: `node bin/opsx.mjs fast init 2026-04-30-opsx-lifecycle-cli-gates --source-type lite`
- 退出状态: 0
- 结果摘要: 已创建 fast item 记录，用于本次 CLI lifecycle gate 修复。

### 2026-04-30 14:55

- 命令: `node --test tests/changes-helper.test.mjs`
- 退出状态: 0
- 结果摘要: 16 个测试通过，覆盖正式 change 在 Git 仓库内创建 `opsx/<change>` 分支、脏工作区拒绝和既有 changes helper 行为。

### 2026-04-30 14:55

- 命令: `node --test tests/opsx.test.mjs`
- 退出状态: 0
- 结果摘要: 19 个测试通过，覆盖 `fast init --branch`、`opsx git merge-back` 和 `opsx git checkpoint`。

### 2026-04-30 14:56

- 命令: `node --test tests/workflow-discipline.test.mjs tests/archive-skill.test.mjs`
- 退出状态: 0
- 结果摘要: 25 个测试通过，确认 skill/common lifecycle 契约已同步。

### 2026-04-30 14:57

- 命令: `npm test`
- 退出状态: 0
- 结果摘要: 全量 74 个测试通过。

## 人工观察证据

### 2026-04-30 HH:MM

- 观察内容:
- 结果:
- 结论:

## 被否定的尝试

### 尝试 1

- 假设:
- 改动摘要:
- 验证结果:
- 否定原因:
