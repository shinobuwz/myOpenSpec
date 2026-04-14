---
name: opsx-tasks
description: 生成 tasks.md，强制为每个 task 分配正确的 TDD 执行模式标签。在 plan-review 通过后使用。
---

任务生成 Skill。将 design.md + specs/ 转化为带 TDD 标签的 tasks.md。

## Change Root 解析

- `<name>` 可以是单个 change、父 change 或 `group/subchange` 简写。
- 执行前先运行 `bash .claude/opsx/bin/changes.sh resolve <name>` 获取真实 change root。
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
- [ ] <具体可验证的标准 2>

**依赖**：Task M（如有）
```

## 禁止模式

以下任何情况出现，必须重写对应 task：

| 禁止 | 原因 |
|------|------|
| Task N: "编写单元测试" / "添加测试" | 测试不是独立 task |
| Task N `[direct]` 涉及函数逻辑 | 应改为 `[test-first]` |
| task 没有"涉及文件"字段 | 无法验证实现边界 |
| task 没有验收标准 | 无法判断完成 |
| `[test-first]` task 的涉及文件里没有测试文件 | 缺失测试路径 |

## 完成条件

- tasks.md 已写入 outputPath
- 每个 task 有完整的 4 个字段
- 没有独立的"测试 task"
- 已执行测试框架探测，如需配置则已添加 Task 0

## 退出契约

- **必须**转入 **opsx-task-analyze** 进行 plan↔tasks 一致性审查。这不是建议，是强制要求。
- 输出摘要：生成了几个 task，其中 test-first/characterization-first/direct 各几个
