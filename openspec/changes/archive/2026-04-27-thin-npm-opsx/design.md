# Design: Thin npm launcher for OPSX

## Context

OPSX currently exposes reusable behavior through repository-relative helper scripts under `.claude/opsx/bin`. That path is both tool-specific and cwd-sensitive. The new design makes npm the device-level distribution mechanism while preserving file-based OpenSpec state under each target project.

The implementation must stay thin: `opsx` is a launcher and installer, not a workflow engine.

## Goals / Non-Goals

Goals:

- Provide a global `opsx` command that can run from any directory.
- Support explicit target project selection with `-p/--project`.
- Keep change state project-local under `openspec/changes`.
- Install skills globally without copying runtime scripts/templates to every repo.
- Keep existing shell helper behavior where practical.

Non-Goals:

- Recreate the old full `openspec-cn` CLI.
- Add profile, delivery, workflow selection, shell completion, or interactive configuration systems.
- Generate proposal/design/tasks from the npm CLI.
- Publish to npm as part of this change.

## Requirements Trace

- [R1] -> [U1]
- [R2] -> [U1], [U2]
- [R3] -> [U3], [U4]
- [R4] -> [U1], [U4]
- [R5] -> [U1], [U2]
- [R6] -> [U1]
- [R7] -> [U1]
- [R8] -> [U2]
- [R9] -> [U3]
- [R10] -> [U3]
- [R11] -> [U1], [U3]
- [R12] -> [U4]
- [R13] -> [U3], [U4]

## Implementation Units

### [U1] Node launcher and project resolution

关联需求：R1, R2, R4, R5, R6, R7, R11

模块边界：

- `package.json`
- `bin/opsx.mjs`
- `bin/opsx`

验证方式：

- Run `node bin/opsx.mjs --help`.
- Run `node bin/opsx.mjs changes -p <repo> list`.
- Run command variants with `-p` before and after the subcommand arguments.
- Run `npm pack --dry-run` to inspect included files.

Design:

- `bin/opsx` is the npm bin shim with a Node shebang.
- `bin/opsx.mjs` parses only top-level subcommands and common project flags.
- Supported subcommands are exactly `changes`, `install-skills`, `init-project`, and help/version.
- Project resolution is implemented in Node using `path.resolve`, `fs.statSync`, and upward discovery.
- `-p/--project` is removed from argv before forwarding command-specific args.
- `OPSX_PROJECT_ROOT` is used only when CLI project is omitted.

### [U2] Runtime change helper with explicit project root

关联需求：R2, R5, R8

模块边界：

- `runtime/bin/changes.sh`
- `.claude/opsx/bin/changes.sh`
- `skills/opsx-*/SKILL.md`

验证方式：

- Run helper from repository root.
- Run helper from a subdirectory using `-p`.
- Run `resolve` and verify absolute output.
- Run invalid names and verify no files are created outside `openspec/changes`.

Design:

- Move the canonical helper to `runtime/bin/changes.sh`.
- Keep `.claude/opsx/bin/changes.sh` as a compatibility wrapper that locates and execs the runtime helper from the repository checkout.
- The runtime helper accepts `-p/--project` anywhere in the command line.
- The runtime helper receives `OPSX_PROJECT_ROOT` from the launcher when invoked through `opsx changes`.
- `CHANGES_DIR` is always `$PROJECT_ROOT/openspec/changes`.
- Schemas are read from package runtime first, with compatibility fallback to the old repository schema path.

### [U3] Global skill install and project initialization

关联需求：R3, R9, R10, R11, R13

模块边界：

- `bin/opsx.mjs`
- `scripts/install-global.sh`
- `scripts/sync.sh`
- `scripts/install-repos.sh`

验证方式：

- Install skills to a temporary `OPSX_AGENTS_SKILLS_HOME`.
- Verify stale `opsx-*` skills are removed and non-opsx skills remain.
- Initialize a temporary project and verify only `openspec` state is created.
- Run repository sync into a temporary target and verify `.claude/opsx` is not created.

Design:

- `opsx install-skills` copies package `skills/opsx-*` into the global agent skills directory.
- Existing target `opsx-*` directories not present in package source are pruned.
- `opsx init-project` creates `openspec/config.yaml` only when missing and always ensures `openspec/changes` exists.
- Legacy shell install scripts call or mirror the same behavior, but do not copy runtime scripts into target repositories.

### [U4] Documentation and source-of-truth cleanup

关联需求：R3, R4, R12, R13

模块边界：

- `README.md`
- `docs/getting-started.md`
- `docs/supported-tools.md`
- `docs/workflows.md`
- `.aiknowledge/codemap/skill-sync.md`
- `.aiknowledge/codemap/openspec-skills.md`
- `.aiknowledge/pitfalls/misc/*.md`

验证方式：

- Search for `.claude/opsx/bin/changes.sh` references and ensure only compatibility notes remain.
- Search docs for old runtime-copy instructions.
- Confirm README documents thin npm usage without profile/delivery CLI features.

Design:

- Docs describe npm installation as the primary path.
- `skills/` is the skill template source. `.claude/skills` is only a generated project adapter for tools that cannot read global skills.
- Runtime scripts and schemas are documented as package-owned resources.

## Decisions

1. **Use a Node launcher instead of shell-only global scripts.**
   - Reason: npm bin dispatch, cross-platform path resolution, and project discovery are simpler and safer in Node.
   - Alternative: install shell scripts into `~/.opsx/bin`; rejected because it still leaves PATH/bootstrap ambiguity outside npm.

2. **Keep `changes.sh` as the runtime worker.**
   - Reason: it already encodes group/subchange behavior and can be made project-aware with limited changes.
   - Alternative: rewrite changes handling in JavaScript; rejected because it increases behavioral rewrite risk.

3. **Do not copy runtime to projects.**
   - Reason: templates and helper scripts drift when every repository has its own copy.
   - Alternative: `.opsx` per repo; rejected for this change because the user wants one device-level runtime.

4. **Keep `.claude/opsx/bin/changes.sh` temporarily as a wrapper.**
   - Reason: existing skills and users may still call the old path during migration.
   - Alternative: delete it immediately; rejected because it would break current workflows before skills are updated everywhere.

## Risks / Trade-offs

- [Risk] npm package and source checkout behavior can diverge.
  - Mitigation: `OPSX_RUNTIME_HOME` can be supported later if local source debugging becomes necessary; this change keeps package files directly executable.

- [Risk] Shell helper remains less portable on native Windows shells.
  - Mitigation: launcher path parsing is cross-platform; shell helper support is limited to environments that can run bash, matching current helper requirements.

- [Risk] Updating every skill reference can be noisy.
  - Mitigation: keep wrapper compatibility and update generic helper examples first.

## Migration Plan

1. Add npm package metadata and launcher.
2. Move canonical change helper under `runtime/bin`.
3. Replace old helper with compatibility wrapper.
4. Update install/sync scripts to stop copying runtime to repositories.
5. Update skills and docs toward `opsx changes`.
6. Verify local npm package behavior with temporary directories.

## Knowledge Capture

- Capture a pitfall that global runtime must not read or write global `changes`; project state remains under explicit `-p` target.
- Update codemap entries for skill sync/runtime distribution after implementation.

## Open Questions

- The personal npm package name is `@shinobuwz/opsx`.
