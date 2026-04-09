## 为什么

当前 OpenSpec-cn 是一个完整的 TypeScript CLI（~7000+ 行），包含 profile/delivery 配置、migration、legacy-cleanup、validation 等大量逻辑，但实际使用场景极其简单：单人、固定工具（Claude Code + Codex）、固定全量 workflow。CLI 的复杂度与实际需求严重不匹配。

## 变更内容

- **BREAKING**: 删除整个 TypeScript CLI（`src/`、`bin/`、`dist/`、`build.js`、`tsconfig.json`、`package.json` 等）
- **BREAKING**: 删除 `openspec-cn` 命令及其所有子命令
- **新增**: `scripts/sync.sh` —— 将 `.claude/skills/` 中的 skill 文件同步到目标仓库
- **新增**: `scripts/sync-all.sh` —— 批量同步到常用仓库列表
- **修改**: `openspec/changes/simplify-config/` —— 废弃该变更（目标已被超越）
- **修改**: `.claude/skills/openspec-bootstrap.md` —— 移除 `openspec-cn list --json` 调用，改为直接读目录

## 功能 (Capabilities)

### 新增功能

- `skill-sync`: 通过 shell 脚本将 skill 源文件同步到目标仓库的 `.claude/skills/` 和 `.codex/commands/`

### 修改功能

- `bootstrap-list`: openspec-bootstrap skill 中的变更列表逻辑，从调用 CLI 改为直接读取目录

### 移除功能

- `cli-removal`: 删除整个 TypeScript CLI 构建链并废弃 simplify-config 变更

## 影响

- 删除 Node.js / pnpm / TypeScript 依赖
- 不再需要 build 步骤
- 现有安装过 `openspec-cn` 的用户需要手动更新（但目标用户只有一人）
- `.claude/skills/` 中的 skill 文件本身不受影响，继续作为单一真相源
