---
name: opsx-tasks
description: plan-review 通过后使用，用于把 OpenSpec design 和 specs 转换为可执行、可验证的 tasks.md。
---

任务生成 Skill。将 design.md + specs/ 转化为带 TDD 标签的 tasks.md。

## Change Root 解析

- `<name>` 可以是单个 change、父 change 或 `group/subchange` 简写。
- 执行前先运行 `opsx changes resolve <name>` 获取真实 change root。
- 后文所有 `proposal.md`、`design.md`、`specs/`、`tasks.md` 路径均指 resolved change root。

## 输入 / 输出边界

**读取：**
- `.openspec.yaml`（校验 gates.plan-review）
- `proposal.md`
- `design.md`
- `specs/**/*.md`
- `.aiknowledge/pitfalls/`（按需）
- 测试框架配置文件（按存在情况）：`package.json`、`pyproject.toml`、`CMakeLists.txt`、`build.gradle`、`pom.xml`、`*.xcodeproj`
- 现有测试文件（按存在情况）

**产出：**
- `tasks.md`（新建）

**边界约束：**
- tasks 只产出 `tasks.md`，不写 gates、`audit-log.md`、`test-report.md`
- 不要求在 tasks 阶段执行 git 提交；只有用户明确要求时才提交

## 铁律

**测试不是单独的 Task。** 测试是每个业务逻辑 task 的一部分，体现在执行方式标签 `[test-first]` 上。禁止在 tasks.md 中出现独立的"编写测试"任务。

**Task 不是意图清单。** 每个 task 必须是 2-5 分钟可开始执行的最小动作，具备明确文件边界、验收标准和验证方法。含糊 task 会让后续 implement 猜测需求，必须重写。

## 启动序列

1. 读取 `openspec/changes/<name>/.openspec.yaml`，**校验 `gates.plan-review` 字段存在**；如不存在，拒绝执行并提示"请先完成 opsx-plan-review"
2. 读取 `.openspec.yaml` 中的 `artifacts` 配置获取 tasks 的模板和输出路径
3. 读取 proposal.md、design.md、所有 specs/ 文件
4. 按需读取 `.aiknowledge/pitfalls/`：
   - 先读 `.aiknowledge/pitfalls/index.md`（如存在），识别当前变更涉及的领域
   - 仅读取命中领域的 `<domain>/index.md`，不全量扫描
   - 将已知易错点融入对应 task 的验收标准（而非生成额外 task）
5. 主动探测测试框架（见下方）
6. 按 TDD 标签决策规则生成 tasks.md

## 测试框架探测（必须执行）

在生成 tasks 之前，必须主动确认测试框架状态：

```bash
# 探测项目测试框架
ls package.json pyproject.toml CMakeLists.txt build.gradle 2>/dev/null
cat package.json 2>/dev/null | grep -E '"test"|"vitest"|"jest"'
ls src/**/*.test.* tests/ test/ __tests__/ 2>/dev/null | head -5
```

| 发现 | 结论 |
|------|------|
| 有测试文件 + 测试命令 | 测试框架就绪，直接使用 |
| 有 package.json 但无测试配置 | 须在第一个 `[test-first]` task 前添加 **Task 0: 配置测试框架** `[direct]` |
| 完全无测试基础设施 | 须添加 **Task 0: 搭建测试框架** `[direct]`，此 task 的验收标准是"跑通一个空测试" |

## TDD 标签决策规则

每个 task 必须从以下三个选项中选一个，选择逻辑严格按顺序判断：

```
1. 这个 task 涉及业务逻辑、算法、数据转换、状态变更？
   → [test-first]

2. 这个 task 修改已有逻辑（重构/bug修复/行为变更）？
   → [characterization-first]（先固化旧行为，再改动）

3. 纯配置文件、纯类型声明（无逻辑）、纯 UI 样式、纯脚手架？
   → [direct]
   ⚠️ 如果有任何"判断/计算/副作用"，就不是 [direct]
```

**默认倾向 `[test-first]`**：如果无法明确判断属于规则3，选 `[test-first]`。

## tasks.md 格式

**一个 Task 只允许一个执行方式标签。** 如果一个功能区块同时需要 `[characterization-first]`（保护旧行为）和 `[test-first]`（驱动新行为），必须拆成两个独立 Task，各自持有单一标签。混合标签说明它是两个不同性质的工作。

任务标题行用于扫读进度，只保留执行方式标签和任务名，不重复 R/U 映射：

```markdown
- [ ] 2.1 [test-first] Add workflow discipline regression tests
```

R/U 映射只写在详情字段 `需求追踪` 中，避免标题行和详情重复后产生不一致。

每个 task 必须包含以下字段：

```markdown
## Task N：<动词开头的描述>

**需求追踪**：[RX] → [UY]
**执行方式**：[test-first | characterization-first | direct]
**涉及文件**：
- `src/...` — 实现
- `test/...` — 测试（test-first/characterization-first 必填）

**验收标准**：
- [ ] <具体可验证的标准 1>
- [ ] [manual] <需要人工验证的标准，说明验证方法>
- [ ] <具体可验证的标准 2>

**验证命令 / 方法**：
- `<command>`，预期：<通过条件>

**依赖**：Task M（如有）
```

### `[manual]` 标注规则

当验收标准无法通过自动化测试验证时（如需要特定设备、网络环境、UI 交互、第三方服务），在该条前加 `[manual]`。标注时必须附带验证方法描述（如"弱网环境下观察重连行为"）。`[manual]` 项不影响 TDD 标签选择——一个 `[test-first]` task 可以同时包含自动化和人工验收标准。

## 禁止模式

以下任何情况出现，必须重写对应 task：

| 禁止 | 原因 |
|------|------|
| Task N: "编写单元测试" / "添加测试" | 测试不是独立 task |
| Task N `[direct]` 涉及函数逻辑 | 应改为 `[test-first]` |
| task 标题行包含 `[R1]` / `[U1]` 等追踪标签 | 追踪信息只写在 `需求追踪` 字段，避免重复不一致 |
| task 没有"需求追踪"字段 | 无法做 plan ↔ task 一致性检查 |
| task 没有"涉及文件"字段 | 无法验证实现边界 |
| task 没有验收标准 | 无法判断完成 |
| task 没有"验证命令 / 方法"字段 | 无 fresh evidence 来源 |
| `[test-first]` task 的涉及文件里没有测试文件 | 缺失测试路径 |
| 同一 Task 内混合 `[test-first]` 和 `[characterization-first]` 子步骤 | 两种 TDD 模式是不同性质的工作，必须拆为独立 Task |
| 验收标准写"处理边界情况"、"适当验证"、"完善逻辑"、"保持兼容"但没有具体场景 | 不可执行、不可验证 |
| 一个 task 同时修改多个互不依赖的行为 | 不是 bite-sized，必须拆分 |

## 完成条件

- tasks.md 已写入 outputPath
- 每个 task 有完整的 5 个字段
- 每个 task 都有"验证命令 / 方法"
- 没有独立的"测试 task"
- 已执行测试框架探测，如需配置则已添加 Task 0

## 退出契约

- **必须**转入 **opsx-task-analyze** 进行 plan↔tasks 一致性审查。这不是建议，是强制要求。
- 输出摘要：生成了几个 task，其中 test-first/characterization-first/direct 各几个，包含 `[manual]` 验收标准的 task 数量
