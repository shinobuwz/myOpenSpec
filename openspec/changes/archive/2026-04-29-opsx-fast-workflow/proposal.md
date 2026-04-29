## 为什么

当前轻量流程分散在 `opsx-lite` 和 `opsx-bugfix`：前者把事实记录写到 `.aiknowledge/lite-runs/`，后者是无正式运行目录的旁路流程。两者都能降低小改动成本，但也带来三个问题：

- 轻量工作没有统一的 OpenSpec 状态视图，无法复用现有 gate、report、archive 等强门控能力。
- `.aiknowledge` 承载了 lite 的运行状态，职责从长期知识扩散到 workflow runtime。
- bugfix 虽有根因铁律，但没有结构化 fast item、attempt/fallback 状态、TDD 策略和统一 verify/review 适配。

需要将 lite 和 bugfix 合并为一个 `opsx-fast` 入口：`lite` / `bugfix` 只作为 `source_type` 标记需求来源，共用同一条 fast 流程。fast 可以跳过正式 proposal/design/spec/tasks，但不能跳过中文 preflight、TDD 策略、验证计划和失败回退；并让现有 `opsx-tdd`、`opsx-verify`、`opsx-review`、`opsx-archive`、`opsx-knowledge`、`opsx-codemap` 适配 `openspec/fast/<id>`。

## 变更内容

- 新增 `opsx-fast` skill，作为轻量工作项的统一入口和路由控制器。
- 将 fast item 存放到 `openspec/fast/<id>/`，使用 `item.md`、`evidence.md`、`.openspec.yaml` 和 source-specific artifact 承载最小状态。
- 合并 lite/bugfix 入口语义：`source_type: lite` 表示低风险小改动来源，`source_type: bugfix` 表示明确缺陷修复来源；两者共用同一 fast gate profile。
- fast item 在 patch 前必须记录中文 preflight；涉及可测试行为时必须复用 `opsx-tdd`，选择 `direct` 时必须说明跳过 TDD 的理由。
- 删除或停止安装独立 `opsx-lite`、`opsx-bugfix` 流程，不保留兼容 wrapper。
- 让 `opsx-tdd`、`opsx-verify`、`opsx-review`、`opsx-archive`、`opsx-knowledge`、`opsx-codemap` 通过 `target_kind: change|fast` 和 `target_root` 复用到 fast item。
- 扩展 runtime/status/report/archive，让 fast item 享受结构化 gates、audit-log、review-report、test-report 和 archive 语义。
- 停止新增 `.aiknowledge/lite-runs/`；历史记录保留，新增知识来源使用 `fast:<id>`。

## 功能 (Capabilities)

### 新增功能
- `opsx-fast-workflow`: 提供统一 fast item 模型、lite/bugfix 来源标记、中文 preflight、TDD 策略、验证计划和失败回退。

### 修改功能
- `openspec-runtime`: 支持 `openspec/fast/<id>` 的 status/list/resolve/archive/report 读取。
- `opsx-reusable-skills`: 让 tdd、verify、review、archive、knowledge、codemap 支持 fast target。
- `aiknowledge-lifecycle`: 将 fast item 作为长期知识来源，停止使用 lite-run 承接新增运行状态。
- `openspec-skills`: 更新工作流拓扑和 skill 清单，移除独立 lite/bugfix 旁路。

## 影响

- 影响 skill：`skills/opsx-fast/`、`skills/opsx-tdd/`、`skills/opsx-verify/`、`skills/opsx-review/`、`skills/opsx-archive/`、`skills/opsx-knowledge/`、`skills/opsx-codemap/`。
- 影响 runtime：`runtime/bin/changes.sh`、`bin/opsx.mjs`，必要时新增/调整 fast schema。
- 影响测试：`tests/changes-helper.test.mjs` 和 skill contract 相关测试。
- 影响长期知识：`.aiknowledge/README.md`、`.aiknowledge/codemap/openspec-skills.md`、相关 pitfall/source_refs 文档。
- 不改变正式 `openspec/changes/<id>` 的 proposal/design/spec/tasks 主流程。

## 完成标准

- 用户可以通过 `opsx-fast` 创建和推进 `openspec/fast/<id>`。
- fast item 必须先完成 classify/preflight，再允许 patch。
- `source_type: bugfix` 必须记录现象、预期、观察/复现、根因假设、证据和回退触发条件；三次失败后必须停止 fast 并路由审视。
- fast item 涉及可测试行为时必须执行 test-first 或 characterization-first；选择 direct 必须记录理由和替代验证。
- 现有可复用 skills 能以 fast root 为目标工作，不要求 fast item 伪造 formal change artifacts。
- status/report/archive 能展示 fast item 的 gates 和下一步。
- `.aiknowledge` 新知识可以引用 `fast:<id>`，不再新增 lite-run。
