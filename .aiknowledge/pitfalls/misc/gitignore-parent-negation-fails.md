# git .gitignore 中父目录被忽略后，子目录 `!` 反排除无效

**标签**：[git, gitignore, 文件追踪]

## 现象

在 `.gitignore` 中添加 `!.claude/skills/` 和 `!.claude/skills/**`，试图让 `.claude/skills/` 被 git 追踪，但 `git status` 仍看不到 `.claude/skills/` 下的文件，`git check-ignore -v` 仍显示父规则在生效。

## 根因

git 官方文档明确规定：**如果父目录已被忽略，无法通过 `!` 重新包含其子路径**。`.gitignore` 中的 `.claude/` 规则会递归忽略整个目录树，任何针对子路径的 `!` 规则都会被跳过，因为 git 在遇到被忽略的父目录后不再检查其内容。

## 修复前

```diff
# .gitignore
- .claude/
- !.claude/skills/
- !.claude/skills/**
```

这段写法无效——`!.claude/skills/` 对 git 来说是死代码。

## 修复后

```diff
# .gitignore
+ # 只忽略敏感文件，不忽略整个 .claude/ 目录
+ .claude/settings.local.json
+ .claude/todos.json
+ .claude/worktrees/
```

不忽略父目录，改为精确忽略不需要追踪的子文件/子目录。

## 要点

**git 中想要追踪某个目录的子集，不能用 `!` 反排除——必须把父目录从 ignore 规则中去掉，改为精确列举需要忽略的子路径。**

## 来源

commit: drop-cli-use-scripts（2026-04-09）
