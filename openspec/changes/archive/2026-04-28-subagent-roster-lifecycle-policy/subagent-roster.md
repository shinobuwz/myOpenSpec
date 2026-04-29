# Subagent Roster Summary

本文件记录 `2026-04-28-subagent-roster-lifecycle-policy` change 中关键 subagent 使用事件，便于人工审计。

它不替代 `.openspec.yaml` gates、`audit-log.md`、`review-report.md` 或 `test-report.md`。运行态 roster JSON 应写入 `.opsx/subagents/*.json`，不进入 git。

## Events

| 阶段 | Agent | Dispatch class | 事件 | 摘要 |
|------|-------|----------------|------|------|
| plan-review | Mencius | gate-reviewer | spawn → completed → close | 审查 specs/design 的 R1-R6 追踪关系，通过后结果写入 `audit-log.md`。 |
| task-analyze | Nietzsche | gate-reviewer | spawn → completed → close | 审查 tasks 覆盖 R1-R6 与 U1-U2，通过后结果写入 `audit-log.md`。 |
| verify | Kuhn | gate-reviewer | spawn → completed → close | 验证实现覆盖 R1-R6，测试和 slimming 证据通过。 |
| review | James | gate-reviewer | spawn → completed → close | 首轮 release-risk review 指出新 reference 文件未进入 diff 视角。 |
| review | Rawls | gate-reviewer | spawn → completed → close | 重新审查包含 intent-to-add 的 `lifecycle.md` diff，通过。 |
| smoke | Mill | retrieval-explorer | spawn → completed → close | 验证 spawn/wait/close 状态链路。 |
| smoke reuse | Ohm | retrieval-explorer | spawn → completed → reuse via send_input → completed → close | 验证 completed_reusable agent 可复用，并在结果消费后关闭。 |
| plan-review rerun | Einstein | gate-reviewer | spawn → completed → close | 扩展 R7/R8 后首轮审查，提示 design 缺少 `version` 字段落点。 |
| plan-review rerun | Boyle | gate-reviewer | spawn → completed → close | 复核 runtime JSON version 后，提示精确路径和 fallback 需进入 design。 |
| plan-review rerun | Banach | gate-reviewer | spawn → completed → close | 复核精确路径后，提示 `version` 字段应进入决策段。 |
| plan-review rerun | Linnaeus | gate-reviewer | spawn → completed → close | R7/R8 设计追踪无 warning 通过，结果写入 `audit-log.md`。 |
| task-analyze rerun | McClintock | gate-reviewer | spawn → completed → close | 指出 tasks 缺少 runtime JSON `version` 字段验收。 |
| task-analyze rerun | Beauvoir | gate-reviewer | spawn → completed → close | R7/R8 tasks 覆盖通过，结果写入 `audit-log.md`。 |
| verify rerun | Gibbs | gate-reviewer | spawn → completed → close | 验证实现、测试、slimming、全局安装和 roster 摘要证据，通过。 |
| review rerun | Euler | gate-reviewer | spawn → completed → close | 指出 review gate 已过期，并发现 Rawls close 事件漏写。 |
| final review | Helmholtz | gate-reviewer | spawn → completed → close | 最终 release-risk review，覆盖 R7/R8、version、runtime JSON 非 gate、roster 摘要和测试证据。 |
| pre-archive verify | Poincare | gate-reviewer | spawn → completed → close | 归档前复验两个 subagent changes，无 findings；结果写入各自 `audit-log.md` 并刷新 verify gate。 |

## Capacity Notes

- 本 change 验证了 completed no-reuse agents 应在结果消费后关闭，避免 release-risk review 前触发 thread limit。
- 未关闭 running agent；所有 close 都发生在 completed 之后。
- 当前没有记录 `.opsx/subagents/*.json` 实例文件；本 change 只定义 contract、ignore 规则和摘要格式，runtime helper 留待后续调研。
