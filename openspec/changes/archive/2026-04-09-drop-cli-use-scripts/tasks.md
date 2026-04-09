## 1. 废弃 simplify-config 变更

- [x] 1.1 [R6][U5][direct] 将 `openspec/changes/simplify-config/` 移动到 `openspec/changes/archive/simplify-config/`

## 2. 创建 sync.sh

- [x] 2.1 [R1][R2][U1][direct] 创建 `scripts/sync.sh`：接受 `<target-dir>` 参数，无参数时打印用法并退出；将 `.claude/skills/openspec-*.md` 复制到 `<target-dir>/.claude/skills/`（mkdir -p）；如果 `.codex/commands/` 存在则复制 `opsx*.md` 到 `<target-dir>/.codex/commands/`；打印 `✓ synced: $TARGET`
- [x] 2.2 [R1][U1][direct] 为 `scripts/sync.sh` 添加可执行权限（chmod +x）

## 3. 创建 sync-all.sh

- [x] 3.1 [R3][U2][direct] 创建 `scripts/sync-all.sh`：硬编码仓库路径数组（必须包含至少一条真实路径，如 `/Users/cc/MyHarness/SomeRepo`），遍历时检查目录是否存在（不存在打印 `⚠ skipped`），调用 `./scripts/sync.sh`，打印 `✓ synced` 或 `✗ failed`
- [x] 3.2 [R3][U2][direct] 为 `scripts/sync-all.sh` 添加可执行权限

## 4. 修改 openspec-bootstrap skill

- [x] 4.1 [R4][U3][direct] 编辑 `.claude/skills/openspec-bootstrap.md`：将启动序列第 2 步改为 `` `ls openspec/changes/ | grep -v archive` ``（排除 archive 子目录），无变更时输出"无活动变更"提示

## 5. 删除 TypeScript 构建链

- [x] 5.1 [R5][U4][direct] 删除 `src/` 目录（整个 TypeScript 源码）
- [x] 5.2 [R5][U4][direct] 删除 `bin/` 目录（CLI 入口点）
- [x] 5.3 [R5][U4][direct] 删除 `dist/` 目录（编译产物）
- [x] 5.4 [R5][U4][direct] 删除 `test/` 目录（测试文件）
- [x] 5.5 [R5][U4][direct] 删除 `build.js`、`tsconfig.json`、`vitest.config.ts`、`vitest.setup.ts`、`eslint.config.js`、`Makefile`（已确认 Makefile 仅含 npm/pnpm 命令包装，可直接删除）
- [x] 5.6 [R5][U4][direct] 删除 `package.json`、`pnpm-lock.yaml`、`package-lock.json`
- [x] 5.7 [R5][U4][direct] 删除 `node_modules/`（git 已忽略，但需从工作目录清理）
