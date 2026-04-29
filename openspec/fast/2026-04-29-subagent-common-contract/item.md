# Fast Item：2026-04-29-subagent-common-contract

正文默认使用中文；路径、命令、配置键名、frontmatter key 和状态枚举保持原文。

## 元数据

- source_type: lite
- status: in_progress
- created: 2026-04-29

`source_type` 只能是 `lite` 或 `bugfix`，只表示需求来源；两者共用同一套 fast 流程。

## Preflight

### 意图

将 `opsx-subagent` 从可触发 skill 迁移为公共 subagent 派发契约，和 Git lifecycle 一样安装到 `~/.opsx/common`，避免不会被直接调用的 contract 继续占用 `opsx-*` skill 命名空间。

### 范围

- 新增 `skills/common/subagent.md`
- 新增 `skills/common/subagent-lifecycle.md`
- 删除 `skills/opsx-subagent/`
- 更新引用该 contract 的 workflow skill、文档、静态检查和测试
- 更新 install/package 断言，确认 common contract 被安装和打包

### 预期影响

`opsx install-skills` 只安装可触发的 `opsx-*` workflow skills；subagent 派发规则作为 common contract 同步到 `~/.opsx/common`，由需要派发或审查 subagent 的节点显式引用。

### 验证计划

- 运行 `node --test tests/workflow-discipline.test.mjs`
- 运行 `node --test tests/skill-slimming.test.mjs`
- 运行 `node --test tests/opsx.test.mjs`
- 运行 `bash scripts/test-local-install.sh`

### 升级检查

- 是否涉及新增 capability、兼容性、安全策略、多模块联动、API/CLI/数据格式变更、方案取舍或测试策略不明确: 否；这是 contract 位置和引用关系调整，不改变 CLI 命令语义。
- 若命中，路由: 不适用。

## TDD 策略

- 策略: direct
- 理由: 本次是公共 contract 迁移和引用更新，没有业务行为可先写失败测试；用现有静态测试扩展覆盖迁移后的路径与安装结果。
- 替代验证（direct 必填）: workflow discipline 检查公共 contract 内容和引用，skill slimming 检查可触发 skill 清单，opsx/install 测试检查 common 同步和 npm package 内容。

## Patch 边界

- 允许修改: `skills/common/**`、`skills/opsx-subagent/**`、引用 subagent contract 的 `skills/opsx-*/SKILL.md`、相关 docs/tests/scripts、本 fast item 文件
- 禁止修改: 已归档 change 内容、subagent smoke eval 行为、与 contract 迁移无关的 runtime helper
