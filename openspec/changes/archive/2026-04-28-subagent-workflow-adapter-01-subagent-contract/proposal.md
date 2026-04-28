# Goal

Create a central OPSX subagent contract that absorbs the useful parts of Superpowers' subagent-driven workflow while making Codex the default execution model and Claude Code a compatibility mapping.

# In Scope

- Add a canonical `opsx-subagent` skill or equivalent central workflow reference.
- Define Codex-first dispatch semantics:
  - implement/review worker: `spawn_agent(agent_type="worker", message=...)`
  - exploration worker: `spawn_agent(agent_type="explorer", message=...)`
  - result collection and cleanup: `wait_agent` / `close_agent`
  - task tracking: `update_plan`
- Define Claude Code equivalents:
  - `Task` tool with `subagent_type: "general-purpose"` for worker/reviewer roles
  - `Task` tool with `subagent_type: "Explore"` for exploration
  - `TodoWrite` for task tracking
- Define controller/subagent responsibility boundaries:
  - main agent owns gates, final decisions, audit-log, `.openspec.yaml`, and user-facing completion claims
  - subagents own bounded implementation, review, or exploration tasks
- Define prompt/message framing rules and minimum output status taxonomy.
- Add tests that prevent Claude-only subagent wording from being reintroduced without Codex mapping.
- Update docs and `.aiknowledge/codemap/openspec-skills.md`.

# Out of Scope

- Migrating every existing `opsx-*` skill to reference the new contract.
- Changing `opsx-implement` execution behavior.
- Introducing a runtime dispatcher or new CLI command.
- Replacing StageResult or audit-log formats.
- Adding named agent registry support.

# Depends On

- Existing `docs/supported-tools.md` Codex/Claude mapping.
- Existing StageResult and audit-log semantics in `docs/stage-packet-protocol.md`.
- Existing knowledge lifecycle rules in `.aiknowledge/README.md`.

# Done Means

- The central subagent contract exists in the canonical skill source.
- Codex is documented as the default execution model and Claude Code as compatibility.
- The contract explicitly covers controller authority, write boundaries, fallback when subagents are unavailable, and status/result handling.
- Tests pass and include coverage for the mapping/wording boundary.
- Knowledge map is updated with the new contract.
