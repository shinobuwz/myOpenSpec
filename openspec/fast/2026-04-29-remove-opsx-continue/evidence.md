# Evidence：2026-04-29-remove-opsx-continue

正文默认使用中文；路径、命令、配置键名和状态枚举保持原文。

## TDD 策略证据

- 策略: characterization-first
- 选择理由: 删除 skill 入口前需要确认现有 tests 对 skill 数量、引用和 status 路由的基线。
- 跳过 TDD 理由（direct 必填）: 不适用。
- 替代验证: targeted tests 与 `npm test`。

## 命令证据

### 2026-04-29 16:27

- 命令: `node --test tests/skill-slimming.test.mjs`
- 退出状态: 0
- 结果摘要: 7 项通过；删除 `opsx-continue` 后 skill slimming 统计为 17 个 skills。

### 2026-04-29 16:27

- 命令: `node --test tests/workflow-discipline.test.mjs`
- 退出状态: 0
- 结果摘要: 21 项通过；`docs/supported-tools.md` 记录的 skill 清单与实际 `skills/opsx-*` 目录一致。

### 2026-04-29 16:27

- 命令: `node --test tests/changes-helper.test.mjs`
- 退出状态: 0
- 结果摘要: 14 项通过；`opsx changes status` / group resolve / fast next-step 行为保持可用。

### 2026-04-29 16:27

- 命令: `node scripts/check-skill-slimming.mjs --json --fail-on-duplicates`
- 退出状态: 0
- 结果摘要: `totalSkills=17`、`totalLines=1241`、`oversized=0`、`duplicates=0`。

### 2026-04-29 16:27

- 命令: `rg -n "opsx-continue" README.md docs tests scripts skills package.json || true`
- 退出状态: 0
- 结果摘要: 用户文档、测试、脚本和 skill 源中无 `opsx-continue` 引用。

### 2026-04-29 16:27

- 命令: `npm test`
- 退出状态: 0
- 结果摘要: 63 项通过，0 失败。

## 人工观察证据

### 2026-04-29 00:00

- 观察内容: `opsx changes -p . status` 显示当前没有 active formal change。
- 结果: 可使用 fast item 承载本次低风险清理。
- 结论: 适合 fast 流程。

### 2026-04-29 16:27

- 观察内容: diff 删除 `skills/opsx-continue/SKILL.md`，README / docs 改为通过 `opsx changes status` 查看 `Next:` 后点名对应 skill；`tests/skill-slimming.test.mjs` 的 skill 数量调整为 17。
- 结果: 恢复入口从独立 skill 收敛到 CLI status，不改动 runtime CLI 行为。
- 结论: 变更满足 fast item 的意图和范围。

## 被否定的尝试
