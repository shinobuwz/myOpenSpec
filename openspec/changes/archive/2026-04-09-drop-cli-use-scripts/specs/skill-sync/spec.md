## 新增需求

### 需求:sync 脚本将 skill 文件复制到目标仓库
**Trace**: R1
**Slice**: skill-sync/copy-skills
`scripts/sync.sh <target-dir>` 必须将 `.claude/skills/openspec-*.md` 复制到 `<target-dir>/.claude/skills/`，并在目标目录不存在时自动创建。

#### 场景:目标目录已存在
- **当** 用户运行 `./scripts/sync.sh /path/to/repo`，且 `/path/to/repo/.claude/skills/` 已存在
- **那么** 脚本将所有 `openspec-*.md` 文件复制到目标目录，已有文件被覆盖

#### 场景:目标目录不存在
- **当** 用户运行 `./scripts/sync.sh /path/to/repo`，且 `/path/to/repo/.claude/skills/` 不存在
- **那么** 脚本创建目标目录并复制文件

#### 场景:未指定目标目录
- **当** 用户运行 `./scripts/sync.sh`，未提供参数
- **那么** 脚本打印用法说明并以非零状态码退出

### 需求:sync 脚本同时同步 codex commands
**Trace**: R2
**Slice**: skill-sync/copy-commands
`scripts/sync.sh` 必须将 `.codex/commands/opsx*.md` 复制到 `<target-dir>/.codex/commands/`（如果源目录存在的话）。

#### 场景:源 codex 目录存在
- **当** 用户运行 `./scripts/sync.sh /path/to/repo`，且本仓库 `.codex/commands/` 存在
- **那么** 脚本将 `.codex/commands/opsx*.md` 复制到目标仓库的 `.codex/commands/`

#### 场景:源 codex 目录不存在
- **当** 用户运行 `./scripts/sync.sh`，且本仓库 `.codex/commands/` 不存在
- **那么** 脚本跳过 codex 同步步骤，不报错

### 需求:sync-all 脚本批量同步到多个仓库
**Trace**: R3
**Slice**: skill-sync/batch-sync
`scripts/sync-all.sh` 必须读取脚本内硬编码的仓库路径列表，对每个路径调用 `sync.sh`，并打印每个仓库的同步结果。

#### 场景:所有目标仓库存在
- **当** 用户运行 `./scripts/sync-all.sh`
- **那么** 脚本对列表中每个路径调用 `sync.sh`，并输出 `✓ synced: <path>` 或 `✗ failed: <path>`

#### 场景:某个目标仓库路径不存在
- **当** 列表中某个路径对应目录不存在
- **那么** 脚本打印警告 `⚠ skipped: <path> (not found)` 并继续处理其余仓库
