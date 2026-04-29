---
name: opsx-fast
description: "统一快速通道。适用于低风险小改动或边界明确的缺陷修复；使用 source_type: lite | bugfix 标记需求来源，但二者共用同一套 fast 流程。"
---

# Fast 工作流

`opsx-fast` 是快速通道的薄入口。完整路由、模板、gate profile 和升级规则见 `references/route.md`、`references/item-schema.md`、`references/gate-profile.md`、`references/escalation.md`。

## 职责

1. 判定请求是否适合 fast。
2. 创建或打开 `openspec/fast/<id>/`。
3. 写入 `source_type: lite | bugfix`；该字段只表示需求来源，不表示两套流程。
4. 在 patch 前完成中文 preflight 和 TDD 策略记录。
5. 需要测试先行时转入 `opsx-tdd`；实现后转入 `opsx-verify`、按需 `opsx-review`、最后 `opsx-archive`。
6. 越界或三次失败时停止 patch，路由 `opsx-explore` 或 `opsx-slice`。

## 读写边界

读取：
- 用户请求和已有 fast item。
- `runtime/schemas/fast/templates/`。
- 命中的 `.aiknowledge/codemap/` 和 `.aiknowledge/pitfalls/`（按需）。

写入：
- `openspec/fast/<id>/item.md`
- `openspec/fast/<id>/.openspec.yaml`
- `openspec/fast/<id>/evidence.md`
- `openspec/fast/<id>/root-cause.md`（`source_type: bugfix` 必需）
- 实现、测试或文档文件（仅 preflight 和 TDD 策略完成后）

禁止：
- 不创建 `proposal.md`、`design.md`、`specs/` 或 `tasks.md`。
- 不在 preflight 缺失时 patch 实现文件。
- 不内联 tdd / verify / review / archive 细节；调用对应 canonical skill。
- 不新增 `.aiknowledge/lite-runs/`。

## 硬性护栏

- 没有当前轮 `evidence.md` 或 `test-report.md` 证据时，不得宣称完成、通过、已修复或可归档。
- 共同 preflight 必须包含：`意图`、`范围`、`预期影响`、`验证计划`、`升级检查`。
- `source_type: bugfix` 必须补充：`现象`、`预期行为`、`观察/复现`、`根因假设`、`假设证据`、`回退触发条件`。
- 每个 fast item 必须记录 TDD 策略：`test-first`、`characterization-first` 或 `direct`。
- `direct` 必须在 `evidence.md` 记录跳过 TDD 理由和替代验证。
- 失败尝试达到 3 次后停止继续 patch，将状态置为 `blocked` 或 `escalated`。

## 退出契约

完成实现后必须有 `evidence.md` 证据，并转入 **opsx-verify**。通过 verify 后按风险进入 **opsx-review** 或 **opsx-archive**。
