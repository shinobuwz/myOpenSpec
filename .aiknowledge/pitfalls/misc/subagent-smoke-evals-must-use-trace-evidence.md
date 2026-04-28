---
status: active
created_at: 2026-04-28
created_from: change:2026-04-28-subagent-workflow-adapter/04-subagent-smoke-eval
last_verified_at: 2026-04-28
last_verified_by: opsx-archive
verification_basis: archive
applies_to:
  - scripts/eval-subagent-smoke.mjs
  - scripts/lib/subagent-trace-parser.mjs
  - evals/subagent-smoke
source_refs:
  - change:2026-04-28-subagent-workflow-adapter/04-subagent-smoke-eval
  - test-report:openspec/changes/archive/2026-04-28-subagent-workflow-adapter-04-subagent-smoke-eval/test-report.md
  - review-report:openspec/changes/archive/2026-04-28-subagent-workflow-adapter-04-subagent-smoke-eval/review-report.md
superseded_by:
merged_from:
deprecated_reason:
---

# Subagent smoke evals must use trace evidence

**标签**：[opsx, subagent, eval, codex, trace]

## 现象

模型最终回答可能声称已经启用了 subagent，但这不能证明运行时真的发生了 `spawn_agent`、`wait` 或 `close_agent` 调用。

## 根因

LLM 的最终自然语言或最终 JSON 是模型自述，不是执行证据。真实 subagent 行为发生在 Codex JSONL event stream 中；如果只检查最终输出，就会把“模型说用了 subagent”和“runtime 真的创建了 subagent”混为一谈。

## 修复前

```diff
- 手动运行 codex exec 后阅读最终回答
- 如果最终回答说 subagent_result_seen=true，就认为通过
```

## 修复后

```diff
+ 保存 codex exec --json 输出到 .tmp/opsx-evals/
+ 解析 JSONL trace:
+ - spawn_agent completed 且 receiver_thread_ids 非空
+ - wait 返回 completed subagent state
+ - close_agent completed（缺失时 warning）
+ - final JSON 只作为辅助信号
```

## 要点

模型 eval 的通过条件必须基于 runtime trace evidence；最终 JSON 只能作为一个被 trace 佐证的信号。

## 来源

change: 2026-04-28-subagent-workflow-adapter/04-subagent-smoke-eval
