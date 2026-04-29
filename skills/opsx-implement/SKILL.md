---
name: opsx-implement
description: 按 tasks.md 逐项实施，每项强制 TDD 循环。当 OpenSpec change 的 artifact 全部就绪、准备开始编码时使用。
---

# 实施

按 `tasks.md` 顺序实施，每个 `[test-first]` / `[characterization-first]` task 调用 `opsx-tdd`。worker prompt 和执行细则见 `references/worker-contract.md` 与 `references/execution-rules.md`。

## Change Root

- `<name>` 可以是单个 change、父 change 或 `group/subchange` 简写。
- 执行前先运行 `opsx changes resolve <name>` 获取真实 change root。
- 下文 `proposal.md`、`design.md`、`specs/`、`tasks.md`、`test-report.md` 均指 resolved change root。

## 硬性门控

进入实施前必须读取 `.openspec.yaml` 并校验 `gates.plan-review` 和 `gates.task-analyze` 字段均存在；任一缺失则拒绝执行，提示先完成对应审查。

## 输入 / 输出边界

读取：
- `.openspec.yaml`
- `tasks.md`
- `design.md`
- `specs/**/*.md`
- `.aiknowledge/codemap/` 和 `.aiknowledge/pitfalls/`（按需）
- tasks 中列出的实现、测试、skill、docs 文件

写入：
- `tasks.md` 顶层任务 `[ ]` → `[x]`
- `tasks.md` 验收标准 `[ ]` → `[x]`
- 实现和测试文件
- `test-report.md`

禁止：
- 不写 gates
- 不写 `audit-log.md` 或 `review-report.md`
- Git 检查和 checkpoint 判断按 `~/.opsx/common/git-lifecycle.md`

## 启动序列

1. 校验 `gates.plan-review` 和 `gates.task-analyze`。
2. 读取 `tasks.md`，从第一个未完成 task 恢复。
3. 确认 proposal/design/specs/tasks 已就绪。
4. 按 index-first 策略读取 `.aiknowledge/`。
5. 按 `~/.opsx/common/git-lifecycle.md` 检查当前分支和 dirty tree。
6. 确认测试框架可运行。

## Worker 策略

按 `opsx-subagent` implementation worker contract 执行。Codex 默认、Claude Code 兼容映射、controller boundary、status 和 fallback 均以 `opsx-subagent` 为准；主 agent 保留 controller 权限。

`opsx-implement` 默认串行（serial-by-default）。只有任务簇独立、写入集合不重叠（disjoint write sets）、明确 file ownership、依赖顺序清楚，且不并发修改 public interface、migration、schema、config、package/build scripts 时，才允许多个 workers。

依赖顺序不清、任务边界不清、共享接口或共享 artifact 场景必须串行。共享 artifact 包括 `tasks.md`、`test-report.md`、`.openspec.yaml`、`audit-log.md`、`review-report.md`、`.aiknowledge/logs/YYYY-MM.md`，始终由主 agent 串行写入。

主 agent 使用多个 workers 时必须明确读取范围、写入范围和禁止越界文件，逐个检查 worker diff，处理 `DONE_WITH_CONCERNS`、`NEEDS_CONTEXT`、`BLOCKED`，并串行整合状态。

## 执行规则

- 按 `tasks.md` 顺序逐项实施。
- `[test-first]` 严格红→绿→重构。
- `[characterization-first]` 先固化旧行为，再迁移到目标行为。
- `[direct]` 仅用于纯配置/脚手架，无需 TDD 留档。
- 每条非 `[manual]` 验收标准必须有测试、验证命令或明确无需测试理由。
- 没有证据的验收标准不得勾选。
- 未验证的 `[manual]` 项保持 `[ ]`，并写入 `test-report.md` 待人工验证清单。
- 每完成一项，立即更新 `tasks.md` 和 `test-report.md`，禁止事后汇总。
- 每完成一个顶层 task，按 `~/.opsx/common/git-lifecycle.md` 判断是否建议 checkpoint。

## 完成条件

- 所有顶层任务已 `[x]`。
- 每个已完成 task 的非 `[manual]` 验收标准均已 `[x]` 且有证据。
- 所有测试通过。

## 退出契约

输出实施摘要、测试结果和待人工验证清单。完成后必须转入 **opsx-verify**，禁止跳过验证直接归档。
