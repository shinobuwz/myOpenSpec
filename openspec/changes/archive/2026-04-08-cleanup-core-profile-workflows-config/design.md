## 上下文

全局 config `~/.config/openspec/config.json` 的 `workflows` 数组在 `"core"` profile 下被 `getProfileWorkflows` 完全忽略（直接返回 `CORE_WORKFLOWS`）。但该数组会随版本迭代积累过时条目，对用户造成误导。需要在 `update`/`init` 流程中自动对齐。

## 目标 / 非目标

**目标：**
- `update` 和 `init` 执行时，若 profile 为 `"core"`，自动将 `workflows` 重置为当前 `CORE_WORKFLOWS`
- 不破坏 `"custom"` profile 的行为

**非目标：**
- 不主动提示用户（静默执行）
- 不在 `config` 子命令中添加专门的同步命令

## 需求追踪

- [R1] -> [U1]

## 实施单元

### [U1] 添加 syncCoreProfileWorkflows 工具函数
- 关联需求: [R1]
- 模块边界: `src/core/migration.ts`（已同时导入 `global-config` 和 `profiles`，无循环依赖风险）
- 实现：
  ```ts
  export function syncCoreProfileWorkflows(): void {
    const config = getGlobalConfig();
    if (config.profile !== 'core') return;
    config.workflows = [...CORE_WORKFLOWS];
    saveGlobalConfig(config);
  }
  ```
- 调用位置：`update.ts` 的 `execute()` 第 2 步后（`migrateIfNeededShared` 调用后）；`init.ts` 写入 global config 之后
- 验证方式：单元测试覆盖 core/custom 两种 profile 情况

## 决策

**放在 migration.ts 而非 global-config.ts**：`global-config.ts` 目前不依赖 `profiles.ts`，引入 `CORE_WORKFLOWS` 会增加耦合。`migration.ts` 已经同时导入两者，是最自然的位置。

**静默执行，不输出日志**：`workflows` 同步是内部清理，不是用户可感知的功能变更，无需打印提示。

## 风险 / 权衡

- [风险] `init` 流程有多个分支（交互式/非交互式），需确保每个分支都调用同步 → 提取到统一调用点或在 global config 写入后统一调用

## 知识沉淀

- `migration.ts` 是跨 `global-config` 和 `profiles` 的粘合层，后续类似的一次性/升级逻辑优先放这里
- `"core"` profile 下 `workflows` 字段是冗余的（`getProfileWorkflows` 不读它），但保留它是为了让用户看 config 文件时有直观的参考
