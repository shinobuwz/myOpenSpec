# Token Usage Tracking

## 为什么

当前 statusline 只显示 input/output token 和缓存命中率，缺少 cache_read/cache_create 的绝对量，无法直观了解缓存消耗规模。同时，OpenSpec 变更驱动的开发没有 token 消耗追踪，无法回答"这个变更花了多少 token"。

## 变更内容

### 1. statusline cache 明细显示
将 statusline.ts 的 token 显示从 `↑in ↓out ⚡hitRate%` 改为 `↑in ↓out cr:cacheRead cw:cacheWrite ⚡hitRate%`，让 cache_read 和 cache_create 的绝对量可见。

### 2. statusline 当前变更名显示
statusline.ts 扫描 `openspec/changes/`（排除 `archive/`），显示当前活跃的 opsx 变更名称。

### 3. per-change token 消耗追踪
创建 token-tracker 脚本，解析 Claude Code 的 transcript JSONL 文件，按 session 整体归属到当前活跃的 opsx change，以 append-only 方式写入 `openspec/changes/<name>/token-usage.jsonl`，记录时间轴明细。

## 功能 (Capabilities)

### 新增功能
- `statusline-cache-detail`: statusline 显示 cache_read/cache_create 绝对量
- `statusline-change-name`: statusline 显示当前活跃的 opsx 变更名
- `token-tracker`: 解析 transcript 并按 change 记录 token 消耗时间轴

### 修改功能
- `statusline-token-display`: 现有 token 显示格式变更

## 范围

### 做什么
- 修改 `~/.claude/statusline.ts` 的 token 显示格式和变更名检测
- 创建 token-tracker 脚本（Bun TypeScript）
- token-usage.jsonl 纳入 git 跟踪

### 不做什么
- 不做 per-skill 的 token 归属（transcript 中 skill 没有独立 tool_use 记录，无法精确归因）
- 不做 subagent 的 token 统计（subagent token 在独立 session 中，主 transcript 不包含）
- 不做费用估算（ccusage 已经在做）
- 不改变现有 ccusage 费用显示逻辑

## 成功标准
- statusline 能看到 `cr:XXK cw:XXK` 格式的缓存明细
- statusline 能看到当前活跃变更名（无活跃变更时不显示）
- 每次会话结束后，token-usage.jsonl 中有对应的时间轴记录

## 影响
- `~/.claude/statusline.ts`（修改）
- `~/.claude/token-tracker.ts`（新建）
- `openspec/changes/<name>/token-usage.jsonl`（运行时生成）
