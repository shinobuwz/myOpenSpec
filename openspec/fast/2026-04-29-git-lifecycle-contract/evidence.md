# Evidence：2026-04-29-git-lifecycle-contract

正文默认使用中文；路径、命令、配置键名、frontmatter key 和状态枚举保持原文。

## TDD 策略证据

- 策略: direct
- 选择理由: 本次变更是公共 workflow contract 文档和引用更新，不改变 runtime 行为。
- 跳过 TDD 理由（direct 必填）: 没有可先写失败测试的业务逻辑；采用静态契约测试验证关键规则和引用。
- 替代验证: `node --test tests/workflow-discipline.test.mjs` 与 `node --test tests/skill-slimming.test.mjs`

## 命令证据

### 2026-04-29 18:05

- 命令: `node --test tests/workflow-discipline.test.mjs`
- 退出状态: 0
- 结果摘要: 22 项通过；新增公共 Git lifecycle contract 及各 workflow skill 引用断言通过。

### 2026-04-29 18:05

- 命令: `node --test tests/skill-slimming.test.mjs`
- 退出状态: 0
- 结果摘要: 7 项通过；新增短引用未破坏 skill slimming 限制。

### 2026-04-29 18:05

- 命令: `git diff --check`
- 退出状态: 0
- 结果摘要: 无空白错误。

### 2026-04-29 18:05

- 命令: `node --test tests/archive-skill.test.mjs tests/changes-helper.test.mjs tests/opsx.test.mjs tests/subagent-trace-parser.test.mjs tests/workflow-discipline.test.mjs tests/skill-slimming.test.mjs`
- 退出状态: 0
- 结果摘要: 64 项通过；完整 node test 覆盖通过。

### 2026-04-29 18:05

- 命令: `node --test tests/opsx.test.mjs tests/workflow-discipline.test.mjs tests/skill-slimming.test.mjs`
- 退出状态: 0
- 结果摘要: 40 项通过；确认 `~/.opsx/common/git-lifecycle.md` 引用、install-skills common 同步和 skill slimming 约束。

### 2026-04-29 18:05

- 命令: `bash scripts/test-local-install.sh`
- 退出状态: 0
- 结果摘要: 本地 tarball 安装通过；`install-skills` 可同步 `opsx-*` skills 和 common contracts。

### 2026-04-29 18:05

- 命令: `npm test`
- 退出状态: 0
- 结果摘要: 64 项通过；完整仓库测试通过。

## 人工观察证据

### 2026-04-29 18:05

- 观察内容: 创建 fast preflight，限定 patch 边界。
- 结果: 通过
- 结论: 可以开始 direct patch。

## 被否定的尝试

暂无。
