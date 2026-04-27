---
status: active
created_at: 2026-04-20
created_from: opsx-bugfix
last_verified_at: 2026-04-27
last_verified_by: opsx-bugfix
verification_basis: archive-date-prefix-idempotency-fix
applies_to:
  - skills/opsx-archive
  - docs/workflows.md
  - docs/getting-started.md
  - docs/concepts.md
superseded_by:
---

# grouped change 的 subchange 归档必须落到顶层 archive

**标签**：[openspec, archive, grouped-change, subchange, path]

## 现象

执行 grouped change 的 `opsx-archive` 后，归档结果出现在活动父 group 内部，例如：

```text
openspec/changes/<group>/subchanges/archive/<date>-<subchange>/
```

这会把“已归档历史”混进“活动 change 树”，导致继续执行 `continue`、人工浏览目录、统计活动 subchange 时都容易误判。

## 根因

archive 规则只说了“先 resolve change root”，但没有把“归档源路径和归档目标路径都必须以 resolved change root 为准”写成硬规则；同时也没明确 subchange 的目标目录命名方式，执行者就容易把 archive 目录建在父 group 的 `subchanges/` 下面。

## 修复前

```diff
- 归档 grouped change 时，容易把结果放进 openspec/changes/<group>/subchanges/archive/
```

## 修复后

```diff
+ 单个 change: openspec/changes/archive/<archive-dir>/
+ subchange: openspec/changes/archive/<archive-dir>/
+ <archive-dir> 由 archive slug 计算；slug 已带 YYYY-MM-DD- 时不重复加日期
+ 严禁创建 openspec/changes/<group>/subchanges/archive/
```

## 要点

grouped change 的默认 archive 单元是当前 resolved subchange root。只要源路径在 `subchanges/<subchange>/` 下，目标就必须落在顶层 `openspec/changes/archive/`，并用 `<group>-<subchange>` 生成稳定 slug。归档目录名必须幂等：slug 已经带日期前缀时，不能再额外拼一次日期。

## 来源

bugfix: 2026-04-20 subchange archive path regression
