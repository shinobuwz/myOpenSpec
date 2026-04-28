---
id: 2026-04-28-explore-interactive-question-fallback
created_at: 2026-04-28T07:32:55Z
kind: lite
status: done
source_refs:
  - user:opsx-explore-interactive-question
---

# Explore Interactive Question Fallback

## Intent

Clarify why `opsx-explore` did not proactively show an interactive question prompt and make the skill behavior deterministic across Codex modes.

## Scope

- `skills/opsx-explore/SKILL.md`
- `tests/workflow-discipline.test.mjs`
- `.aiknowledge/pitfalls/misc/interactive-question-tool-is-optional.md`
- `.aiknowledge/pitfalls/misc/index.md`
- `.aiknowledge/pitfalls/index.md`
- `.aiknowledge/logs/2026-04.md`

## Changes

- Added an explicit inquiry protocol to `opsx-explore`.
- Defined `request_user_input` as an optional enhancement when the Codex client and mode allow it.
- Required fallback to one normal text question with 2-3 options/defaults when the tool is unavailable or the session is in Default mode.
- Added a workflow test that locks the `request_user_input`, Default mode, and text fallback rules.
- Recorded a pitfall for future skill authors.

## Verification

- `rg -n "问询协议|request_user_input|Default mode|降级为普通文本中的单个关键问题" skills/opsx-explore/SKILL.md tests/workflow-discipline.test.mjs` passed.
- `node --test tests/*.test.mjs` passed: 37 tests, 37 pass.
- `node bin/opsx.mjs install-skills` passed and installed 19 OPSX skills to `/Users/cc/.agents/skills`.
- `rg -n "问询协议|request_user_input|Default mode|降级为普通文本中的单个关键问题" /Users/cc/.agents/skills/opsx-explore/SKILL.md` passed.
- `git diff --check` passed.

## Risks

This does not make Codex Default mode show an interactive prompt. It makes `opsx-explore` use the prompt only when the runtime exposes it and otherwise continue with an explicit text fallback.

## Knowledge

Added `.aiknowledge/pitfalls/misc/interactive-question-tool-is-optional.md` because this is a reusable skill-authoring constraint for AI client capabilities.
