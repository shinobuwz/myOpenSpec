---
id: 2026-04-28-explore-interactive-question-fallback
created_at: 2026-04-28T07:32:55Z
kind: lite
status: done
source_refs:
  - user:opsx-explore-interactive-question
---

# Explore 交互式问询 Fallback

## 意图

解释 `opsx-explore` 为什么没有主动显示交互式问询，并让该 skill 在不同 Codex mode 下的行为保持确定。

## 范围

- `skills/opsx-explore/SKILL.md`
- `tests/workflow-discipline.test.mjs`
- `.aiknowledge/pitfalls/misc/interactive-question-tool-is-optional.md`
- `.aiknowledge/pitfalls/misc/index.md`
- `.aiknowledge/pitfalls/index.md`
- `.aiknowledge/logs/2026-04.md`

## 变更

- 为 `opsx-explore` 增加明确的问询协议。
- 将 `request_user_input` 定义为 Codex client 和 mode 允许时的可选增强能力。
- 当工具不可用或会话处于 Default mode 时，要求降级为一个普通文本问题，并给出 2-3 个选项/默认值。
- 增加 workflow test，锁定 `request_user_input`、Default mode 和文本 fallback 规则。
- 为后续 skill 作者记录 pitfall。

## 验证

- `rg -n "问询协议|request_user_input|Default mode|降级为普通文本中的单个关键问题" skills/opsx-explore/SKILL.md tests/workflow-discipline.test.mjs` 通过。
- `node --test tests/*.test.mjs` 通过：37 个测试，37 个通过。
- `node bin/opsx.mjs install-skills` 通过，并将 19 个 OPSX skills 安装到 `/Users/cc/.agents/skills`。
- `rg -n "问询协议|request_user_input|Default mode|降级为普通文本中的单个关键问题" /Users/cc/.agents/skills/opsx-explore/SKILL.md` 通过。
- `git diff --check` 通过。

## 风险

这不会让 Codex Default mode 显示交互式提示；它只让 `opsx-explore` 在 runtime 暴露该能力时使用提示，否则用明确的文本 fallback 继续。

## 知识沉淀

新增 `.aiknowledge/pitfalls/misc/interactive-question-tool-is-optional.md`，因为这是 AI client 能力相关的可复用 skill-authoring 约束。
