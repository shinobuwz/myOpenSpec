# Tasks: Detailed `opsx changes status`

## Task 1：区分 list 与 status 输出

- [x] 1.1 区分 list 与 status 输出

**需求追踪**：[R1] → [U1]
**执行方式**：[characterization-first]
**涉及文件**：
- `runtime/bin/changes.sh` — `list` / `status` 分支和 status 渲染逻辑
- `tests/changes-helper.test.mjs` — 先固化 list 的紧凑输出，再断言 status 的诊断头

**验收标准**：
- [ ] `opsx changes list` 仍输出活动变更清单
- [ ] `opsx changes list` 不输出 `Project:`
- [ ] `opsx changes status` 输出 `Project:` 和活动 change 详情

**依赖**：无

## Task 2：展示 gates、reports 与下一步建议

- [x] 2.1 展示 gates、reports 与下一步建议

**需求追踪**：[R2][R3] → [U1]
**执行方式**：[test-first]
**涉及文件**：
- `runtime/bin/changes.sh` — gate/report 读取和 next-step 推断
- `tests/changes-helper.test.mjs` — gate/report/next 输出测试

**验收标准**：
- [ ] status 展示 `plan-review`、`task-analyze`、`verify`、`review` gate
- [ ] 缺失 gate 显示为 `missing`
- [ ] status 展示 `audit-log.md`、`test-report.md`、`review-report.md` 是否存在
- [ ] gates 全部存在时下一步建议为 `opsx-archive`
- [ ] verify 存在但 review 缺失时下一步建议为 `opsx-review`

**依赖**：Task 1
