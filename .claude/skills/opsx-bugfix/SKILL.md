---
name: opsx-bugfix
description: 精简 bugfix 工作流。适用于明确缺陷的快速修复：定位问题、判断测试策略、修复、验证并沉淀经验。
---

执行精简 bugfix 工作流。目标是用最少步骤完成一个明确缺陷的修复，不为简单问题引入多余文档。

## 适用条件

- 问题边界相对清晰
- 主要目标是修复缺陷，而不是扩展功能
- 不需要先做大范围需求脑暴或复杂方案比较

## 标准路径

读 codemap 辅助定位 → 判断测试策略 → 修复 → 验证 → codemap 更新（按需）→ 经验总结

## 步骤

1. **确认 bug 描述**
   - 如果用户没有提供明确症状、期望行为或复现线索，先询问
   - 如果问题范围已经扩展成需求变更或架构调整，停止 bugfix 流程并建议改走常规流程

2. **读取 codemap 辅助定位**
   - 读 `.aiknowledge/codemap/index.md`，找到涉及模块
   - 如果涉及模块在 codemap 中，读对应 `<module>.md` 定位关键文件和调用链
   - 如果模块不在 codemap 中，正常阅读代码定位；修复完成后按需补全 codemap

3. **读取已知陷阱**
   - 读取 `.aiknowledge/pitfalls/index.md`（如存在），查找当前 bug 所在领域是否有已知陷阱
   - 如命中领域，读取对应 `<domain>/index.md`；如有高度相关条目，继续读取 L3 具体条目文件
   - 检查当前 bug 是否与已知陷阱匹配，避免重复踩坑

4. **决定测试策略**
   - 如果 bug 可通过新增失败测试直接复现，使用 `[test-first]`
   - 如果是旧行为不清晰或回归缺陷，先用 `[characterization-first]` 固化现状
   - 仅纯样式、纯配置类缺陷使用 `[direct]`

5. **实施修复**
   - 优先阅读相关代码、日志、已有测试
   - 实施时保持改动最小，不顺手做无关重构

6. **验证**
   - 运行与 bug 相关的测试或验证命令
   - 如果修复无法被测试证明，明确说明验证依据

7. **Codemap 更新（按需）**
   - 如果 fix 涉及模块边界变化、接口变更或新的跨模块调用链，调用 `opsx-codemap` skill 更新受影响模块
   - 小范围 bugfix（单文件内部逻辑修复）无需更新 codemap

8. **经验总结**
   - 直接在 `.aiknowledge/pitfalls/<领域>/` 中补一条最小经验，或调用 `opsx-knowledge`
   - 根据问题本质选择技术领域（memory / concurrency / api / build / testing / performance / security / platform / data / network / lifecycle / config / misc）
   - **写之前必须先 `ls .aiknowledge/pitfalls/`**，确认目标领域目录是否已存在：
     - 已存在 → 追加到该目录，更新该目录的 index.md，更新顶层 index.md 条目数
     - 不存在 → 才创建新目录，同时在顶层 index.md 新增一行
   - 不得按平台名（微信/抖音/H5 等）细分子目录，平台相关内容统一归入 `platform/`
   - 至少记录：现象、根因、修复 diff、要点、来源
   - 更新对应领域的 index.md 和顶层 index.md

## 护栏

- 不为简单 bugfix 强行创建 proposal / specs / design / tasks
- 不为简单 bugfix 强行走完整 explore / plan-review / review / archive 链路，除非修复过程中暴露出更大范围风险
- 不因为是 bugfix 就默认跳过测试；先判断，再选择 test-first / characterization-first / direct
- 不扩展范围；如果修着修着变成功能开发，暂停并切回常规工作流
