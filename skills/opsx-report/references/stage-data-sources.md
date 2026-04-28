# Stage Data Sources

## 读取顺序

1. 读取 `.openspec.yaml` 获取 schema 和 gates 时间戳。
2. 读取 `audit-log.md` 获取 plan-review、task-analyze、verify 的最后一条 decision。
3. 读取 `test-report.md` 获取 TDD 三阶段状态。
4. 读取 `review-report.md` 获取 code-review 的最后一条 decision。
5. 读取 `specs/`、`design.md`、`tasks.md` 渲染 trace 矩阵和 task 列表。

## Gate 状态

- audit-log 中最后一条 stage decision 为 pass/pass_with_warnings：pass。
- audit-log 中最后一条 stage decision 为 fail：fail。
- 缺少对应记录：pending。
- tdd 从 `test-report.md` 判断所有 TDD task 是否有红、绿、重构记录。
- review 从 `review-report.md` 最后一条 code-review 记录判断。
- `.openspec.yaml` gates 优先于 report decision。

## 缺失数据

- `audit-log.md` 不存在：相关 gate pending。
- `test-report.md` 不存在：TDD 显示无数据或无 TDD 任务。
- `review-report.md` 不存在：review 显示未执行。
- specs/design/tasks 缺失：对应板块显示"数据不可用"。
