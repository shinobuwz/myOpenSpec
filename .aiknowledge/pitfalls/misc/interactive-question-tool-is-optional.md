---
status: active
created_at: 2026-04-28
created_from: lite-run:2026-04-28-explore-interactive-question-fallback
last_verified_at: 2026-04-28
last_verified_by: opsx-bugfix
verification_basis: skill patch + workflow test
applies_to:
  - skills/opsx-explore/SKILL.md
  - Codex request_user_input
source_refs:
  - lite-run:2026-04-28-explore-interactive-question-fallback
superseded_by:
---

# Interactive Question Tool Is Optional

## 现象

`opsx-explore` 需要主动澄清或收束问题时，没有弹出交互式问询框，用户容易判断为 Codex 不支持或 skill 未生效。

## 根因

交互式问询是运行时能力，不是所有会话模式都可用。Codex Default mode 下 `request_user_input` 不可用；如果 skill 只写“主动询问”而不写工具可用性与降级策略，agent 会自然改用普通对话或继续推进。

## 修复 diff

- 在 `skills/opsx-explore/SKILL.md` 增加“问询协议”。
- 明确 `request_user_input` 只在客户端和模式允许时使用。
- 明确不可用时降级为普通文本中的单个关键问题。
- 在 `tests/workflow-discipline.test.mjs` 增加断言，防止规则回退。

## 要点

不要把特定客户端工具写成 workflow 的硬依赖。skill 应描述稳定行为：主动问询、每轮一个关键问题、可弹则弹、不能弹则文本问。

## 来源

用户反馈 `opsx-explore` 没有主动弹出交互式问询；本次排查确认 `opsx-explore` 缺少 `request_user_input`、Default mode 和 fallback 说明。
