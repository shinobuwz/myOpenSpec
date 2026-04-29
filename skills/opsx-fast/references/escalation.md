# Fast 升级与失败回退

fast 是小闭环，不是反复试错的容器。

## 失败尝试

以下情况计为一次失败尝试：

- patch 后验证命令失败。
- 修复假设被复现或观察否定。
- verify gate 未通过且需要改动实现。
- 修复扩大到原 preflight 范围之外。

每次失败必须追加到 `evidence.md`：

```md
### 尝试 <n>
- 假设:
- 改动摘要:
- 验证结果:
- 否定原因:
```

同时更新 `.openspec.yaml` 中 `attempts.count`。

## 三次失败

当 `attempts.count >= 3`：

1. 停止继续 patch。
2. 将 `.openspec.yaml` 的 `status` 置为 `blocked` 或 `escalated`。
3. 写入 `fallback.trigger`、`fallback.status`、`fallback.route` 和 `fallback.reason`。
4. 重新审视根因、问题边界、需求定义和架构假设。

路由规则：

- 根因或复现不清：`opsx-explore`。
- 交付边界、模块切分、兼容性或风险边界不清：`opsx-slice`。

## 立即升级

即使未达到三次失败，发现以下情况也必须停止 fast：

- 需要新增 capability 或正式需求表达。
- 需要多模块协调、迁移、公共契约变更或安全策略判断。
- 测试策略无法在当前边界内明确。
- 用户请求变成多个独立交付单元。
