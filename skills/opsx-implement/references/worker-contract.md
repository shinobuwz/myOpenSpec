# Implement Worker Contract

主 agent 可按 `~/.opsx/common/subagent.md` contract 派发 implementation worker。共享 artifact 仍由主 agent 串行写入。

## Worker 输入

- 读取 `tasks.md` 找到被分配任务或第一个 `[ ]` 任务。
- 读取 `design.md` 和 `specs/**/*.md` 理解需求。
- 读取 `skills/opsx-tdd/SKILL.md`，遵守 `test-report.md` 格式。
- 如主 agent 分配并行任务簇，只能修改声明的 file ownership 范围。

## 禁止

- 禁止修改共享 artifact：`tasks.md`、`test-report.md`、`.openspec.yaml`、`audit-log.md`、`review-report.md`。
- 禁止越界修改未授权文件。
- 禁止把 worker 的局部 `DONE` 当成 verify/review/archive gate。

## Status

worker 最终返回：

- `DONE`
- `DONE_WITH_CONCERNS`
- `NEEDS_CONTEXT`
- `BLOCKED`

主 agent 处理非 DONE 状态，必要时暂停或回到 plan/tasks。
