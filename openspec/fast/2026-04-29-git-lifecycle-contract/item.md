# Fast Item：2026-04-29-git-lifecycle-contract

正文默认使用中文；路径、命令、配置键名、frontmatter key 和状态枚举保持原文。

## 元数据

- source_type: lite
- status: in_progress
- created: 2026-04-29

`source_type` 只能是 `lite` 或 `bugfix`，只表示需求来源；两者共用同一套 fast 流程。

## Preflight

### 意图

为 OPSX workflow 增加公共 Git 生命周期契约，集中描述分支、checkpoint、gate 失败修正、归档 merge 和分支清理策略。

### 范围

- 新增 `skills/common/git-lifecycle.md`
- 更新相关 `opsx-*` skill 的短引用
- 更新用户文档和静态回归测试
- 记录本次 direct 验证证据

### 预期影响

workflow skill 不再各自复制 Git 操作规则；后续需要检查 git 状态的节点统一引用公共 contract。默认只强制检查，不强制所有中间修改提交。

### 验证计划

- 运行 `node --test tests/workflow-discipline.test.mjs`
- 运行 `node --test tests/skill-slimming.test.mjs`

### 升级检查

- 是否涉及新增 capability、兼容性、安全策略、多模块联动、API/CLI/数据格式变更、方案取舍或测试策略不明确: 否；这是文档和 skill contract 的集中化补充，不改变 runtime 行为。
- 若命中，路由: 不适用。

## TDD 策略

- 策略: direct
- 理由: 本次变更是公共 workflow contract 文档和引用更新，没有可先写失败测试的业务行为；用静态契约测试防止引用缺失和 skill 漂移。
- 替代验证（direct 必填）: 使用 workflow discipline 与 skill slimming 测试检查公共 contract 关键规则和引用关系。

## Patch 边界

- 允许修改: `skills/common/git-lifecycle.md`、相关 `skills/opsx-*/SKILL.md`、`docs/workflows.md`、`docs/getting-started.md`、`tests/workflow-discipline.test.mjs`、本 fast item 文件
- 禁止修改: runtime CLI 行为、已有归档 change、与本次 git contract 无关的源码和测试
