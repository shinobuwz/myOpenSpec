# migration.ts 作为跨模块 config 同步的粘合层

**标签**：[TypeScript, CLI, config-management, migration]

## 现象

"core" profile 下 global-config 的 `workflows` 字段可能保留旧值或缺少新增 workflow，导致与 `CORE_WORKFLOWS` 常量不一致，引起用户困惑——尽管运行时实际上不读该字段（`getProfileWorkflows` 走另一条路径）。

## 根因

`global-config` 和 `profiles` 是两个独立模块，各自维护自己的数据。当 `CORE_WORKFLOWS` 常量更新时，已存在的 global-config 文件不会自动跟随更新，造成冗余字段与真实列表的静默分叉。

## 修复前

```diff
- // update.ts / init.ts
  await migrateIfNeeded();
- // 无后续同步，core profile 的 workflows 字段保持旧值
```

## 修复后

```diff
+ // src/core/migration.ts
+ export async function syncCoreProfileWorkflows(): Promise<void> {
+   const config = await loadGlobalConfig();
+   if (config.profile !== 'core') return;
+   config.workflows = [...CORE_WORKFLOWS];
+   await saveGlobalConfig(config);
+ }

  // update.ts / init.ts
  await migrateIfNeeded();
+ await syncCoreProfileWorkflows();
```

## 要点

`migration.ts` 是放置跨 global-config 与 profiles 两个模块的一次性/幂等升级逻辑的合适位置；内部清理类同步应静默执行，不输出日志，也不暴露给用户感知。

## 来源

commit: 86a5fa6（2026-04-08）
