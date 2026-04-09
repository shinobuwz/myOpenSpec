# Proposal: 裁剪全局 profile/delivery 配置体系

## 问题陈述

当前 openspec-cn 的全局配置包含三层：`profile`、`delivery`、`workflows`。这套"套餐切换体系"原本为多用户分发场景设计，但实际使用场景是：

- 单人使用
- 固定安装全套 workflow
- 固定同时维护 `.claude` 和 `.codex` 两套工具
- 不需要在不同仓库安装不同子集

这导致大量复杂逻辑（漂移检测、交互式配置器、legacy 清理、migration）服务于从未被使用的功能。

## 目标

裁剪"套餐切换"层，保留"生成与分发"层：

- 保留：templates + adapters + init/update 核心流程 + `openspec/config.yaml`
- 裁剪：`profile`、`delivery`、`workflows` 配置项及所有依赖逻辑
- 硬编码：`delivery = both`（始终生成 skills + commands）、`workflows = ALL_WORKFLOWS`（始终安装全套）

## 范围

**做什么：**
- 删除 `GlobalConfig` 中的 `profile`、`delivery`、`workflows` 字段
- 删除 `config profile` 子命令（交互式选择器）
- 删除 profile-sync-drift 模块
- 删除 migration 中 profile 相关的 `syncCoreProfileWorkflows` 逻辑
- 硬编码 init/update 始终使用全量 workflows + both delivery
- 保留 `config get/set/list/path/edit/reset` 用于其他配置项（如 `gitEmail`）

**不做什么：**
- 不改动 templates、adapters、skill-generation
- 不改动 `openspec/config.yaml` 及项目级配置
- 不改动 init/update 的主流程逻辑（只移除 profile 相关分支）
- 不改动 command-generation、legacy-cleanup 核心

## 成功标准

- `openspec-cn init` 和 `openspec-cn update` 正常工作，生成全套 skills + commands
- `openspec-cn config list` 不再显示 profile/delivery/workflows 字段
- `openspec-cn config profile` 命令不再存在
- 所有现有测试通过（调整受影响测试）
- 代码量净减少（删除逻辑 > 新增逻辑）
