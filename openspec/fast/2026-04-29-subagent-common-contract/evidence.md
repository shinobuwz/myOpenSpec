# Evidence：2026-04-29-subagent-common-contract

正文默认使用中文；路径、命令、配置键名、frontmatter key 和状态枚举保持原文。

## TDD 策略证据

- 策略: direct
- 选择理由: 公共 contract 迁移没有可先写失败测试的业务逻辑；风险集中在路径、安装、打包和引用一致性。
- 跳过 TDD 理由（direct 必填）: 迁移前后的行为由静态契约测试和安装测试覆盖，不需要产品代码红绿循环。
- 替代验证: 运行 workflow discipline、skill slimming、opsx CLI/package 测试和本地安装脚本。

## 命令证据

### 2026-04-29 20:17

- 命令: `node --test tests/workflow-discipline.test.mjs`
- 退出状态: 0
- 结果摘要: 22 项通过；确认 subagent contract 已从 skill 改为 `skills/common/subagent.md` / `~/.opsx/common/subagent.md`，workflow skills 引用公共 contract。

### 2026-04-29 20:17

- 命令: `node --test tests/skill-slimming.test.mjs`
- 退出状态: 0
- 结果摘要: 7 项通过；确认可触发 `opsx-*` skill 清单减少为 16，且未复制 subagent 平台映射。

### 2026-04-29 20:17

- 命令: `node --test tests/opsx.test.mjs`
- 退出状态: 0
- 结果摘要: 11 项通过；确认 `install-skills` 同步 `subagent.md` / `subagent-lifecycle.md` 到 common，npm package 不再包含 `skills/opsx-subagent/SKILL.md`。

### 2026-04-29 20:17

- 命令: `bash scripts/test-local-install.sh`
- 退出状态: 0
- 结果摘要: 本地 tarball 安装通过；全局 `opsx install-skills` 可安装 skills 和 common contracts。

### 2026-04-29 20:17

- 命令: `git diff --check`
- 退出状态: 0
- 结果摘要: diff whitespace 检查通过。

### 2026-04-29 20:17

- 命令: `npm test`
- 退出状态: 0
- 结果摘要: 全量 64 项测试通过。

## 人工观察证据

### 2026-04-29 20:17

- 观察内容: `rg -n "opsx-subagent|skills/opsx-subagent|references/lifecycle\\.md" skills docs tests scripts README.md bin package.json`
- 结果: 仅剩负向 package 断言和 `docs/workflows.md` 对旧可触发 skill 的说明。
- 结论: 产品引用已迁移到 `~/.opsx/common/subagent.md`。

## 被否定的尝试

无。
