# Fast Item：2026-04-29-remove-opsx-continue

正文默认使用中文；路径、命令、配置键名、frontmatter key 和状态枚举保持原文。

## 元数据

- source_type: lite
- status: in_progress
- created: 2026-04-29

## Preflight

### 意图

删除 `opsx-continue` skill，并把恢复中断 change 的推荐入口统一到 `opsx changes status` 和具体下一步 skill。

### 范围

- 删除 `skills/opsx-continue/`。
- 更新 README、docs 和 skill slimming inventory 中对 `opsx-continue` 的引用。
- 调整测试中维护的 skill 数量、清单或工作流路由断言。

### 预期影响

用户不再通过 `opsx-continue` 恢复 workflow；先运行 `opsx changes status` 查看 `Next:`，再点名对应 skill。减少 skill-first 工作流中的重复路由入口和状态规则漂移。

### 验证计划

- 先运行相关现有测试，确认基线。
- 删除入口和引用后运行 targeted tests。
- 运行 `npm test` 做最终回归。

### 升级检查

- 是否涉及新增 capability、兼容性、安全策略、多模块联动、API/CLI/数据格式变更、方案取舍或测试策略不明确: 否。删除的是冗余 skill 入口，保留 CLI status 和各 stage skill。
- 若命中，路由: 不适用。

## TDD 策略

- 策略: characterization-first
- 理由: 删除入口前先确认当前测试对 skill 清单和 status 路由的约束，再根据新目标更新断言。
- 替代验证（direct 必填）: 不适用。

## Patch 边界

- 允许修改: `skills/opsx-continue/`、README、docs、tests、skill slimming inventory、当前 fast item evidence。
- 禁止修改: 其他 workflow skill 语义、runtime CLI 行为、已归档 change 历史产物。
