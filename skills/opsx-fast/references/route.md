# Fast 路由

`opsx-fast` 是唯一快速通道入口。`source_type` 只描述需求来源：

- `lite`：低风险小改动来源，例如文档、skill 文案、脚本或配置小修。
- `bugfix`：明确缺陷修复来源，用户提供症状、预期行为、观察线索或复现路径。

两种来源共用同一套 fast 流程：

```text
classify -> preflight -> tdd-strategy -> patch -> verify -> review? -> archive
```

## 接受条件

fast 只接受以下请求：

- 范围清晰，可在单一验证闭环内完成。
- 风险低，不涉及兼容性、安全策略、迁移或公共契约变更。
- 不需要多方案取舍或正式设计评审。
- 测试策略可以在 patch 前明确。

## 拒绝条件

命中任一条件时停止 fast：

- 新增 capability、跨模块/全栈联动、API/CLI/数据格式变更。
- 需要方案比较、架构决策、迁移计划或发布协调。
- 边界不清、影响面不清、验证方式不清。
- 单个 fast item 无法独立完成验证闭环。

拒绝后路由：

- 需求或根因不清：`opsx-explore`。
- 交付边界、模块切分或风险边界不清：`opsx-slice`。

## 初始化要求

接受 fast 后创建：

```text
openspec/fast/<id>/
  item.md
  .openspec.yaml
  evidence.md
```

`source_type: bugfix` 还必须创建 `root-cause.md`。

不得创建 formal change 产物：

- `proposal.md`
- `design.md`
- `specs/`
- `tasks.md`
