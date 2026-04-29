# Fast Items

`openspec/fast/` 保存 active fast item。fast 是快速通道的最小门控工作项，不是 formal change 的缩小版。

## Active

active fast item 位于：

```text
openspec/fast/<id>/
  item.md
  .openspec.yaml
  evidence.md
  root-cause.md       # source_type: bugfix 必需
  test-report.md      # 使用 opsx-tdd 时
  audit-log.md        # verify gate
  review-report.md    # review gate
```

初始化 fast item 时必须创建 `item.md` 和 `.openspec.yaml`，并记录 `source_type`、preflight 和 TDD 策略。不得创建 `proposal.md`、`design.md`、`specs/` 或 `tasks.md`。

## Archive

完成后的 fast item 归档到：

```text
openspec/fast/archive/<id>/
```

不要移动到 `openspec/changes/archive/`。formal change 和 fast item 是不同 store。

## source_type

`source_type` 只能是：

- `lite`：低风险小改动来源。
- `bugfix`：明确缺陷修复来源。

该字段只表示需求来源，不代表两套流程。两者共用：

```text
classify -> preflight -> tdd-strategy -> patch -> verify -> review? -> archive
```

## 不支持 group/subchange

`openspec/fast/<id>/` 下不支持 group/subchange 结构。

- 一个请求可以拆成多个独立 fast item。
- 如果需要共享设计决策、跨模块协调或统一交付边界，升级到 formal change，并从 `opsx-slice` 开始。
