---
name: opsx-archive
description: 归档已完成的变更。当用户想要在实现完成后最终确定并归档变更时使用。
---

# 归档

归档已完成的 OpenSpec change 或 fast item。路径算法见 `references/archive-routing.md`，归档后的 knowledge/codemap worker 规则见 `references/follow-up-workers.md`。

## Change Root

- `<name>` 可以是单个 change、父 change 或 `group/subchange` 简写。
- 执行前先运行 `opsx changes resolve <name>` 获取真实 change root。
- 所有读取、任务检查、spec 统计和归档源路径均以 resolved change root 为准。
- grouped change 的归档单元是 subchange；父 group 只是运行期路由容器。
- subchange 归档目标必须落到顶层 `openspec/changes/archive/<archive-dir>/`，禁止写入父 group 内部 archive。
- `target_kind: fast` 时，使用 `opsx changes resolve-fast <id>` 获取 fast root；归档目标是 `openspec/fast/archive/<archive-dir>/`。

## 输入 / 输出边界

读取：
- `resolved change root/.openspec.yaml`
- `resolved change root/tasks.md`（如存在）
- `resolved change root/specs/**/*.md`（仅统计）

写入：
- `openspec/changes/archive/<archive-dir>/`（移动目录）
- `openspec/fast/archive/<archive-dir>/`（移动 fast item）
- 父 group `.openspec.group.yaml`（仅归档 subchange 且父 group 仍存在时，更新 route）

禁止：
- 不改写归档目录中的 proposal/design/specs/tasks
- 不重写 gates、`audit-log.md`、`review-report.md`、`test-report.md`
- Git merge、checkpoint 和分支清理按 `~/.opsx/common/git-lifecycle.md`

## 硬性门控

读取 `.openspec.yaml` 并按目标类型校验 gates；此校验不可被用户确认绕过。

- `target_kind: change`：校验 `gates.verify` 和 `gates.review` 字段均存在，任一缺失则拒绝执行并提示缺失关卡。
- `target_kind: fast`：校验 `gates.verify` 字段存在。
- fast item 若 `review_required: true` 或未声明 `review_required`，还必须校验 `gates.review` 字段存在。
- fast item 若 `review_required: false`，只校验 `gates.verify`，不要求 `gates.review`。

## 归档前检查

- 检查 schema 期望产物是否存在；缺失时告知并确认是否继续。
- 统计 `tasks.md` 未完成任务；存在未完成项时告知并确认是否继续。
- 统计 specs 文件数量并在摘要中说明。
- 按 `~/.opsx/common/git-lifecycle.md` 检查 dirty tree、merge 状态和 `pending_merge_reason`。

## 路由规则摘要

- 单 change：`<archive-slug>=<change>`。
- subchange：`<archive-slug>=<group>-<subchange>`。
- 如果 `<archive-slug>` 已经以 `YYYY-MM-DD-` 开头，则 `<archive-dir>=<archive-slug>`；否则 `<archive-dir>=<today>-<archive-slug>`。
- 目标目录已存在时失败，不覆盖。

详细移动、double-date 防护和父 group 清理规则见 `references/archive-routing.md`。

## Group 收尾

归档 subchange 后：

- 如果还有 subchange，更新 `active_subchange`、`suggested_focus` 和 `recommended_order` 指向仍存在的 subchange。
- 父 group 活动态只保留 `.openspec.group.yaml` 与 `subchanges/`。
- 如果没有剩余 subchange，删除父 group 目录。

## 归档后强制执行

归档目录移动成功后，按序执行：

1. 调用 **opsx-knowledge** 沉淀或刷新 `.aiknowledge/pitfalls/`。
2. 调用 **opsx-codemap** 更新 `.aiknowledge/codemap/`。

后续 workers 按 `~/.opsx/common/subagent.md` worker contract 执行；主 agent 仍负责归档移动、父 group route 更新和最终摘要。

## 退出契约

输出归档摘要：变更名、schema、归档路径、spec 数量、Git merge/cleanup 状态和任何警告。
