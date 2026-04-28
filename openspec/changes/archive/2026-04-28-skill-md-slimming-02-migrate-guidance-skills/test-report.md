# Test Report: 2026-04-28-skill-md-slimming/02-migrate-guidance-skills

## Task 1: 瘦身 `opsx-explore` 入口

### 🔴 红阶段
- **时间戳**：2026-04-28 09:20 UTC
- **失败测试列表**：
  - `skill slimming checker reports current inventory without failing baseline` — AssertionError: 总行数仍未下降（目标测试先行）
  - `guidance skills use thin entries with reference navigation` — ENOENT: `skills/opsx-explore/references` 尚不存在
- **假红修正**：无

### 🟢 绿阶段
- **时间戳**：2026-04-28 09:23 UTC
- **通过测试列表**：
  - `node --test tests/skill-slimming.test.mjs` 4/4
  - `node --test tests/workflow-discipline.test.mjs` 17/17
- **变更摘要**：
  - `skills/opsx-explore/SKILL.md` — 修改 — 保留只读、codemap-first、slice 路由和 subagent controller 硬边界
  - `skills/opsx-explore/references/*.md` — 新增 — 承载 workflow、对话模式和 codemap-first 细节
  - `tests/skill-slimming.test.mjs` — 修改 — 增加 guidance skill 薄入口和 references 导航回归测试
- **测试变更记录**：新增结构回归测试，无旧断言删除
- **验收标准覆盖对应表**：

| 验收标准 (AC) | 测试用例名称 | 通过状态 |
|---------------|--------------|----------|
| explore 入口保留硬边界 | `guidance skills use thin entries with reference navigation`、`workflow skills preserve deterministic gate prerequisites` | 通过 |
| explore 迁出长流程并提供 references | `guidance skills use thin entries with reference navigation` | 通过 |

### ♻️ 重构阶段
- **时间戳**：2026-04-28 09:24 UTC
- **通过测试列表**：
  - `node --test tests/skill-slimming.test.mjs`
  - `node --test tests/workflow-discipline.test.mjs`
- **变更摘要**：
  - `skills/opsx-explore/SKILL.md` — 修改 — 补回测试锁定的入口硬词
- **覆盖率**：N/A（文案型 skill 回归测试未配置覆盖率；补救：使用文本回归测试和全量 `npm test`）

## Task 2: 瘦身 `opsx-knowledge`

### 🔴 红阶段
- **时间戳**：2026-04-28 09:20 UTC
- **失败测试列表**：
  - `guidance skills use thin entries with reference navigation` — references 目录缺失
- **假红修正**：无

### 🟢 绿阶段
- **时间戳**：2026-04-28 09:23 UTC
- **通过测试列表**：
  - `node --test tests/skill-slimming.test.mjs` 4/4
- **变更摘要**：
  - `skills/opsx-knowledge/SKILL.md` — 修改 — 保留 `.aiknowledge/README.md`、source_refs、index、月度日志和 tombstone 硬规则
  - `skills/opsx-knowledge/references/*.md` — 新增 — 承载 lifecycle workflow、模板和领域表
- **测试变更记录**：无测试修改
- **验收标准覆盖对应表**：

| 验收标准 (AC) | 测试用例名称 | 通过状态 |
|---------------|--------------|----------|
| knowledge 入口保留 lifecycle 硬规则 | `guidance skills use thin entries with reference navigation` | 通过 |
| 不复制完整 lifecycle 正文 | `node scripts/check-skill-slimming.mjs --json` | 通过 |

### ♻️ 重构阶段
- **时间戳**：2026-04-28 09:24 UTC
- **通过测试列表**：
  - `node --test tests/skill-slimming.test.mjs`
- **变更摘要**：
  - `skills/opsx-knowledge/references/*.md` — 新增 — 将低频模板集中为少量主题文件
- **覆盖率**：N/A（文案型 skill 回归测试未配置覆盖率；补救：使用文本回归测试和全量 `npm test`）

## Task 3: 瘦身 `opsx-codemap`

### 🔴 红阶段
- **时间戳**：2026-04-28 09:20 UTC
- **失败测试列表**：
  - `guidance skills use thin entries with reference navigation` — references 目录缺失
- **假红修正**：无

### 🟢 绿阶段
- **时间戳**：2026-04-28 09:23 UTC
- **通过测试列表**：
  - `node --test tests/skill-slimming.test.mjs` 4/4
- **变更摘要**：
  - `skills/opsx-codemap/SKILL.md` — 修改 — 保留 codemap-only、index-first、月度日志和 freshness 硬规则
  - `skills/opsx-codemap/references/*.md` — 新增 — 承载初始化/出口更新流程和模板
- **测试变更记录**：无测试修改
- **验收标准覆盖对应表**：

| 验收标准 (AC) | 测试用例名称 | 通过状态 |
|---------------|--------------|----------|
| codemap 入口保留写入边界 | `guidance skills use thin entries with reference navigation` | 通过 |
| codemap 行数显著下降 | `node scripts/check-skill-slimming.mjs --json` | 通过 |

### ♻️ 重构阶段
- **时间戳**：2026-04-28 09:24 UTC
- **通过测试列表**：
  - `node --test tests/skill-slimming.test.mjs`
- **变更摘要**：
  - `skills/opsx-codemap/references/*.md` — 新增 — 将模板与 workflow 拆分为两个主题
- **覆盖率**：N/A（文案型 skill 回归测试未配置覆盖率；补救：使用文本回归测试和全量 `npm test`）

## Task 4: 瘦身 `opsx-lite` 与 `opsx-slice`

### 🔴 红阶段
- **时间戳**：2026-04-28 09:20 UTC
- **失败测试列表**：
  - `guidance skills use thin entries with reference navigation` — references 目录缺失
- **假红修正**：无

### 🟢 绿阶段
- **时间戳**：2026-04-28 09:23 UTC
- **通过测试列表**：
  - `node --test tests/skill-slimming.test.mjs` 4/4
  - `node --test tests/workflow-discipline.test.mjs` 17/17
- **变更摘要**：
  - `skills/opsx-lite/SKILL.md` — 修改 — 保留升级条件、fresh evidence 和中文 lite-run 字段
  - `skills/opsx-lite/references/*.md` — 新增 — 承载 workflow 和 lite-run 模板
  - `skills/opsx-slice/SKILL.md` — 修改 — 保留 cohesion、subchange 和拓扑规则
  - `skills/opsx-slice/references/*.md` — 新增 — 承载切分报告和 proposal 模板
- **测试变更记录**：保留既有中文模板断言；无旧断言删除
- **验收标准覆盖对应表**：

| 验收标准 (AC) | 测试用例名称 | 通过状态 |
|---------------|--------------|----------|
| lite 保留升级和 fresh evidence | `verify and lite require fresh verification evidence before completion claims` | 通过 |
| slice proposal 默认中文 | `proposal generation contracts default to Chinese artifact prose` | 通过 |

### ♻️ 重构阶段
- **时间戳**：2026-04-28 09:24 UTC
- **通过测试列表**：
  - `node --test tests/workflow-discipline.test.mjs`
- **变更摘要**：
  - `skills/opsx-lite/SKILL.md`、`skills/opsx-slice/SKILL.md` — 修改 — 补回测试锁定的入口硬词
- **覆盖率**：N/A（文案型 skill 回归测试未配置覆盖率；补救：使用文本回归测试和全量 `npm test`）

## Task 5: 瘦身 `opsx-auto-drive` 与 `opsx-bugfix`

### 🔴 红阶段
- **时间戳**：2026-04-28 09:20 UTC
- **失败测试列表**：
  - `guidance skills use thin entries with reference navigation` — references 目录缺失
- **假红修正**：无

### 🟢 绿阶段
- **时间戳**：2026-04-28 09:23 UTC
- **通过测试列表**：
  - `node --test tests/skill-slimming.test.mjs` 4/4
  - `node --test tests/workflow-discipline.test.mjs` 17/17
- **变更摘要**：
  - `skills/opsx-auto-drive/SKILL.md` — 修改 — 保留目标、量化、门控、停止和 summary 输出契约
  - `skills/opsx-auto-drive/references/*.md` — 新增 — 承载引擎循环和记录模板
  - `skills/opsx-bugfix/SKILL.md` — 修改 — 保留根因铁律、单一假设和连续 3 次失败停止规则
  - `skills/opsx-bugfix/references/workflow.md` — 新增 — 承载详细 bugfix 步骤
- **测试变更记录**：无测试修改
- **验收标准覆盖对应表**：

| 验收标准 (AC) | 测试用例名称 | 通过状态 |
|---------------|--------------|----------|
| auto-drive 保留目标和停止规则 | `guidance skills use thin entries with reference navigation` | 通过 |
| bugfix 保留根因规则 | `bugfix skill requires root cause before fixes` | 通过 |

### ♻️ 重构阶段
- **时间戳**：2026-04-28 09:24 UTC
- **通过测试列表**：
  - `node --test tests/skill-slimming.test.mjs`
  - `node --test tests/workflow-discipline.test.mjs`
- **变更摘要**：
  - `skills/opsx-bugfix/SKILL.md` — 修改 — 补回测试锁定的“形成单一假设”硬词
- **覆盖率**：N/A（文案型 skill 回归测试未配置覆盖率；补救：使用文本回归测试和全量 `npm test`）

## Task 6: 更新瘦身库存和验证留档

### Direct 验证
- **时间戳**：2026-04-28 09:24 UTC
- **变更摘要**：
  - `docs/skill-slimming-inventory.md` — 修改 — 更新 02 后行数、剩余 P0/P1 和检查输出摘要
  - `openspec/changes/2026-04-28-skill-md-slimming/subchanges/02-migrate-guidance-skills/tasks.md` — 修改 — 标记任务验收项完成
- **验证命令**：
  - `node --test tests/skill-slimming.test.mjs`：通过，4/4
  - `node --test tests/workflow-discipline.test.mjs`：通过，17/17
  - `node scripts/check-skill-slimming.mjs --json`：通过，totalLines 2289，oversized 3，duplicates 2
