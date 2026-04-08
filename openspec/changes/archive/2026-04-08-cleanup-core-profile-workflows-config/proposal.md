## 为什么

全局配置文件 `~/.config/openspec/config.json` 的 `workflows` 数组记录的是历史安装状态，随着工作流增删会逐渐过时。对于 `"core"` profile 用户，该数组在功能上被完全忽略，但其中的过时条目（已删除的工作流）和缺失条目（新增工作流）会造成误导。

## 变更内容

- `update` 和 `init` 命令在执行时，若当前 profile 为 `"core"`，自动将全局 config 的 `workflows` 字段与 `CORE_WORKFLOWS` 对齐（删除已移除的工作流、补充新增的工作流）
- 对齐后将变更写回全局 config 文件

## 功能 (Capabilities)

### 新增功能

- `core-profile-workflows-sync`: 在 `update`/`init` 流程中，为 `"core"` profile 用户同步全局 config 的 `workflows` 数组与当前 `CORE_WORKFLOWS`

### 修改功能

（无规范级行为变更）

## 影响

- `src/core/global-config.ts`：读取/写入逻辑（已有，复用）
- `src/core/init.ts`：在初始化流程中调用同步
- `src/core/update.ts`：在更新流程中调用同步
- `src/core/profiles.ts`：`CORE_WORKFLOWS` 作为权威来源
