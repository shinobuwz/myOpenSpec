## ADDED Requirements

### 需求:检查必须阻止 canonical contract 回流
**Trace**: R10
**Slice**: skill-slimming-validation/canonical-duplicates
本变更必须更新或补充测试，确保完整 StageResult schema、subagent 平台映射和 `.aiknowledge` lifecycle 正文不会回流到非 canonical `SKILL.md`。

#### 场景: 维护者运行测试
- **当** 运行 `npm test`
- **那么** 测试会检查被迁移的 gate/execution skills 仅引用 canonical docs，而不复制完整公共契约正文

### 需求:检查必须反映 gate skill 瘦身结果
**Trace**: R11
**Slice**: skill-slimming-validation/line-counts
`scripts/check-skill-slimming.mjs --json` 与 `docs/skill-slimming-inventory.md` 必须反映 03 完成后的最新入口行数和剩余风险。

#### 场景: 维护者验证 03
- **当** 运行 `node scripts/check-skill-slimming.mjs --json`
- **那么** 输出中 gate/reviewer/execution support skills 的行数显著下降，duplicate candidates 不再包含本次已迁移的 StageResult 或平台映射复制

### 需求:现有 workflow discipline tests 必须继续通过
**Trace**: R12
**Slice**: skill-slimming-validation/regression-tests
瘦身后现有 workflow discipline tests 必须继续锁定关键行为。

#### 场景: 维护者运行全量测试
- **当** 运行 `npm test`
- **那么** gate 前置条件、verify/review 边界、fresh evidence 规则、parallel worker 边界、中文产物语言和 lite-run 中文字段等既有断言继续通过
