# Tasks

## U1: statusline.ts 显示改造

- [x] **T1** [R1][U1][direct] 修改 statusline.ts 的 token 显示段，在 `↑in ↓out` 后插入 `cr:cacheRead cw:cacheWrite`，使用 formatTokenCount 格式化，cache 为 0 时仍显示 `cr:0 cw:0`
- [x] **T2** [R2][U1][direct] 新增 getActiveChange 函数：扫描 `${cwd}/openspec/changes/` 排除 `archive/`，返回活跃变更名（去掉日期前缀），多个变更时显示 `name+N`；在 segments 中 git 段之后、ctx% 之前插入 `📋changeName`

## U2: token-tracker 脚本

- [x] **T3** [R3][R6][U2][direct] 创建 `~/.claude/token-tracker.ts`：解析 transcript JSONL，筛选 `type=assistant` 且 `stop_reason` 非 null 的记录，提取 ts/sid/model/in/out/cr/cw 字段，输出格式为固定字段顺序的 JSON 行
- [x] **T4** [R4][U2][direct] 实现 CLI 参数解析：第一个参数为 transcript 路径，第二个参数为 change 目录路径；change 目录不存在时报错退出
- [x] **T5** [R5][U2][direct] 实现 append-only 写入和幂等去重：读取已有 token-usage.jsonl 中的 sid+ts 集合，仅追加新记录，保持按 ts 升序
