---
status: active
created_at: 2026-04-28
created_from: change:2026-04-28-subagent-workflow-adapter/01-subagent-contract
last_verified_at: 2026-04-28
last_verified_by: opsx-archive
verification_basis: archive
applies_to:
  - skills/opsx-subagent/SKILL.md
  - docs/supported-tools.md
  - skills/opsx-*.md
source_refs:
  - change:2026-04-28-subagent-workflow-adapter/01-subagent-contract
  - review-report:openspec/changes/archive/2026-04-28-subagent-workflow-adapter-01-subagent-contract/review-report.md
superseded_by:
merged_from:
deprecated_reason:
---

# Subagent platform mapping belongs in a central contract

**标签**：[opsx, subagent, codex, claude, workflow]

## 现象

多个 workflow skill 都需要说明如何派发 implementation、review 或 exploration subagent。如果每个 skill 都各自写 Codex `spawn_agent`、Claude Code `Task`、status handling 和写入边界，后续很容易出现平台描述漂移。

## 根因

Subagent 派发是横切契约，不是某个单独 workflow stage 的业务规则。把平台映射分散写在 `opsx-implement`、`opsx-verify`、`opsx-review`、`opsx-explore` 中，会导致：

- Claude-only `Task` / `subagent_type` 文案回流。
- Codex `spawn_agent` 默认语义被漏写。
- 主 agent / subagent 权责边界不一致。
- reviewer 输出绕开 StageResult、audit-log 或 review-report。

## 修复前

```diff
- skills/opsx-implement/SKILL.md: 使用 Agent tool 启动 subagent...
- skills/opsx-explore/SKILL.md: subagent_type: "Explore"
- docs/supported-tools.md: Codex 复用同一文档，不提供单独 prompt 产物
```

## 修复后

```diff
+ skills/opsx-subagent/SKILL.md:
+ - Codex default: spawn_agent(agent_type="worker"|"explorer", message=...)
+ - Claude Code compatibility: Task tool with general-purpose / Explore
+ - main agent is controller
+ - shared artifacts are written serially
+ - reviewer results return to StageResult / audit-log / review-report
```

## 要点

平台适配、controller 权限、写入边界、status 和 fallback 应集中在 `opsx-subagent` contract；其他 workflow skill 只引用 contract，避免复制一整套 subagent 派发规则。

## 来源

change: 2026-04-28-subagent-workflow-adapter/01-subagent-contract
