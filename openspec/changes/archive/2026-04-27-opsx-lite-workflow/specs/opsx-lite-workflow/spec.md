## 新增需求

### 需求: 轻量小改动流程
**Trace**: R1
**Slice**: opsx-lite/flow
`opsx-lite` 必须定义轻量小改动流程，禁止生成正式 OpenSpec proposal、design、specs、tasks 或 gates。

#### 场景: 小文档改动
- **当** 用户请求一个低风险小文档或 skill 文案改动
- **那么** agent 可以使用 `opsx-lite` 执行 inspect、patch、verify、review、capture 和 exit

### 需求: 正式流程升级边界
**Trace**: R2
**Slice**: opsx-lite/escalation
`opsx-lite` 必须定义升级条件，命中新 capability、多模块联动、设计取舍、兼容性风险或测试策略不明确时，必须停止 lite 并转入 `opsx-slice → opsx-plan`。

#### 场景: 小改动扩大为多模块功能
- **当** 执行中发现改动涉及多个模块边界或新增 capability
- **那么** agent 停止 `opsx-lite` 并建议创建正式 OpenSpec change

### 需求: Lite-run 事实留档
**Trace**: R3
**Slice**: aiknowledge/lite-runs
`opsx-lite` 必须为实际执行的小改动创建 `.aiknowledge/lite-runs/YYYY-MM/<run-id>.md` 事实留档。

#### 场景: lite 改动完成
- **当** `opsx-lite` 完成 patch 和 verify
- **那么** lite-run 记录 Intent、Scope、Changes、Verification、Risks 和 Knowledge

### 需求: Lite-run 可作为 source_refs
**Trace**: R4
**Slice**: aiknowledge/source-refs
lite-run 必须可被 `.aiknowledge` 条目的 `source_refs` 引用，格式为 `lite-run:<run-id>`。

#### 场景: lite 改动产生可复用经验
- **当** agent 将 lite 改动沉淀为 pitfall 或 codemap
- **那么** 对应知识条目可以引用 `lite-run:<run-id>` 或后续 commit hash

## 修改需求

### 需求: workflow 引用迁移到 opsx-lite
**Trace**: R5
**Slice**: openspec-skills/lite
当前 active docs、skills 和 codemap 中必须使用 `opsx-lite` 表达轻量流程，禁止继续推荐 `opsx-ff`。

#### 场景: agent 查找快速入口
- **当** agent 读取 active workflow 文档或 codemap
- **那么** 它看到的是 `opsx-lite`，而不是 `opsx-ff`

## 移除需求

无。
