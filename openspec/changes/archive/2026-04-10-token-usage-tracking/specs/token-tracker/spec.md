## 新增需求

### 需求:解析 transcript JSONL 提取 token 用量

token-tracker.ts 接收 transcript JSONL 文件路径，逐行解析所有 `type: "assistant"` 的记录，提取 usage 字段中的 token 数据。只取 `stop_reason` 非 null 的最终态记录（跳过流式中间态）。

**Trace**: R3

#### 场景:正常解析 assistant 消息
- **当** transcript 中有一条 `type: "assistant"`, `stop_reason: "end_turn"` 的记录
- **且** 其 `message.usage` 包含 `input_tokens: 3, output_tokens: 510, cache_creation_input_tokens: 33800, cache_read_input_tokens: 0`
- **那么** 提取为一条记录 `{in: 3, out: 510, cr: 0, cw: 33800}`

#### 场景:跳过流式中间态
- **当** transcript 中有两条相同 `message.id` 的 assistant 记录
- **且** 第一条 `stop_reason: null`，第二条 `stop_reason: "tool_use"`
- **那么** 只提取第二条（最终态），跳过第一条

#### 场景:跳过非 assistant 记录
- **当** transcript 中有 `type: "user"` 或 `type: "system"` 的记录
- **那么** 不提取这些记录

### 需求:按 session 整体归属到 change

token-tracker.ts 接收 change 目录路径作为第二个参数，将整个 session 的所有 token 记录归属到该 change。

**Trace**: R4

#### 场景:指定 change 目录
- **当** 执行 `bun ~/.claude/token-tracker.ts <transcript> openspec/changes/2026-04-10-token-usage-tracking`
- **那么** 输出写入 `openspec/changes/2026-04-10-token-usage-tracking/token-usage.jsonl`

#### 场景:change 目录不存在
- **当** 指定的 change 目录路径不存在
- **那么** 打印错误信息并以非零退出码退出

### 需求:时间轴明细写入 token-usage.jsonl

token-tracker.ts 将提取的 token 记录以 append-only 方式逐行写入 `<change-dir>/token-usage.jsonl`，每行一个 JSON 对象，按 timestamp 排序。

**Trace**: R5

#### 场景:首次写入
- **当** token-usage.jsonl 不存在
- **那么** 创建文件并写入所有提取的记录

#### 场景:追加写入
- **当** token-usage.jsonl 已存在且包含之前的记录
- **那么** 仅追加新记录（通过 sessionId + timestamp 去重）

#### 场景:幂等性（重复执行）
- **当** 对同一个 transcript 文件重复执行 token-tracker
- **那么** 不产生重复记录
- **且** 文件内容与首次执行后一致

### 需求:token-usage.jsonl 格式规范

每行一个 JSON 对象，字段固定。

**Trace**: R6

#### 场景:单行记录格式
- **当** 写入一条记录
- **那么** 格式为 `{"ts":"<ISO8601>","sid":"<sessionId>","model":"<model>","in":<number>,"out":<number>,"cr":<number>,"cw":<number>}`
- **且** 字段顺序固定：ts, sid, model, in, out, cr, cw

#### 场景:记录按时间排序
- **当** 文件中有多条记录
- **那么** 记录按 ts 字段升序排列
