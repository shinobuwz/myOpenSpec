## Task 1.1 | characterization-first

### Red
- Added coverage that `opsx changes list` remains a compact active-change listing and does not print `Project:`.
- Added coverage that `opsx changes status` should print `Project:`, change name, stage, and task progress.
- Initial `npm test` failed because `status` still reused `list_changes`.

### Green
- Split `status` into a dedicated `status_changes` path in `runtime/bin/changes.sh`.
- Added status rendering for project root, active change details, stage, and task progress.
- Re-ran `npm test`; Task 1 behavior passed after normalizing macOS physical temp paths in the test.

### Refactor
- Kept `list_changes` unchanged so existing compact output stays stable.

## Task 2.1 | test-first

### Red
- Added coverage for gate timestamps, missing gates, report file presence, and next-step inference.
- Initial `npm test` failed because `status` did not read `.openspec.yaml` or report files.

### Green
- Added helper functions for gate extraction, report presence, specs detection, and next-step inference.
- Implemented conservative next-step ordering from `opsx-slice` through `opsx-archive`.
- `npm test` passed: 16 tests, 0 failed.

### Refactor
- Kept gate parsing dependency-free and scoped to the existing `.openspec.yaml` structure.
