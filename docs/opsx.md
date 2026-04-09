# OPSX 工作流

OPSX 是当前仓库使用的 skill-first 工作流。它把“如何规划、实现、验证、归档”拆成一组可组合的 `opsx-*` skills，而不是依赖单独的 slash command 目录。

## 当前模型

- 单一真相源：`.claude/skills/opsx-*/SKILL.md`
- 本地辅助脚本：`.claude/opsx/bin/`
- 不再维护：`.claude/commands/opsx/`

## 为什么这样收敛

- 去掉命令层和 skill 层的双份维护，避免描述漂移。
- 让 workflow 的真实约束直接写在 skill 中，不再经过一层转述。
- 同步脚本只需要复制 skills 和辅助脚本，安装路径更简单。

## 使用方式

直接在对话中点名 skill：

```text
请使用 `opsx-explore` 先帮我调研这个问题
请使用 `opsx-plan` 创建一个新变更
请继续用 `opsx-apply` 推进当前 change
请用 `opsx-verify` 做收尾检查
```

如果只想看有哪些技能，直接查看：

```bash
find .claude/skills -maxdepth 1 -mindepth 1 -type d
```

## 核心链路

```text
opsx-explore
  -> opsx-plan
  -> opsx-plan-review
  -> opsx-tasks
  -> opsx-task-analyze
  -> opsx-implement / opsx-apply
  -> opsx-verify
  -> opsx-review
  -> opsx-archive
```

### 强制关卡

- `opsx-plan-review`
- `opsx-task-analyze`
- `opsx-verify`

这些关卡没通过时，不应绕过继续往后走。

## 目录布局

```text
.claude/
├── opsx/
│   └── bin/
│       └── changes-status.sh
└── skills/
    ├── opsx-bootstrap/
    ├── opsx-plan/
    ├── opsx-apply/
    ├── opsx-verify/
    └── ...
```

## 同步到其他项目

```bash
./scripts/sync.sh /path/to/your-project
```

该脚本只同步：

- `.claude/skills/opsx-*`
- `.claude/opsx/bin/*`

## 相关文档

- [技能参考](commands.md)
- [快速上手](getting-started.md)
- [工作流](workflows.md)
