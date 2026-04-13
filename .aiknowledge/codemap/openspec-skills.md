---
status: active
created_at: 2026-04-13
created_from: metadata-backfill
last_verified_at: 2026-04-13
last_verified_by: opsx-codemap
verification_basis: archive:2026-04-13-stage-packet-protocol
applies_to:
  - .claude/skills
  - .claude/opsx
  - docs
superseded_by:
---

# openspec-skills

## 职责
OpenSpec 工作流的单一真相源。所有 skill 以 Markdown 文件存放于 `.claude/skills/<name>/SKILL.md`，由 `scripts/sync.sh` 分发到目标仓库。

## Skill 清单（17 个）

| Skill | 角色 | 前置关卡 |
|-------|------|----------|
| `opsx-explore` | 思考伙伴，探索想法/调查问题/澄清需求，禁止写代码 | 无 |
| `opsx-plan` | 创建 change 并生成规划产出物（proposal/design/specs），含 codemap/pitfalls 预加载 | 无 |
| `opsx-continue` | 恢复中断的当前 change，按真实文件状态和 `gates.*` 路由下一合法步骤 | 无 |
| `opsx-ff` | 快速生成全部产出物 + 三道关卡 + 实施 | 无 |
| `opsx-plan-review` | spec↔plan 一致性审查（关卡1），硬性门控；组装 PlanReviewPacket 发给 subagent，输出 StageResult JSON | design 已生成 |
| `opsx-tasks` | 将 design+specs 转化为带 TDD 标签的 tasks.md | `gates.plan-review` |
| `opsx-task-analyze` | plan↔tasks 一致性审查（关卡2），硬性门控 | tasks 已生成 + plan-review 已通过 |
| `opsx-tdd` | 红绿重构循环，按 task 标签执行（test-first/characterization-first/direct） | 无（被 implement 调用） |
| `opsx-implement` | 按 tasks.md 逐项实施，每项强制 TDD 循环 | `gates.plan-review` + `gates.task-analyze` |
| `opsx-verify` | 四维验证（完整性/正确性/一致性/测试留档），组装 VerifyPacket 发给单一 subagent 顺序执行，输出 StageResult JSON | 实施完成 |
| `opsx-review` | 独立代码审查，发版风险拦截，分级问题列表 | `gates.verify` 已通过 |
| `opsx-report` | 读取 `context/run-report-data.json`，渲染 self-contained HTML RunReport | 无（按需触发） |
| `opsx-archive` | 归档变更 + knowledge + codemap + git | `gates.verify` + `gates.review` |
| `opsx-bugfix` | 精简 bugfix 流程：定位→测试策略→修复→验证→经验沉淀 | 无 |
| `opsx-codemap` | 维护 `.aiknowledge/codemap/` 架构认知地图 | 无（独立工具） |
| `opsx-knowledge` | 经验沉淀到 `.aiknowledge/pitfalls/` | 无（独立工具） |
| `opsx-auto-drive` | 自动驱动引擎，AI 自主执行完整工作流循环 | 无（编排层） |

## 工作流拓扑

```
explore ─── 需求澄清 ───┐
                         ▼
plan / ff ──────────────→ proposal → specs → design
                                          │
                   continue ──────────────┘  (恢复到当前合法节点)
                                          │
                      plan-review ◄───────┘  (关卡1: spec↔plan)
                           │
                           ▼
                        tasks ──→ tasks.md
                           │
                      task-analyze ◄──────── (关卡2: plan↔tasks)
                           │
                           ▼
                        implement ─────────→ 代码变更
                           │
                           └─── tdd (红绿重构循环)
                           ▼
                         verify ─────────── (关卡3: tasks↔code)
                           │
                         review ─────────── (代码审查)
                           │
                         archive ──→ 归档 + knowledge + codemap + git
```

**旁路流程**：
- `bugfix`：跳过规划，直接 定位→修复→验证→经验沉淀
- `codemap` / `knowledge`：独立维护工具，不参与主流程
- `auto-drive`：编排层，自主驱动上述完整循环

## 隐式约束
- Skills 被 git 追踪（`.gitignore` 精确忽略 `settings.local.json` 等敏感文件）
- 关卡结果写入 `.openspec.yaml` 的 `gates.*` 字段，下游 skill 读取该字段做准入校验
- 所有 skill 按需读取 `.aiknowledge/`（index-first 策略，禁止全量扫描）
- Skill 文件变更后需手动运行 `scripts/sync.sh` 同步到目标仓库
- `opsx-plan-review` 和 `opsx-verify` 遵循 Stage Packet Protocol：主 agent 组装 StagePacket → subagent 消费 → 输出 StageResult；packet 和 results 持久化到 `context/run-report-data.json`，供 `opsx-report` 渲染
- `run_id` 在同一 change 内跨 stage 复用：首个执行的 gate stage 生成，后续 stage 从文件读取并复用；`context/run-report-data.json` JSON 解析失败时必须中止，禁止覆盖
