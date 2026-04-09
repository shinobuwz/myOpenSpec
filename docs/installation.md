# 安装

## 前置条件

- **bash** —— macOS/Linux 默认已内置

## 将 skill 同步到你的项目

在当前仓库根目录执行：

```bash
./scripts/sync.sh /path/to/your-project
```

该脚本会：

- 将 `.claude/skills/openspec-*/` 复制到目标项目
- 自动清理目标项目中已不存在于本仓库的旧 skill 目录

## 批量同步多个项目

编辑 `scripts/sync-all.sh`，在 `REPOS` 数组中填入目标仓库路径，然后运行：

```bash
./scripts/sync-all.sh
```

## 下一步

安装完成后，在目标项目中告诉你的 AI：

```
/opsx:propose <你想要构建的功能>
```

完整流程请参见 [快速上手](getting-started.md)。
