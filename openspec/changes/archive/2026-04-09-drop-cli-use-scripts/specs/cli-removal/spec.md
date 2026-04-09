## 移除需求

### 需求:TypeScript CLI 构建链已移除
**Trace**: R5
**Slice**: cli-removal/delete-build-chain
**Reason**: CLI 的复杂度（~7000 行 TypeScript）与实际使用场景（单人、固定工具、固定 workflow）严重不匹配，替换为 shell 脚本后不再需要构建链。
**Migration**: 使用 `scripts/sync.sh <target-dir>` 替代 `openspec-cn init`/`openspec-cn update`。

#### 场景:构建链文件已删除
- **当** 执行本次变更后
- **那么** `src/`、`bin/`、`dist/`、`build.js`、`tsconfig.json`、`vitest.config.ts`、`vitest.setup.ts`、`test/`、`eslint.config.js`、`package.json`、`pnpm-lock.yaml`、`node_modules/` 均不再存在于仓库中

### 需求:simplify-config 变更已废弃
**Trace**: R6
**Slice**: cli-removal/archive-simplify-config
**Reason**: `simplify-config` 变更目标是删除 profile/delivery 层，其目标已被本次"删除整个 CLI"完全超越，无需单独实施。
**Migration**: 不需要迁移，整个 CLI 均被删除。

#### 场景:simplify-config 已归档
- **当** 执行本次变更后
- **那么** `openspec/changes/simplify-config/` 目录已移动到 `openspec/changes/archive/simplify-config/`
