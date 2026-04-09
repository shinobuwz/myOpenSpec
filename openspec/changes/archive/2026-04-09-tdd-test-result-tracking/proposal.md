## 为什么

当前 TDD 工作流（openspec-tdd skill）要求 AI 执行红→绿→重构循环，但每次运行测试的结果仅存在于对话记录中，不会留下可持久追溯的文档。这导致"测试是否通过"和"红→绿过程是否真实发生"无法在归档时被验证。

## 变更内容

- **openspec-tdd skill**：在红、绿、重构三个阶段每次运行测试后，立即将结果追加写入 `test-report.md`（实时更新，非事后汇总）
- **openspec-verify skill**：新增维度4——测试留档完整性检查，归档前验证 `test-report.md` 存在且覆盖所有 task，不完整则阻止归档
- `test-report.md` 格式规范：记录每个 task 的红→绿时间戳、测试用例通过/失败列表、验收标准覆盖对应表、覆盖率数字

## 功能 (Capabilities)

### 新增功能

- `tdd-test-result-tracking`: TDD 执行过程中实时写入测试结果到 `test-report.md`，涵盖格式规范和写入时机

### 修改功能

- `opsx-verify-skill`: 新增测试留档完整性检查维度，归档前强制校验 `test-report.md`

## 影响

- `.claude/skills/openspec-tdd/SKILL.md`：退出契约新增实时写入 test-report.md 的要求
- `src/core/templates/workflows/tdd.ts`：同步更新 skill 源码
- `.claude/skills/openspec-verify/SKILL.md`：新增维度4
- `src/core/templates/workflows/verify.ts`：同步更新 skill 源码
