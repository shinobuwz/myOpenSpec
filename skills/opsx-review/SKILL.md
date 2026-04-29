---
name: opsx-review
description: opsx-verify 通过后使用，用于在归档前审查已实现 change 的发布风险和代码质量。
---

# 发布风险审查

执行 code quality / release risk review。`opsx-verify` 负责 Spec Compliance Review；本 skill 不重复完整 compliance，只拦截真实发布风险。风险分类见 `references/risk-taxonomy.md`，reviewer prompt 见 `references/reviewer-prompt.md`。

## Change Root

- `<name>` 可以是单个 change、父 change 或 `group/subchange` 简写。
- 执行前先运行 `opsx changes resolve <name>` 获取真实 change root。
- 下文 `proposal.md`、`review-report.md`、`.openspec.yaml` 均指 resolved change root。
- `target_kind: fast` 时，使用 `opsx changes resolve-fast <id>` 获取 fast root；读取 `item.md`、`evidence.md`、`root-cause.md`（如存在）作为风险上下文，不要求 formal artifacts。

## 输入 / 输出边界

读取：
- `.openspec.yaml`
- `git diff`
- `proposal.md`、`design.md`、`specs/`（仅作为风险上下文）
- fast target 的 `item.md`、`evidence.md`、`root-cause.md`（如存在）
- 命中的 `.aiknowledge/codemap/` 和 `.aiknowledge/pitfalls/`
- 既有 `review-report.md`（追加时）
- Git 状态按 `~/.opsx/common/git-lifecycle.md` 检查，用于声明 review diff scope

写入：
- `review-report.md`（新建或追加）
- `.openspec.yaml` 的 `gates.review`（仅无 CRITICAL 时）

禁止：
- 不写 `audit-log.md`
- 不改实现文件
- 不复制 `opsx-verify` 的完整 compliance 流程

## 硬性门控

必须确认 `gates.verify` 已存在。缺失时拒绝执行并回到 `opsx-verify`。

## 审查方式

按 `~/.opsx/common/subagent.md` reviewer worker contract 派发 1 个只读 reviewer。Codex 默认、Claude Code 兼容映射、controller boundary、只读写入边界和 fallback 均以 `~/.opsx/common/subagent.md` 为准。

主 agent 收集 diff、需求上下文、codemap/pitfalls 摘要后启动 reviewer，并负责写 `review-report.md` 与 `gates.review`。reviewer 只读代码和文档，不做修改。

## 审查边界

只审查 diff 中实际变更的代码，并按 `~/.opsx/common/git-lifecycle.md` 覆盖 `HEAD`、staged diff、unstaged diff。新增行是核心审查对象；删除行只用于判断是否移除了状态重置、资源清理或事件触发等副作用；上下文行只用于理解，不单独产生 issue。

如果发现明显需求遗漏、范围外实现或任务状态与证据不一致，不在 review 内重跑 compliance；输出 `VERIFY_DRIFT` critical finding，并路由回 `opsx-verify`。

## 问题分级

- CRITICAL：同时满足可触发、无保护、严重后果，阻断发版。
- WARNING：有实际风险但不满足 CRITICAL 三要素，例如状态不闭环、数据源不一致、新增 TODO/FIXME。
- SUGGESTION：局部清晰度或潜在风险建议，必须有具体调用路径或影响方向。

详细类别、禁止报告内容和 pitfalls 使用方式见 `references/risk-taxonomy.md`。

## 完成条件

- 审查范围内的 code quality / release risk 类别完成检查。
- 未重复执行完整 spec compliance；发现漂移时输出 `VERIFY_DRIFT`。
- 所有问题已按 CRITICAL / WARNING / SUGGESTION 分级并记录。
- 每个 CRITICAL 包含行号、执行路径、具体后果和修复建议。

## 退出契约

- 无 CRITICAL：追加 `review-report.md` pass/pass_with_warnings 记录，写入 `gates.review`，必须转入 **opsx-archive**。
- 有 CRITICAL：追加 `review-report.md` fail 记录，不写 gates；列出必须修复项。
