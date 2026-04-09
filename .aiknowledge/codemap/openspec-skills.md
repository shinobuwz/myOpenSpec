# openspec-skills

## 职责
OpenSpec 工作流的单一真相源。所有 skill 以 Markdown 文件形式存放于 `.claude/skills/<name>/SKILL.md`，由 `scripts/sync.sh` 分发到目标仓库。

## 关键文件
| 文件 | 角色 |
|------|------|
| `.claude/skills/openspec-bootstrap/SKILL.md` | 会话启动引导，注入 skill 发现规则和工作流优先级 |
| `.claude/skills/openspec-ff-change/SKILL.md` | 快速创建变更所有产出物（proposal→specs→design→tasks）并执行三道关卡 |
| `.claude/skills/openspec-apply-change/SKILL.md` | 按 tasks.md 逐项实施变更 |
| `.claude/skills/openspec-archive-change/SKILL.md` | 归档变更 + knowledge + codemap + git |
| `.claude/skills/openspec-verify/SKILL.md` | 三维并行验证（完整性/正确性/一致性）|
| `.claude/skills/openspec-plan-review/SKILL.md` | spec↔design 一致性审查（关卡1）|
| `.claude/skills/openspec-task-analyze/SKILL.md` | plan↔tasks 一致性审查（关卡2）|

## 隐式约束
- `.claude/skills/` 已从 `.gitignore` 中移除（改为精确忽略 `settings.local.json` 等敏感文件），skills 现在被 git 追踪
- Bootstrap skill 的变更列表逻辑使用 `ls openspec/changes/ | grep -v archive`（不依赖外部 CLI）
- Skill 文件变更后需手动运行 `scripts/sync.sh` 将最新版本同步到目标仓库
