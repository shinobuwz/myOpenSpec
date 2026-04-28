---
name: opsx-tasks
description: plan-review 通过后使用，用于把 OpenSpec design 和 specs 转换为可执行、可验证的 tasks.md。
---

# 任务生成

将 `design.md` + `specs/` 转化为带 TDD 标签、文件边界、验收标准和验证方法的 `tasks.md`。完整 task 模板见 `references/task-template.md`，禁止模式见 `references/forbidden-patterns.md`。

## Change Root

- `<name>` 可以是单个 change、父 change 或 `group/subchange` 简写。
- 执行前先运行 `opsx changes resolve <name>` 获取真实 change root。
- 下文 `proposal.md`、`design.md`、`specs/`、`tasks.md` 均指 resolved change root。

## 输入 / 输出边界

读取：
- `.openspec.yaml`
- `proposal.md`
- `design.md`
- `specs/**/*.md`
- `.aiknowledge/pitfalls/`（按需）
- 测试框架配置和现有测试文件

写入：
- `tasks.md`

禁止：
- 不写 gates、`audit-log.md`、`test-report.md`
- 不要求 git commit，除非用户明确要求

## 硬性门控

启动时必须读取 `.openspec.yaml` 并校验 `gates.plan-review` 字段存在；缺失时拒绝执行并提示"请先完成 opsx-plan-review"。

## 铁律

**测试不是单独的 Task。** 测试是每个业务逻辑 task 的一部分，通过 `[test-first]` 或 `[characterization-first]` 标签体现。

**Task 不是意图清单。** 每个 task 必须是可开始执行的最小动作，具备明确文件边界、验收标准和验证命令 / 方法。过粗任务不是 bite-sized，必须重写。

标题行用于扫读进度，只保留执行方式标签和任务名；R/U 追踪只写在详情字段 `需求追踪`。

## 启动序列

1. 校验 `gates.plan-review`。
2. 读取 proposal、design、specs。
3. 按需读取 pitfalls index，并把相关易错点融入验收标准，而不是生成额外 task。
4. 探测测试框架：`package.json`、`pyproject.toml`、`CMakeLists.txt`、`build.gradle`、`pom.xml`、测试目录和 test script。
5. 按 TDD 标签决策规则生成 `tasks.md`。

## TDD 标签决策

每个 task 只能有一个标签：

- 涉及业务逻辑、算法、数据转换、状态变更：`[test-first]`
- 修改已有逻辑、重构、bugfix、行为变更：`[characterization-first]`
- 纯配置、纯类型声明、纯样式、纯脚手架：`[direct]`

无法明确判断为纯 direct 时，默认选择 `[test-first]`。

## Task 字段要求

每个 task 必须包含：

- `需求追踪`
- `执行方式`
- `涉及文件`
- `验收标准`
- `验证命令 / 方法`
- `依赖`

验收标准必须具体可验证，不能写"处理边界情况"、"适当验证"、"完善逻辑"、"保持兼容"这类空泛表达。需要人工验证的标准标注 `[manual]` 并写明验证方法。

## 完成条件

- `tasks.md` 已写入。
- 每个 task 字段完整且只有一个执行方式标签。
- 没有独立"编写测试"任务。
- `[test-first]` / `[characterization-first]` task 的涉及文件包含测试路径。
- 已执行测试框架探测；如需配置测试框架，生成 Task 0。

## 退出契约

必须转入 **opsx-task-analyze** 进行 plan↔tasks 一致性审查。输出摘要：task 数、各 TDD 标签数量，以及包含 `[manual]` 验收标准的 task 数量。
