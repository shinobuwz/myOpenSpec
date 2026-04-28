---
name: opsx-tdd
description: 测试先行铁律。强制红绿重构循环，自动探测多语言测试框架。当任务标注为 [test-first] 或 [characterization-first] 时使用（[direct] 模式跳过本 skill）。
---

# TDD 循环

按 task 标签执行测试先行。完整红绿重构步骤见 `references/red-green-refactor.md`，`test-report.md` 模板见 `references/test-report-template.md`，反模式见 `references/anti-patterns.md`。

## 铁律

**先写测试，再写代码。没有例外。** 任何产品代码都必须遵循红 → 绿 → 重构循环；发现自己先写实现时立即停止。

## 输入 / 输出边界

读取：
- 当前 task 的需求、验收标准、执行标签
- 命中的 `.aiknowledge/pitfalls/`
- 测试框架配置
- 当前 task 涉及的实现文件和测试文件

写入：
- 测试代码和对应实现代码
- `test-report.md`

禁止：
- 不写 `.openspec.yaml` gates
- 不要求 git commit，除非上层流程或用户明确要求

## 启动序列

1. 确认当前 task 的需求、验收标准和执行方式。
2. 探测并确认测试框架可运行。
3. 按需读取 pitfalls index；命中具体条目时继续读取 L3 详情。
4. 根据标签执行：
   - `[test-first]`：严格红 → 绿 → 重构。
   - `[characterization-first]`：先固化当前行为，再修改断言到目标行为；断言变更必须记录理由。
   - `[direct]`：跳过本 skill，由 implement 直接执行。

## 红绿重构摘要

- 红：写最小失败测试，确认失败原因是合法红；假红先修测试并记录。
- 绿：写最少代码让测试通过，记录通过用例、变更摘要、测试变更记录和验收标准覆盖表。
- 重构：在测试保护下改善代码质量，再运行测试；记录通过用例、变更摘要和覆盖率。

每个阶段完成后立即追加 `test-report.md`，禁止事后一次性汇总。

## `[manual]` 验收标准

`[manual]` 项不阻塞自动化 TDD 循环，但必须在 `test-report.md` 对应 task 中列入待人工验证清单。已人工验证才可在 `tasks.md` 勾选；未验证保持 `[ ]`。

## 覆盖率规则

重构阶段必须写覆盖率。优先填写真实数字和采集命令；无法采集时必须写明原因和补救方式，禁止裸 `N/A`。

## 完成条件

- 所有非 `[manual]` 验收标准都有测试或明确的无需测试理由。
- 所有测试通过。
- 代码已经过重构。
- `test-report.md` 包含红、绿、重构三阶段记录。
- `[manual]` 项已进入待人工验证清单。

## 退出契约

输出新增测试、覆盖行为和验证结果摘要；如存在未验证 `[manual]` 项，列出待人工验证清单和风险。
