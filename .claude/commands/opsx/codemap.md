---
name: "OPSX: Codemap"
description: 维护 .aiknowledge/codemap/ 架构认知地图
category: 工作流
tags: [workflow, codemap, architecture, module, chain]
---

执行 codemap 维护工作流。

## 两种用法

**初始化**：首次接触某些模块，补全缺失的 codemap 条目
```
/opsx:codemap 用户认证模块
/opsx:codemap 音频连接 + 会话管理
```

**更新**：变更归档后，更新受影响模块的 codemap
```
/opsx:codemap update after archiving <change-name>
```

## 执行要求

1. 先读 `.aiknowledge/codemap/index.md`，了解已有模块
2. 识别需要创建/更新的模块
3. 读对应模块的代码，生成/更新模块文档
4. 如发现复杂跨模块调用链，记录到 `chains/`
5. 更新 `index.md` 的模块表和链路表
6. 写入前向用户展示变更摘要确认

## 文档粒度

- **模块文档**：职责 + 关键文件（文件级 + 一句话角色）+ 隐式约束
- **链路文档**：触发点 + 调用链（带文件:行号）+ 隐式约束 + 关键分支
- **不记录**：类/函数级细节、内部实现

## 护栏

- 只更新涉及的模块，不全量重写
- 地图而非百科——告诉 AI 去哪里找，不替代读代码
- 链路按需创建：跨 3 个以上文件的调用链才值得记录
- 过时即删：发现文档与代码不一致时，更新而非保留

