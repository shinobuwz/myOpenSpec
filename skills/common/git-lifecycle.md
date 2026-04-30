# Git Lifecycle Contract

本规则供 `opsx-slice`、`opsx-plan`、`opsx-implement`、`opsx-verify`、`opsx-review`、`opsx-archive` 引用。目标是让 change 生命周期和 Git 状态可追溯；能由 `opsx` CLI 执行的门控必须调用 CLI，不只停留在文档约束。

## 基本原则

- Git 检查是强制的。
- 正式 change 的本地分支和关键节点 checkpoint 是强制的。
- fast item 是否切分支由 classify/preflight 按实际风险判定；一旦判定需要分支，后续 merge-back 和 checkpoint 同正式 change。
- 不在同一个 commit 中混入无关用户改动。
- 不自动执行 destructive 操作，例如 `git reset --hard`、强制覆盖或删除未提交内容。
- rebase、push 和远端分支删除默认需要用户明确授权。
- archive merge-back 不是可选建议；只要 metadata 记录过 lifecycle branch，归档前必须执行 `opsx git merge-back <change|fast> <id>`。
- OpenSpec artifact 和代码变更应能通过 branch、commit、gate 证据互相追溯。

## Metadata

正式 change 的 `.openspec.yaml` 应记录：

```yaml
git:
  base_branch: main
  base_sha: <sha>
  change_branch: opsx/<change-id>
  created_at: <iso-time>
  last_checkpoint_sha: <sha>
  branch_required: true
  merged: false
  merge_commit:
  pending_merge_reason:
```

fast item 可选记录 `git` 字段；涉及代码修改、CLI/API 行为、发布制品、跨文件修改或用户明确要求可追溯时，必须使用 `opsx fast init <id> --source-type <lite|bugfix> --branch` 或等价 CLI lifecycle 分支入口。

## Must Check

关键节点必须检查：

```sh
git rev-parse --is-inside-work-tree
git branch --show-current
git status --short
git rev-parse HEAD
```

检查结果用于判断：

- 当前是否在 Git 仓库中。
- 当前分支是否匹配 `git.change_branch`。
- 是否存在未提交变更或未跟踪文件。
- `.openspec.yaml` 的 `git` metadata 是否缺失或过期。

如果不是 Git 仓库，workflow 可以继续，但必须在摘要中声明 `git: unavailable`。

## Branch Init

创建正式 change 时：

- 如果当前仓库可用 Git，`opsx changes init <change-id>` 必须在写入 artifact 前创建或切换到 `opsx/<change-id>` 本地分支，并记录 `base_branch`、`base_sha` 和 `change_branch`。
- 若已有同名分支，应切换到该分支并检查工作区。
- 不得在脏工作区上创建正式 change 分支；CLI 必须拒绝。
- fast item 由 agent 在 classify/preflight 判断：需要分支时使用 `opsx fast init ... --branch` 创建 `fast/<id>`；不需要分支时可以保持当前分支，但必须在 evidence 中记录理由。

## Workspace Model

默认使用 branch model。只有在并行推进多个 change、需要隔离依赖安装或构建产物、或用户明确要求时，使用 worktree model。

- branch model：开 change 时使用 `opsx/<change-id>` 分支。
- worktree model：每个 change 使用独立 worktree 和对应分支。
- archive 后，branch model 建议删除本地 change 分支；worktree model 建议移除 worktree，并在确认已合并后删除对应分支。

## Checkpoint Policy

命中以下条件时，必须及时 checkpoint；属于当前 change/fast 的变更无需另行征求用户同意：

- `plan-review` 通过。
- `task-analyze` 通过。
- 一个顶层 task 完成。
- 修改跨多个模块。
- 修改 public interface、schema、migration、config、package 或 build scripts。
- 测试从失败变为通过。
- `verify` 通过。
- `review` 通过。
- 任一 gate 从 fail 或 blocking 进入 pass；checkpoint 说明必须包含失败摘要、修正范围和重新验证命令。
- `archive` 完成。

checkpoint 优先使用 Git commit。存在可提交变更时调用：

```sh
opsx git checkpoint --message "<message>" --all
```

或显式限定路径：

```sh
opsx git checkpoint --message "<message>" -- <path>...
```

如果 commit hook 或提交守卫失败，必须先处理守卫结果，不得绕过。

推荐 commit message：

```text
<change-id>: <stage> <summary>
```

## Dirty Tree Policy

发现未提交变更时：

- 先区分是否属于当前 change。
- 属于当前 change：可以继续，但 checkpoint 节点应提示提交。
- 不属于当前 change：不得自动提交；应提示用户先处理或明确纳入当前 change。
- 不确定归属：停止 Git commit、archive、merge 类操作，只允许继续只读分析或普通实现。

## Stage Usage

- `opsx-plan`：初始化 `git` metadata，确认 change branch，plan 完成后执行规划制品 checkpoint。
- `opsx-implement`：启动前检查当前分支和 dirty tree，每个顶层 task 完成后执行 checkpoint。
- `opsx-verify`：检查 dirty tree 是否影响证据 freshness，记录验证时的 `HEAD` 和 diff 状态。
- `opsx-review`：审查范围必须覆盖 `HEAD`、staged diff、unstaged diff，并声明是否存在未提交变更。
- `opsx-archive`：归档前检查 dirty tree；如果 `git.change_branch` 或 `git.branch_required: true` 存在，先执行 `opsx git merge-back <change|fast> <id>`，再归档；归档完成后执行 archive checkpoint。

## Archive Gate

归档前必须满足其一：

```yaml
git:
  merged: true
  merge_commit: <sha>
```

或（仅允许没有 lifecycle branch 的 fast item，或 Git 不可用的环境）：

```yaml
git:
  merged: false
  pending_merge_reason: "<明确原因>"
```

不得在既未合并、又没有 `pending_merge_reason` 的情况下静默归档；记录过 lifecycle branch 时不得用 `pending_merge_reason` 替代 merge-back，除非 merge 冲突或仓库状态阻塞并已明确写入原因。

## Branch Cleanup

archive merge 完成后，如果满足以下条件，应建议删除本地 change 分支：

- change branch 已合并到 `base_branch`。
- 当前不在 change branch。
- `git status --short` 为空。
- archive checkpoint 已完成，或明确不需要。

本地分支只使用安全删除：

```sh
git branch -d opsx/<change-id>
```

不得默认使用 `git branch -D`。远端分支删除只提示，不自动执行；需要用户明确确认后才可运行：

```sh
git push origin --delete opsx/<change-id>
```

worktree model 下，先确认工作区干净且分支已合并，再执行 `git worktree remove <path>`，随后按同一规则安全删除本地分支。

## Non Goals

- 不强制每个小修改都 commit。
- 不自动 push。
- 不自动 rebase。
- 不替代 `verify` / `review` gates。
- 不把 Git commit 当成测试或审查证据。
