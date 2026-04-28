# opsx-bugfix Workflow

## 定位

标准路径：

```text
读 codemap 辅助定位 -> 根因调查 -> 单一假设最小验证 -> 判断测试策略 -> 修复 -> 验证 -> codemap 更新（按需）-> 经验总结
```

## codemap 和 pitfalls

1. 读取 `.aiknowledge/codemap/index.md`，找到涉及模块。
2. 命中模块时读取对应 `<module>.md` 定位关键文件和调用链。
3. 读取 `.aiknowledge/pitfalls/index.md`，命中领域时读取领域 index。
4. `active` 条目可直接作为排查约束；`stale` 只能作为线索；`superseded` / `deprecated` 不作为默认依据。

## 测试策略

- bug 可通过新增失败测试复现：使用 `test-first`。
- 旧行为不清晰或回归缺陷：先用 `characterization-first` 固化现状。
- 纯样式、纯配置类缺陷：可使用 `direct`。

## 单一假设

用一句话写清：“我认为根因是 X，因为证据 Y”。只保留一个当前要验证的假设，不一次改多个可能原因。

如果假设被否定，回到根因调查，不要在失败补丁上继续叠加补丁。

## 修复和验证

- 保持改动最小，不顺手做无关重构。
- 修复必须能解释根因。
- 运行与 bug 相关的测试或验证命令。
- 无法被测试证明时，明确说明验证依据和剩余风险。

## 知识沉淀

- 模块边界或跨模块调用链变化时调用 `opsx-codemap`。
- 出现可复用踩坑时调用 `opsx-knowledge`，或直接补 `.aiknowledge/pitfalls/<domain>/`。
- 修复验证了已有 pitfall 仍成立时刷新 `last_verified_at` / `last_verified_by`。
- 证明旧 pitfall 不再成立时标记 `superseded` 或 `deprecated`。
