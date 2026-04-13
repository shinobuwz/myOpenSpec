---
status: active
created_at: 2026-04-13
created_from: change:2026-04-13-stage-packet-protocol
last_verified_at: 2026-04-13
last_verified_by: opsx-knowledge
verification_basis: review
applies_to:
  - openspec/runtime/run-report-data.json
  - .claude/skills/opsx-report/
superseded_by:
---

# 写文件前若 JSON 已存在但损坏，必须 abort 而非覆盖

**标签**：[workflow, data-integrity, json, file-write]

## 现象

agent 写 `run-report-data.json` 前检查文件是否存在。文件存在但 JSON 格式损坏时，agent 将其误判为"不存在"，直接覆盖，导致历史数据静默丢失，且掩盖了上游写入出错的真实原因。

## 根因

"文件存在性"与"文件可读性"是两个独立判断。代码只做了存在性检查（`fs.existsSync`），解析失败时未区分"新建场景"与"损坏场景"，直接走了新建分支。

## 修复前

```diff
- if (!fs.existsSync(reportDataPath)) {
-   // 文件不存在，初始化空结构
-   writeData(reportDataPath, emptyStructure());
- }
```

## 修复后

```diff
+ if (fs.existsSync(reportDataPath)) {
+   try {
+     JSON.parse(fs.readFileSync(reportDataPath, 'utf8'));
+   } catch (e) {
+     throw new Error(`run-report-data.json exists but is corrupt: ${e.message}. Aborting to prevent data loss.`);
+   }
+ } else {
+   writeData(reportDataPath, emptyStructure());
+ }
```

## 要点

文件存在但 JSON 损坏时必须 abort 并上报错误，绝不能将"解析失败"等同于"文件不存在"而覆盖。

## 来源

change: 2026-04-13-stage-packet-protocol（2026-04-13）— CRITICAL review finding
