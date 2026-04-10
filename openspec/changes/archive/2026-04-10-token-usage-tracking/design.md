## 上下文

Claude Code 的 statusline.ts 脚本通过 stdin 接收实时 token 数据（input_tokens、output_tokens、cache_read_input_tokens、cache_creation_input_tokens），当前只显示 input/output 和缓存命中率百分比，缺少 cache 绝对量。同时，OpenSpec 变更驱动的开发缺乏 token 消耗追踪。

transcript JSONL 文件（`~/.claude/projects/<project>/<sessionId>.jsonl`）中每条 assistant 消息都包含完整的 usage 字段，是 token 统计的数据源。

## 目标 / 非目标

**目标：**
- statusline 显示 cache_read 和 cache_create 的绝对量（`cr:XXK cw:XXK`）
- statusline 显示当前活跃的 opsx 变更名
- 按 session 整体归属，将 token 消耗记录到对应 change 的 token-usage.jsonl

**非目标：**
- 不做 per-skill 归属（skill 在 transcript 中无独立 tool_use 记录）
- 不做 subagent token 统计（subagent token 在独立 session 中，主 transcript 不包含）
- 不改变现有 ccusage 费用显示逻辑

## 需求追踪

- [R1] -> [U1]（statusline cache 明细显示格式）
- [R2] -> [U1]（statusline 当前变更名显示）
- [R3] -> [U2]（token-tracker 解析 transcript）
- [R4] -> [U2]（按 session 归属到 change）
- [R5] -> [U2]（时间轴明细写入 token-usage.jsonl）
- [R6] -> [U2]（token-usage.jsonl 格式规范）

## 实施单元

### [U1] statusline.ts 显示改造

- 关联需求: [R1] [R2]
- 模块边界: `~/.claude/statusline.ts`
- 改动点:
  1. token 显示格式从 `↑in ↓out ⚡hitRate%` 改为 `↑in ↓out cr:cacheRead cw:cacheWrite ⚡hitRate%`
  2. 新增函数：扫描 `openspec/changes/`（cwd 下），排除 `archive/` 子目录，返回活跃变更名列表
  3. 如果有活跃变更，在 segments 中插入变更名段（位于 git 信息之后、ctx% 之前）
- 验证方式: 手动运行 statusline.ts，对比输出格式

### [U2] token-tracker 脚本

- 关联需求: [R3] [R4] [R5] [R6]
- 模块边界: `~/.claude/token-tracker.ts`（新建）
- 工作流:
  1. 接收参数：transcript JSONL 文件路径、change 目录路径
  2. 解析 transcript 中所有 `type: "assistant"` 且 `stop_reason` 非 null 的记录（去重，跳过流式中间态）
  3. 提取每条记录的 timestamp、model、input_tokens、output_tokens、cache_creation_input_tokens、cache_read_input_tokens
  4. 以 append-only 方式写入 `<change-dir>/token-usage.jsonl`
  5. 幂等性：通过 sessionId + timestamp 去重，同一条记录不重复写入
- 输出格式（每行一个 JSON 对象）:
  ```json
  {"ts":"2026-04-10T08:44:04.857Z","sid":"6b1f5985-...","model":"claude-opus-4-6","in":3,"out":510,"cr":0,"cw":33800}
  ```
- 触发方式: 手动执行 `bun ~/.claude/token-tracker.ts <transcript-path> <change-dir>`
- 验证方式: 对当前 session 的 transcript 运行，检查输出文件内容

## 决策

**决策1：token-tracker 触发方式 — 手动 vs hook 自动**
选择手动触发。原因：hooks 配置当前为空，自动触发需要配置 PostToolUse hook 且增加运行时开销。手动执行更可控，后续可以按需升级为 hook。

**决策2：去重策略 — sessionId+timestamp vs message id**
选择 sessionId + timestamp 组合去重。原因：transcript 中同一 API 调用可能产生两条 assistant 记录（流式中间态和最终态），只取有 stop_reason 的最终态；跨次运行通过检查已有记录的 ts+sid 组合避免重复写入。

**决策3：token-usage.jsonl 位置 — change 目录 vs ~/.claude/**
选择 change 目录（`openspec/changes/<name>/token-usage.jsonl`）。原因：用户要求 git 跟踪；change 归档时自然带走历史记录。

**决策4：statusline 变更名位置 — git 后 vs 末尾**
选择 git 信息之后、ctx% 之前。原因：变更名是项目上下文信息，逻辑上与 git 分支信息相邻。

## 风险 / 权衡

- [风险] statusline 过长（终端宽度不够）→ 缓解：变更名只显示日期后部分（去掉 `YYYY-MM-DD-` 前缀），cache 明细使用紧凑格式
- [风险] token-tracker 手动执行容易遗忘 → 缓解：后续可升级为 hook 自动触发，本次先建立数据格式
- [风险] 多个活跃变更同时存在 → 缓解：statusline 只显示第一个（按字母序），token-tracker 需要指定目标 change
