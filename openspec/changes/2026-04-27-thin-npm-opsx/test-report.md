## Task 1.1 | test-first

### Red
- Added tests for `-p/--project` parsing, CLI/env/cwd project priority, subdirectory discovery, and file path normalization.
- Initial run failed because `parseProjectOption` and `resolveProjectRoot` were not implemented.

### Green
- Implemented project option parsing and OpenSpec root discovery in `bin/opsx.mjs`.
- `npm test` passed: 4 tests.

### Refactor
- Kept parsing and path discovery as exported functions so subcommand behavior can reuse them.

## Task 1.2 | test-first

### Red
- Added `init-project` test covering project-local `openspec/config.yaml`, `openspec/changes`, no `.opsx`, no `.claude/opsx`, and config preservation.
- Initial run failed because `init-project` was not implemented.

### Green
- Implemented `initProject()` and launcher dispatch for `init-project`.
- Added `changes` dispatch path to the package runtime helper; full helper behavior is covered by Task 2.1.
- `npm test` passed: 5 tests.

### Refactor
- Centralized project initialization in an exported helper for reuse by future command tests.

## Task 2.1 | test-first

### Red
- Added shell helper tests for `-p` before and after commands, cross-project operation, absolute `resolve`, and traversal rejection.
- Initial run failed because `runtime/bin/changes.sh` did not exist.

### Green
- Added canonical `runtime/bin/changes.sh` with explicit project resolution and safe change-name validation.
- Added runtime schema marker and replaced `.claude/opsx/bin/changes.sh` with a compatibility wrapper.
- `npm test` passed: 8 tests.
- `bash .claude/opsx/bin/changes.sh list` successfully routed through the runtime helper.

### Refactor
- Adjusted the absolute path assertion to compare physical paths on macOS where `/var` resolves to `/private/var`.

## Task 3.1 | test-first

### Red
- Added tests for global `install-skills` pruning, preserving non-OPSX skills, and `scripts/sync.sh` no longer copying `.claude/opsx`.
- Initial run failed because `install-skills` was not implemented and `sync.sh` still copied helper runtime assets.

### Green
- Implemented `installSkills()` and the `opsx install-skills` subcommand.
- Updated `scripts/install-global.sh` to call the launcher and `scripts/sync.sh` to sync only skill adapters.
- `npm test` passed: 10 tests.

### Refactor
- Kept install target override through `OPSX_AGENTS_SKILLS_HOME` for isolated tests and non-default agent homes.

## Task 4.1 | direct

### Direct
- Updated OPSX skill helper examples to prefer `opsx changes`.
- Updated README and docs to describe npm as a thin global launcher and project-local `openspec/` state.
- Updated codemap and pitfalls knowledge for the new runtime distribution boundary.
- Verified no `.claude/opsx/bin/changes.sh` references remain in skills/docs.
- `npm test` passed: 10 tests.

## Task 5.1 | test-first

### Red
- Added end-to-end launcher smoke test for `node bin/opsx.mjs changes -p <tmp-repo> init demo spec-driven`.

### Green
- Launcher smoke test passed and initialized the target project change through the npm entrypoint.
- `npm test` passed: 11 tests.
- `npm pack --dry-run` passed; package includes `bin/`, `runtime/`, `.claude/skills/`, `.claude/opsx/schemas/`, README, and LICENSE.

### Refactor
- No refactor needed after smoke verification.

### Manual
- Final npm package name and publish permission remain manual release decisions.

## Post-publish patch | test-first

### Red
- Local npm global install from published `1.0.0` exposed that the CLI produced no output when invoked through npm's global symlink.
- Added a symlink entrypoint test to reproduce npm-style bin execution.

### Green
- Updated the entrypoint check to compare real paths so npm symlink launches execute `main()`.
- Bumped local package version to `1.0.1` because npm cannot overwrite published `1.0.0`.
- Added `npm run install:local` / `npm run test:local-install` to pack and globally install the local tarball for one-command manual testing.
- `npm test` passed: 12 tests.
- `npm run install:local` passed and `opsx --version` returned `1.0.1`.
