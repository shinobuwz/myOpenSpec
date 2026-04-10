## 修改需求

### 需求:statusline token 显示格式变更

statusline.ts 的 token 显示段从 `↑in ↓out ⚡hitRate%` 改为 `↑in ↓out cr:cacheRead cw:cacheWrite ⚡hitRate%`，新增 cache_read 和 cache_create 的绝对量显示。

**Trace**: R1

#### 场景:正常显示所有 token 指标
- **当** stdin 提供的 current_usage 包含 input_tokens=3, output_tokens=1700, cache_read_input_tokens=73300, cache_creation_input_tokens=41100
- **那么** token 段显示为 `↑3 ↓1.7K cr:73.3K cw:41.1K ⚡86%`
- **且** cr 和 cw 使用与 ↑↓ 相同的 formatTokenCount 格式（K/M 缩写）

#### 场景:cache 为 0 时仍显示
- **当** stdin 提供的 cache_read_input_tokens=0, cache_creation_input_tokens=0
- **那么** token 段显示为 `↑X ↓X cr:0 cw:0`
- **且** 缓存命中率不显示（因为 totalInput 中无 cache 数据）

#### 场景:缓存命中率颜色规则不变
- **当** 缓存命中率 ≥80%
- **那么** ⚡ 及百分比显示为绿色
- **当** 缓存命中率 <50%
- **那么** ⚡ 及百分比显示为黄色

## 新增需求

### 需求:statusline 显示当前活跃变更名

statusline.ts 新增一个段，显示当前 cwd 下 `openspec/changes/` 中活跃（非 archive）的变更名称。

**Trace**: R2

#### 场景:存在一个活跃变更
- **当** cwd 下 `openspec/changes/` 中有一个非 archive 的子目录 `2026-04-10-token-usage-tracking`
- **那么** 在 git 信息之后、ctx% 之前插入段 `📋token-usage-tracking`
- **且** 变更名去掉 `YYYY-MM-DD-` 日期前缀

#### 场景:无活跃变更
- **当** `openspec/changes/` 下只有 `archive/` 子目录（或目录不存在）
- **那么** 不显示变更名段

#### 场景:多个活跃变更
- **当** `openspec/changes/` 下有多个非 archive 的子目录
- **那么** 显示第一个（按字母序排序）
- **且** 末尾追加 `+N`（N 为额外变更数量），如 `📋token-usage-tracking+1`
