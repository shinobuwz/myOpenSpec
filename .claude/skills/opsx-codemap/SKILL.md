---
name: opsx-codemap
description: 独立维护 .aiknowledge/codemap/ 架构认知地图。初始化缺失模块的 codemap，或在变更后更新受影响模块。
license: MIT
compatibility: 需要 openspec CLI。
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.2.0-cc.4"
---

执行 codemap 维护工作流。目标是把项目的架构认知固化为可复用的地图文档，写入 `.aiknowledge/codemap/`。

## 两种触发场景

**场景 A：入口初始化**（explore 开始时，codemap 缺失或模块未覆盖）
- 根据用户描述的需求范围，识别涉及的模块
- 检查这些模块是否已有 codemap 条目
- 对缺失的模块：读代码 → 生成模块文档

**场景 B：出口更新**（archive 归档后，变更涉及的模块有代码改动）
- 根据本次变更涉及的模块，更新对应的模块文档
- 如有新的跨模块链路，更新或新建 chains/

## 目录结构

```
.aiknowledge/codemap/
├── index.md              # L1：模块列表 + 链路索引
├── <module>.md           # L2：单模块文档（扁平，不建子目录）
└── chains/
    └── <chain-name>.md   # 跨模块调用链（按需创建）
```

## index.md 格式

```md
# Codemap

## 模块

| 模块 | 职责 | 入口 |
|------|------|------|
| [audio-connection](audio-connection.md) | WebSocket 音频连接管理 | src/audio/connection.ts |
| [session](session.md) | 会话生命周期 | src/session/manager.ts |

## 链路

| 链路 | 涉及模块 | 说明 |
|------|----------|------|
| [音频建连](chains/audio-session-setup.md) | session, audio-connection, codec | 从发起到首帧的完整路径 |
```

## 模块文档格式（`<module>.md`）

```md
# <模块名>

## 职责
一段话说明这个模块做什么、边界在哪。

## 关键文件
| 文件 | 角色 |
|------|------|
| src/audio/connection.ts | 入口，对外暴露 connect/disconnect |
| src/audio/reconnect.ts | 重连策略与退避逻辑 |

## 隐式约束
- 调用 connect() 前必须先完成 auth，否则返回 null session
- reconnect() 跳过 auth，直接重用已有 token
```

精确到**文件级 + 一句话角色**，不记录类和函数。

## 链路文档格式（`chains/<chain-name>.md`）

```md
# <链路名称>

## 触发点
`Module.method()` → src/xxx/yyy.ts:42

## 调用链
1. AppEntry.startAudio()
   → SessionManager.create(config)   # src/session/manager.ts:88
2. SessionManager.create()
   → AudioConnection.connect(token)  # src/audio/connection.ts:33
3. AudioConnection.connect()
   → Codec.init()                    # src/audio/codec.ts:12 ⚠ 必须在 ws.onopen 之后

## 隐式约束
- Codec.init() 必须在 WebSocket 连接建立后才能调用，否则 crash
- getToken() 失败时 SessionManager 不会抛异常，而是返回 null

## 关键分支
- 重连路径：SessionManager.reconnect() 跳过步骤 1，直接走步骤 2-3
```

链路文档的价值在于固化"跨 N 个文件才能追踪到的约束"，避免每次重新追踪。

## 步骤

### 场景 A：入口初始化

1. **识别涉及模块**
   - 根据用户描述的需求范围（功能、问题、模块名）推断涉及哪些模块
   - 不要过度扩展——只覆盖本次需要理解的模块

2. **读取 L1 index**
   - 先读 `.aiknowledge/codemap/index.md`（不存在则准备从头创建）
   - 对比已有模块列表，确定哪些模块缺失

3. **对每个缺失模块：读代码 → 生成文档**
   - 读该模块的关键文件（入口 + 核心实现）
   - 生成模块文档：职责 + 关键文件角色 + 隐式约束
   - **不记录**类/函数级细节，那些 AI 读文件就能快速获取

4. **判断是否需要 chain**
   - 如果发现跨模块的复杂调用链（追踪 3 个以上文件才能串通），记录为 chain
   - 在 index.md 的链路表中添加引用

5. **更新 index.md**
   - 追加新模块行
   - 确认链路表准确

### 场景 B：出口更新

1. **确认变更涉及的模块**（由 archive 传入上下文）

2. **读当前 codemap**
   - 读受影响模块的 .md 文件
   - 判断哪些信息已过时（文件改动、接口变更、新增约束）

3. **更新模块文档**
   - 只更新变更涉及的部分
   - 如果约束或调用链有变化，同步更新对应 chain 文件

4. **更新 index.md**（如有新模块或新链路）

## 写入规则

- **只更新涉及的模块**，不全量重写
- **写入前向用户展示变更摘要**，确认后再写
- 发现文档与代码不一致时，更新文档（过时即删）

## 护栏

- 地图而非百科：记录"在哪里"和"怎么连"，不记录实现细节
- 稳定接口优先：记录公开接口和模块边界，不记录内部实现
- 文件级粒度：关键文件列表精确到文件，不到类/函数
- 链路按需创建：只有跨 3 个以上文件的调用链才值得记录

