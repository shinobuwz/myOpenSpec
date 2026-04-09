## 为什么

主规范目录（`openspec/specs/`）只在 sync-specs 和 archive-change 两个收尾阶段被读写，日常的 plan、review、verify、implement 工作流从不参考它。它是一个"写了没人看"的被动累积存档，随时间增长会成为维护负担。更合理的知识沉淀方式是 `.aiknowledge/` 下的 codemap 和 pitfalls。

## 变更内容

- **移除** `openspec/specs/` 目录及其全部内容
- **移除** sync-specs skill（`openspec-sync-specs`）— 该 skill 唯一用途是写主规范
- **移除** sync-specs 源码模板（`src/core/templates/workflows/sync-specs.ts`）
- **移除** `src/commands/spec.ts` 中与主规范相关的命令
- **移除** `src/core/specs-apply.ts` 中对 `openspec/specs/` 的引用
- **修改** archive-change skill — 去掉"检查是否已同步到主规范"步骤 **BREAKING**
- **修改** CLI 命令注册 — 移除 sync-specs 相关命令

## 功能 (Capabilities)

### 新增功能

（无）

### 修改功能

（无 — 被移除的 `spec show/list/validate` 和 `sync-specs` 没有对应的 capability 规范。`cli-artifact-workflow` 和 `opsx-verify-skill` 的需求不涉及主规范，无需修改。）

## 影响

- **CLI 命令**: `sync-specs` 命令将被移除
- **Skills**: `openspec-sync-specs` / `opsx:sync` skill 将被移除
- **Archive 工作流**: archive 不再检查主规范同步状态
- **源码**: `src/commands/spec.ts`、`src/core/specs-apply.ts`、`src/core/templates/workflows/sync-specs.ts`、`src/core/templates/workflows/archive-change.ts`
- **用户行为**: 用户不再需要在归档前执行 sync-specs
