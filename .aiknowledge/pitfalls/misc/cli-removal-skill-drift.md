# CLI 删除后 skill 文件未同步更新

## 现象

删除外部 CLI（如 `openspec-cn`）后，原先依赖该 CLI 的 skill 文件、command 文件、文档和脚本中仍然残留旧调用，导致主工作流失效。

## 根因

CLI 删除是一次性操作，但 skill/command/docs 文件分散在多处，没有统一的引用检查机制，容易遗漏。

## 修复 diff 要点

- `openspec-cn list --json` → `ls openspec/changes/ | grep -v archive`
- `openspec-cn new <name>` → `mkdir -p openspec/changes/<name>/specs`
- `openspec-cn status/instructions apply` → 直接读取 `openspec/changes/<name>/` 下的 tasks.md 等文件
- 删除已声明下线的 skill 目录和 command 文件
- `sync.sh` 追加复制改为先 prune 后复制，防止陈旧目录永久残留
- 文档/脚本中的包管理器命令替换为对应的 shell 脚本

## 要点

删除 CLI 后，必须全局搜索 `grep -rn "openspec-cn"` 检查所有引用，不能仅靠代码回顾。

## 来源

2026-04-09 bugfix，涉及 openspec-plan、openspec-apply-change、openspec-verify、opsx/apply.md、README.md、docs/installation.md、scripts/install-local.sh、scripts/sync.sh
