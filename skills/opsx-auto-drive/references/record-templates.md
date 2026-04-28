# opsx-auto-drive Record Templates

## 目录

```text
.aiknowledge/auto-drive/
└── <change-name>/
    ├── iter-01.md
    ├── iter-02.md
    └── summary.md
```

## iter-N.md

```md
# 第 N 轮迭代

**时间**：YYYY-MM-DD HH:MM
**量化指标**：目标值 X，本轮实测 Y，差距 Z

### 本轮方案

explore/plan 阶段收敛的核心决策。

### verify 发现

- [CRITICAL/WARNING/SUGGESTION] 问题描述

### 决策

达标 / 继续下一轮 / 卡住回退

### 卡住原因（如有）

说明连续 2 轮无改进的表现和回退策略。
```

## summary.md

```md
# Auto-Drive 摘要：<change-name>

**总轮次**：N
**最终状态**：达标 / 超出迭代上限 / 手动停止
**目标**：<用户设定的优化目标>
**量化标准**：<达标条件>

### 指标趋势

| 轮次 | 实测值 | 达标 |
|------|--------|------|
| 1 | Y1 | 否 |

### 关键转折

- 第 N 轮：<什么决策带来了突破或停滞>

### 参考文件

- [第 1 轮](iter-01.md)
```
