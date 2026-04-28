---
name: opsx-bugfix
description: 精简 bugfix 工作流。适用于有明确症状、预期行为或复现线索的缺陷修复；不适用于新增功能、需求扩展或需要方案设计的变更。
---

执行精简 bugfix 工作流。目标是用最少步骤完成一个明确缺陷的修复，不为简单问题引入多余文档。

## 适用条件

- 问题边界相对清晰
- 主要目标是修复缺陷，而不是扩展功能
- 不需要先做大范围需求脑暴或复杂方案比较

## 标准路径

读 codemap 辅助定位 → 根因调查 → 单一假设最小验证 → 判断测试策略 → 修复 → 验证 → codemap 更新（按需）→ 经验总结

## 根因铁律

**没有根因，不允许修复。** bugfix 的速度来自少走文档流程，不是跳过调查。修复前必须能回答：

- 现象是什么，预期行为是什么，如何复现或观察？
- 坏值、错误状态或异常行为从哪里产生？
- 哪个最近变更、调用链、配置或状态转移最可能导致问题？
- 当前只有一个明确假设，还是多个猜测混在一起？

如果只能描述症状，继续调查；如果无法稳定复现，先补充日志、最小复现或证据收集。

## 输入 / 输出边界

**读取：**
- 用户提供的症状、预期行为、复现线索
- `.aiknowledge/codemap/`（按需）
- `.aiknowledge/pitfalls/`（按需）
- 相关代码、日志、已有测试

**写入：**
- 相关实现代码和测试代码
- `.aiknowledge/pitfalls/`（新增或更新经验）
- `.aiknowledge/codemap/`（仅在模块边界或链路变化时）

**边界约束：**
- bugfix 默认不创建 `proposal.md`、`design.md`、`specs/`、`tasks.md`
- bugfix 不写 OpenSpec gates；如问题扩大为需求变更，必须切回常规流程

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
   - 如命中领域，读取对应 `<domain>/index.md`；先检查条目状态：
     - `active` → 可直接作为排查约束
     - `stale` → 只能作为线索，验证后才能采用
     - `superseded` / `deprecated` → 不作为默认依据
   - 如有高度相关条目，继续读取 L3 具体条目文件
   - 检查当前 bug 是否与已知陷阱匹配，避免重复踩坑

4. **决定测试策略**
   - 如果 bug 可通过新增失败测试直接复现，使用 `[test-first]`
   - 如果是旧行为不清晰或回归缺陷，先用 `[characterization-first]` 固化现状
   - 仅纯样式、纯配置类缺陷使用 `[direct]`

5. **形成单一假设**
   - 用一句话写清："我认为根因是 X，因为证据 Y"
   - 只保留一个当前要验证的假设；不要一次改多个可能原因
   - 用最小操作验证假设，例如读取调用链、增加临时诊断、运行最小复现、对比工作样例
   - 如果假设被否定，回到根因调查，不要在失败补丁上继续叠加补丁

6. **实施修复**
   - 优先阅读相关代码、日志、已有测试
   - 实施时保持改动最小，不顺手做无关重构
   - 修复必须对应已确认根因；如果代码改动无法解释根因，停止

7. **验证**
   - 运行与 bug 相关的测试或验证命令
   - 如果修复无法被测试证明，明确说明验证依据

8. **Codemap 更新（按需）**
   - 如果 fix 涉及模块边界变化、接口变更或新的跨模块调用链，调用 `opsx-codemap` skill 更新受影响模块
   - 小范围 bugfix（单文件内部逻辑修复）无需更新 codemap

9. **经验总结**
   - 直接在 `.aiknowledge/pitfalls/<领域>/` 中补一条最小经验，或调用 `opsx-knowledge`
   - 如果本次修复验证了已有 pitfall 仍成立：刷新该条目的 `last_verified_at` / `last_verified_by`
   - 如果本次修复证明已有 pitfall 不再成立：将旧条目标记为 `superseded` 或 `deprecated`
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
- 不做猜修；修复前必须说明根因和证据
- 不连续叠加补丁；同一问题连续 3 次修复失败时，停止实现并重新审视架构或问题定义
