# core-profile-workflows-sync

## 目的

定义 `"core"` profile 下全局配置 `workflows` 数组的自动同步行为，确保其始终与 `CORE_WORKFLOWS` 保持一致。

## 需求

### 需求:core profile 同步 workflows 数组
**Trace**: R1
**Slice**: global-config/core-profile-sync

当 `profile` 为 `"core"` 时，全局 config 的 `workflows` 数组必须与 `CORE_WORKFLOWS` 保持一致。系统在执行 `update` 或 `init` 命令时，必须自动将 `workflows` 字段重置为当前 `CORE_WORKFLOWS` 的完整副本并持久化到 config 文件。

#### 场景:update 时清理旧条目
- **当** 执行 `openspec-cn update`，全局 config `profile` 为 `"core"`，且 `workflows` 数组包含不在 `CORE_WORKFLOWS` 中的条目
- **那么** `workflows` 数组必须被替换为 `CORE_WORKFLOWS` 并写回 config 文件

#### 场景:update 时补充缺失条目
- **当** 执行 `openspec-cn update`，全局 config `profile` 为 `"core"`，且 `workflows` 数组缺少 `CORE_WORKFLOWS` 中的某些条目
- **那么** `workflows` 数组必须被替换为 `CORE_WORKFLOWS` 并写回 config 文件

#### 场景:init 时对齐
- **当** 执行 `openspec-cn init`，全局 config `profile` 为 `"core"`
- **那么** `workflows` 数组必须被设置为 `CORE_WORKFLOWS` 并写回 config 文件

#### 场景:custom profile 不触发同步
- **当** 执行 `update` 或 `init`，全局 config `profile` 为 `"custom"`
- **那么** `workflows` 数组禁止被修改
