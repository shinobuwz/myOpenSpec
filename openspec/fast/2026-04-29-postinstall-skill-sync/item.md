# Fast Item：2026-04-29-postinstall-skill-sync

正文默认使用中文；路径、命令、配置键名、frontmatter key 和状态枚举保持原文。

## 元数据

- source_type: lite
- status: in_progress
- created: 2026-04-29

`source_type` 只能是 `lite` 或 `bugfix`，只表示需求来源；两者共用同一套 fast 流程。

## Preflight

### 意图

让全局 npm 安装 `@shinobuwz/opsx` 后默认同步一次 `opsx-*` skills 和 `~/.opsx/common` contracts，同时让 CLI 负责从包内 `runtime/schemas` 初始化 fast item，避免 skill 硬编码模板路径。

### 范围

- 新增 npm `postinstall` 入口
- 复用现有 `installSkills()` 同步逻辑
- 新增 `opsx fast init <id> --source-type lite|bugfix`
- 保持模板权威源在包内 `runtime/schemas`
- 增加跳过和非全局安装保护
- 更新本地 tarball 安装测试和 CLI 单元测试

### 预期影响

执行 `npm install -g @shinobuwz/opsx` 时会自动创建或刷新 `~/.agents/skills/opsx-*` 和 `~/.opsx/common`。`opsx fast init` 从包内 `runtime/schemas` 创建项目内 fast artifacts。本地依赖安装默认不写入用户 HOME；可用环境变量显式启用或跳过。

### 验证计划

- 运行 `node --test tests/opsx.test.mjs`
- 运行 `bash scripts/test-local-install.sh`
- 运行 `npm test`

### 升级检查

- 是否涉及新增 capability、兼容性、安全策略、多模块联动、API/CLI/数据格式变更、方案取舍或测试策略不明确: 否；这是安装生命周期行为补齐，复用已有 install-skills 逻辑。
- 若命中，路由: 不适用。

## TDD 策略

- 策略: direct
- 理由: 该变更是 npm lifecycle 集成，风险在安装时机、跳过开关和非致命失败；用单元测试和本地 tarball 安装验证更直接。
- 替代验证（direct 必填）: `tests/opsx.test.mjs` 覆盖 postinstall 判定与同步，`scripts/test-local-install.sh` 覆盖真实 tarball 全局安装。

## Patch 边界

- 允许修改: `package.json`、`bin/opsx.mjs`、`bin/postinstall.mjs`、`tests/opsx.test.mjs`、`tests/workflow-discipline.test.mjs`、`scripts/test-local-install.sh`、README/docs 的安装说明、本 fast item 文件
- 禁止修改: `installSkills()` 的删除/同步语义、runtime changes helper、已归档 changes
