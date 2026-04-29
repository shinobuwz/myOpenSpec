## 上下文

现有 OpenSpec 有两类工作流：

- 正式 change：`slice -> plan -> plan-review -> tasks -> task-analyze -> implement -> verify -> review -> archive`，产物完整、门控强。
- 轻量旁路：`opsx-lite` 和 `opsx-bugfix`，流程成本低，但没有统一 OpenSpec runtime 状态。

本变更将轻量旁路收敛为 `opsx-fast`。设计目标不是把 fast 做成小号 formal change，而是让 fast item 拥有强门控的最小形态：前置思考、TDD 策略、结构化状态、验证证据、失败回退、可审查关闭。

## 目标 / 非目标

**目标：**
- 新增 `opsx-fast` 统一入口，使用 `source_type: lite | bugfix` 标记需求来源。
- 将 fast 工作项运行状态迁入 `openspec/fast/<id>/`。
- 让现有 reusable skills 支持 `target_kind: fast`。
- 通过 `.openspec.yaml`、`audit-log.md`、`review-report.md` 和 `test-report.md` 复用强门控协议。
- 明确中文 preflight 模板、TDD 默认约束和三次失败回退。
- 停止新增 `.aiknowledge/lite-runs/`，将 `.aiknowledge` 恢复为长期知识层。

**非目标：**
- 不让 fast item 生成 formal change 的 `proposal.md`、`design.md`、`specs/`、`tasks.md`。
- 不复用 `opsx-plan-review`、`opsx-task-analyze`、`opsx-implement` 作为 fast 默认流程。
- 不保留 `opsx-lite`、`opsx-bugfix` 兼容 wrapper。
- 不把 fast 用作需求设计或多模块 capability 的替代流程。

## 需求追踪

- [R1] -> [U1]
- [R2] -> [U1], [U2]
- [R3] -> [U2], [U4]
- [R4] -> [U2]
- [R5] -> [U2], [U3]
- [R6] -> [U2], [U3]
- [R7] -> [U1], [U2]
- [R8] -> [U1], [U2]
- [R9] -> [U1], [U2]
- [R10] -> [U1], [U3]
- [R11] -> [U3]
- [R12] -> [U1], [U3]
- [R13] -> [U1], [U2]
- [R14] -> [U1], [U2]
- [R15] -> [U1]
- [R16] -> [U3]
- [R17] -> [U3]
- [R18] -> [U3], [U5]
- [R19] -> [U3], [U5]
- [R20] -> [U4]
- [R21] -> [U4]
- [R22] -> [U4]
- [R23] -> [U4]
- [R24] -> [U5]
- [R25] -> [U6]
- [R26] -> [U6]
- [R27] -> [U7]
- [R28] -> [U1], [U4]

## 架构决策

### 1. 统一入口，来源类型路由

`opsx-fast` 是唯一快速通道入口。它只承担 controller 职责：

1. classify 请求是否允许 fast。
2. 创建或打开 `openspec/fast/<id>/`。
3. 设置 `source_type: lite | bugfix`。
4. 写入 preflight artifacts。
5. 记录 TDD 策略，必要时调用 `opsx-tdd`。
6. 调用现有 reusable skills。
7. 在越界或失败阈值触发时停止 fast 并路由正式流程。

`opsx-fast` 不内联 verify/review/archive 细节，避免形成第二套 OpenSpec。

`source_type` 只表达需求来源，不表达两套流程：

- `lite`：低风险小改动来源，使用共同 fast preflight。
- `bugfix`：缺陷修复来源，在共同 fast preflight 之外追加诊断补充。

### 2. Fast item 目录不按 profile 分层

选择：

```text
openspec/fast/<id>/
```

不选择：

```text
openspec/fast/lite/<id>/
openspec/fast/bugfix/<id>/
```

理由：`source_type` 已由 `item.md` 和 `.openspec.yaml` 表达，目录再分层会增加 status/resolve/archive 的遍历复杂度。统一目录也便于 `fast:<id>` 作为稳定来源引用。

fast 不支持 group/subchange。若一个 fast item 需要拆成多个独立验证闭环，应创建多个 fast items；若它需要共享设计决策、跨模块协调或统一交付边界，应升级 formal change。

### 3. Fast artifact 模型

最小目录：

```text
openspec/fast/<id>/
  item.md
  evidence.md
  .openspec.yaml
```

按需目录：

```text
  root-cause.md       # bugfix 必需
  test-report.md      # 使用 opsx-tdd 时
  audit-log.md        # verify gate
  review-report.md    # review gate
```

`.openspec.yaml` 示例：

```yaml
schema: fast
kind: fast
source_type: bugfix
created: 2026-04-29
status: in_progress
attempts:
  count: 0
  max_fast_attempts: 3
test_strategy:
  mode:
  reason:
gates:
  classify:
  preflight:
  tdd-strategy:
  verify:
  review:
fallback:
  trigger: third_failed_attempt
  route:
```

### 4. Gate profile 复用

formal change gate profile 不直接套到 fast：

```text
formal: plan-review -> task-analyze -> verify -> review -> archive
fast: classify -> preflight -> tdd-strategy -> patch -> verify -> review? -> archive
```

复用的是 gate 协议，不是 formal change 的 artifact 套餐：

- `.openspec.yaml` 持久化 gate 状态。
- `audit-log.md` 记录 verify 结论。
- `review-report.md` 记录 release/code risk。
- `test-report.md` 记录测试执行。
- status/report/archive 读取同一套文件名。

fast 使用同名 gate key：`verify` 和 `review` 与 formal change 语义保持一致，`classify`、`preflight` 和 `tdd-strategy` 是 fast 专属 gate。`plan-review` 和 `task-analyze` 不属于 fast gate profile。

### 5. 中文 Preflight 和 TDD 策略

fast 可以跳过正式规划产物，但不能跳过轻量思考。

所有 fast item 在 patch 前必须记录中文共同模板：

- 意图
- 范围
- 预期影响
- 验证计划
- 升级检查

`source_type: bugfix` 还必须记录中文诊断补充：

- 现象
- 预期行为
- 观察/复现
- 根因假设
- 假设证据
- 回退触发条件

所有 fast item 都必须在 patch 前记录 TDD 策略：

- `test-first`：新行为或可提前表达的修复。
- `characterization-first`：已有行为不清晰或 bugfix 需要先锁定当前表现。
- `direct`：纯文字、注释、低风险模板或无法合理自动化验证的材料；必须写明理由和替代验证命令。

原则：只要涉及可测试行为，就默认复用 `opsx-tdd`。强制的是测试策略判定和“可测试则测试优先”，不是要求每个纯文案 lite 都新增测试。

### 6. 三次失败回退

fast 每次失败都必须追加 rejected attempt：

```md
## 被否定的尝试

### 尝试 1
- 假设:
- 改动摘要:
- 验证结果:
- 否定原因:
```

当 `attempts.count >= 3`：

- 停止继续 patch。
- 将 status 置为 `blocked` 或 `escalated`。
- 重新审视根因、问题边界、需求定义和架构假设。
- 路由 `opsx-explore` 或 `opsx-slice`。

### 7. Reusable skill 适配契约

被复用 skill 接收通用目标：

```text
target_kind: change | fast
target_root: openspec/changes/<id> | openspec/fast/<id>
```

各 skill 只根据 target kind 选择读取 artifact：

- `change`: formal artifacts，例如 specs/design/tasks。
- `fast`: fast artifacts，例如 item/evidence/root-cause/test-report。

`opsx-fast` 保持薄入口；复杂 stage 仍由 canonical skills 承担。

### 8. Runtime root 解析

runtime 必须区分 store：

```text
change store: openspec/changes
fast store:   openspec/fast
```

`resolve` 的结果必须携带或可推导：

- `target_kind`: `change | fast`
- `target_root`: 真实目录
- `archive_root`: 对应 store 的 archive 目录
- `display_ref`: `change:<id>` 或 `fast:<id>`

当 formal change 和 fast item 同名时，不能仅用 basename 解析。实现阶段可以选择新增 `opsx fast ...` 命令或让通用 `opsx status` 同时展示两类 item；无论选择哪种 CLI 形式，后续 skill 不得自行拼接路径，必须消费 resolved root。

### 9. Archive 位置

formal change 继续归档到：

```text
openspec/changes/archive/<id>/
```

fast item 归档到：

```text
openspec/fast/archive/<id>/
```

archive skill 和 follow-up worker prompt 必须传入真实归档路径，避免 knowledge/codemap 把 fast 来源误写为 `openspec/changes/archive/...`。

## 实施单元

### [U1] opsx-fast skill
- 关联需求: [R1], [R2], [R7], [R8], [R9], [R10], [R12], [R13], [R14], [R15], [R28]
- 模块边界:
  - `skills/opsx-fast/SKILL.md`
  - `skills/opsx-fast/references/route.md`
  - `skills/opsx-fast/references/lite.md`
  - `skills/opsx-fast/references/bugfix.md`
  - `skills/opsx-fast/references/item-schema.md`
  - `skills/opsx-fast/references/gate-profile.md`
  - `skills/opsx-fast/references/escalation.md`
  - `skills/opsx-lite/`
  - `skills/opsx-bugfix/`
- 验证方式: `rg "opsx-lite|opsx-bugfix" skills .aiknowledge docs README.md` 不应在 active docs/skills/codemap 中推荐旧入口；`skills/opsx-fast/SKILL.md` 保持薄入口。
- 知识沉淀: 快速入口是 controller，不是第二套 stage implementation。

### [U2] fast item schema 和 artifacts
- 关联需求: [R2], [R3], [R4], [R5], [R6], [R7], [R8], [R9], [R13], [R14]
- 模块边界:
  - `runtime/schemas/fast/`
  - `openspec/fast/README.md`
  - `skills/opsx-fast/references/item-schema.md`
- 验证方式: 创建示例 fast item 时只生成 fast artifacts，不生成 proposal/design/specs/tasks。
- 知识沉淀: artifact 文件是真相源，不新增 JSON packet 中间层。

### [U3] reusable skill target 适配
- 关联需求: [R5], [R6], [R10], [R11], [R12], [R16], [R17], [R18], [R19]
- 模块边界:
  - `skills/opsx-tdd/SKILL.md`
  - `skills/opsx-tdd/references/`
  - `skills/opsx-verify/SKILL.md`
  - `skills/opsx-verify/references/`
  - `skills/opsx-review/SKILL.md`
  - `skills/opsx-review/references/`
  - `skills/opsx-archive/SKILL.md`
  - `skills/opsx-archive/references/`
- 验证方式: skill 文档明确 `target_kind: fast` 时读取 fast artifacts，且不要求 formal proposal/design/spec/tasks。
- 知识沉淀: 复用 stage 能力，避免复制 stage 流程。

### [U4] runtime status/resolve/list
- 关联需求: [R3], [R20], [R21], [R22], [R23], [R28]
- 模块边界:
  - `runtime/bin/changes.sh`
  - `bin/opsx.mjs`
  - `tests/changes-helper.test.mjs`
- 验证方式: 测试覆盖 active fast item 的 list/status/next-step、fast 与 formal 同名消歧、非法路径拒绝、fast 不支持 group/subchange；formal change status 不回归。
- 知识沉淀: runtime 应抽象 item root，而不是硬编码 change-only 语义。

### [U5] report/archive fast support
- 关联需求: [R18], [R19], [R24]
- 模块边界:
  - `skills/opsx-report/SKILL.md`
  - `skills/opsx-report/references/`
  - `skills/opsx-archive/SKILL.md`
  - `skills/opsx-archive/references/`
  - `runtime/bin/changes.sh`
- 验证方式: fast item 可从 active root 归档到 `openspec/fast/archive/<id>/`，并生成/读取报告时不会因缺少 design/tasks 报错。
- 知识沉淀: fast archive 保持 `fast:<id>` 引用稳定。

### [U6] aiknowledge source_refs 迁移
- 关联需求: [R25], [R26]
- 模块边界:
  - `.aiknowledge/README.md`
  - `.aiknowledge/lite-runs/README.md`
  - `skills/opsx-knowledge/SKILL.md`
  - `skills/opsx-knowledge/references/`
  - `skills/opsx-codemap/SKILL.md`
  - `skills/opsx-codemap/references/`
- 验证方式: docs/templates 支持 `fast:<id>`，并说明 `.aiknowledge/lite-runs/` 仅为历史保留。
- 知识沉淀: source_refs 优先指向 OpenSpec artifact，不复制 raw source。

### [U7] docs/codemap 更新
- 关联需求: [R27]
- 模块边界:
  - `README.md`
  - `docs/`
  - `.aiknowledge/codemap/openspec-skills.md`
  - `.aiknowledge/logs/2026-04.md`
- 验证方式: active 文档和 codemap 的 workflow 拓扑展示 `opsx-fast`，不再推荐独立 lite/bugfix。
- 知识沉淀: workflow 入口合并后必须同步 codemap，否则 agent 会继续触发旧路径。

## 风险 / 权衡

- **自举风险**：本 change 修改 gate/status 语义，verify/archive 可能被新规则影响。缓解：实现任务中显式标注首次豁免或手动 gate 写入策略。
- **fast 膨胀风险**：如果 `opsx-fast` 内联 verify/review/archive，会形成第二套流程。缓解：skill 入口只做 route/controller，stage 细节留在 reusable skills。
- **误用风险**：fast 可能吞掉正式需求。缓解：classify/preflight gate 必须包含 escalation check。
- **状态命令命名风险**：现有 `opsx changes status` 语义是 changes-only。缓解：实现阶段可选择扩展输出为 project status，或新增更通用 `opsx status`；但必须保持原 formal change 输出不回归。
- **同名解析风险**：formal change 和 fast item 可能同名。缓解：runtime resolver 必须携带 target kind，不能只靠 basename。
- **历史引用风险**：已有 `lite-run:<id>` 不能断链。缓解：历史保留，新来源使用 `fast:<id>`。

## 知识沉淀

归档时应沉淀：轻量流程可以复用强门控协议，但不应复制 formal change 的 planning artifacts；fast 的质量边界来自 preflight、fresh evidence 和 fallback，而不是 proposal/design/tasks。
