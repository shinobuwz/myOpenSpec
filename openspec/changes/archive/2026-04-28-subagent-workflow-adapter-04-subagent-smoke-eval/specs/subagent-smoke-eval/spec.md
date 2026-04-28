## 新增需求

### 需求:可选模型 smoke eval 入口
**Trace**: R1
**Slice**: subagent-smoke-eval/runner-entrypoint
系统必须提供一个不会被默认 `npm test` 触发的可选命令，用于以 `gpt-5.3-codex` 为默认模型运行 Codex subagent smoke eval。

#### 场景:手动运行模型 eval
- **当** 开发者执行 `npm run eval:subagent`
- **那么** 系统必须启动一个真实 `codex exec --json --ephemeral --sandbox read-only` eval 进程

#### 场景:默认测试不调用模型
- **当** 开发者执行 `npm test`
- **那么** 系统禁止启动 `codex exec` 或任何真实模型 eval

### 需求:Trace 证据驱动的 subagent 判定
**Trace**: R2
**Slice**: subagent-smoke-eval/trace-parser
系统必须根据 Codex JSONL trace 事件判断 subagent smoke eval 的结果，禁止只信任最终自然语言声明。

#### 场景:成功启用 subagent
- **当** JSONL trace 包含成功的 `spawn_agent`、带 completed subagent 状态的 `wait`、以及最终结构化 pass 结果
- **那么** 系统必须将 eval 分类为 `pass` 或带 warning 的 `pass`

#### 场景:没有启用 subagent
- **当** JSONL trace 中不存在成功的 `spawn_agent`
- **那么** 系统必须将 eval 分类为 `fail`

#### 场景:重试后成功
- **当** JSONL trace 先出现 spawn 相关错误、随后出现成功的 `spawn_agent` 和 completed `wait`
- **那么** 系统必须保留 retry warning，但不能把该结果直接判为失败

### 需求:Parser fixture 回归测试
**Trace**: R3
**Slice**: subagent-smoke-eval/parser-tests
系统必须提供无模型 fixture 测试来验证 trace parser 的 pass、fail 和 warning 判定。

#### 场景:普通测试验证 parser
- **当** 开发者执行 `npm test`
- **那么** parser fixture 测试必须运行，并且不得依赖 Codex CLI、网络或模型调用

#### 场景:异常 trace 被识别
- **当** fixture 表示无 spawn、无 completed wait 或最终 JSON 非 pass
- **那么** parser 测试必须断言对应结果不是 pass

### 需求:Eval 输出和仓库状态保护
**Trace**: R4
**Slice**: subagent-smoke-eval/state-and-output
系统必须把模型 eval trace 输出保存到临时路径，并检查 eval 前后工作树状态，避免 smoke eval 悄悄修改仓库。

#### 场景:保存 eval trace
- **当** 模型 eval 运行完成
- **那么** 系统必须把 JSONL trace 写入临时 eval 输出路径，并在终端报告该路径

#### 场景:工作树变化
- **当** eval 前后的 `git status --short` 不一致
- **那么** 系统必须把结果标记为失败或至少阻断 pass 结论

### 需求:本地 Codex CLI 兼容
**Trace**: R5
**Slice**: subagent-smoke-eval/codex-cli-compat
系统必须兼容当前本地 Codex CLI 的 `exec` 参数集，禁止在默认命令中使用已确认不被本地 CLI 接受的 approval 参数。

#### 场景:构造 Codex 命令
- **当** runner 构造 `codex exec` 命令
- **那么** 命令必须包含 `--json`、`--ephemeral`、`--sandbox read-only` 和 `-m <model>`

#### 场景:避免不兼容参数
- **当** runner 构造默认命令
- **那么** 命令禁止包含 `--ask-for-approval` 或 `-a`
