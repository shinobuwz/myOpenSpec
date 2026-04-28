You are running an OPSX subagent smoke eval.

Task:
1. Spawn a read-only explorer subagent.
2. Ask it to read only:
   - tests/workflow-discipline.test.mjs
   - tests/changes-helper.test.mjs
3. Wait for the subagent result.
4. Close the subagent if the runtime supports it.
5. Do not modify files.
6. Return final JSON only with fields:
   - status: "pass", "fail", or "inconclusive"
   - subagent_required: boolean
   - subagent_result_seen: boolean
   - files_checked: array of strings
   - notes: string
