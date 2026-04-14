# Proposal: 精简 run-report-data.json 并收缩 stage 中间上下文

## 问题陈述

当前 workflow 的中间上下文有两个结构性问题：

1. **共享层与传输层混用**：`run-report-data.json` 和 `packet-<stage>.json` 都保存了来自 `specs/`、`design.md`、`tasks.md` 的摘要，导致同一语义在多个地方重复存在。
2. **skill 边界不够清晰**：一些 stage 默认把“所有现有产物”都塞进 `source_refs` 或 `core_payload`，而不是显式声明“本 stage 实际读取什么、写出什么”。

结果是：

- `run-report-data.json` 膨胀成上下文副本，而不是结果留档
- packet 看起来像共享知识层，而不是 stage-local transport
- `opsx-report` 等下游 skill 容易错误依赖中间产物，而不是回到权威源

## 目标

- `run-report-data.json` 只存 stage 判定结果，不复制上下文
- 每个 skill 明确自己的上游输入、产出文件和状态更新
- `.openspec.yaml` 继续作为 common config，只承载 schema / gates 等最小状态
- `packet-<stage>.json` 保留为 stage-local transport，但内容收缩为当前 stage 必需 facts + refs

## 范围

### 做什么

- 精简 plan-review / verify 写入 `run-report-data.json` 的内容
- 收缩 plan-review / verify 的 packet：移除重复存在性字段，只保留当前 stage 必需的结构化事实
- 将 `source_refs` 从“所有现有产物”改为“当前 stage 明确需要读取的上游输入”
- 让 tdd / review 只写自身 stage 结果，不引入新的中间上下文层
- 让 `opsx-report` 只从 `run-report-data.json` 读结果、从权威产物读上下文
- 更新协议与 workflow 文档，明确 shared state / stage-local transport 的边界

### 不做什么

- 不新增新的全局 context 文件
- 不把 packet 升格为共享知识层
- 不改变主流程顺序

## 成功标准

- `run-report-data.json` 中不再出现 requirements / trace_mapping / units 等上下文副本
- `packet-plan-review.json` / `packet-verify.json` 不再包含 `artifact_presence`、`test_report_present` 等重复缓存
- `source_refs` 只包含当前 stage 实际需要读取的文件
- `opsx-report` 不依赖 packet 恢复 trace / task / requirement 信息
