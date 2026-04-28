## Test Report

### 2026-04-28T00:00:00Z

Commands:

```bash
npm test
npm run test:local-install
```

Result:

- `npm test`: pass, 23/23 tests passed.
- `npm run test:local-install`: pass, local tarball install smoke test passed and printed `1.0.1`.

Notes:

- `tests/workflow-discipline.test.mjs` covers the text-level regression rules for root-cause gates, fresh verification evidence, bite-sized tasks, task template trace placement, verify/review responsibility split, and trigger-only descriptions.
