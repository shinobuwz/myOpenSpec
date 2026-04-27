---
name: opsx-knowledge
description: 独立的经验沉淀工作流。将一次修复、开发或排障中的可复用经验整理到 .aiknowledge/ 知识库。
---

执行经验沉淀工作流。目标是把一次具体工作中的可复用信息整理为可检索、可复用的知识条目，写入 `.aiknowledge/pitfalls/`。

## Freshness 原则

pitfall 条目采用事件驱动维护，而不是按时间自动过期。

- `active`：当前可直接作为约束输入
- `stale`：只能作为调查线索，使用前需要复核
- `superseded`：已被新条目替代，默认跳转到替代条目
- `deprecated`：仅保留历史，不参与当前决策

知识更新有两条路径：
- **新增条目**：当前经验尚未被知识库覆盖
- **复核已有条目**：经验已存在，但需要刷新验证信息、修正文案或标记失效/替代

## 适用条件

- 一次 bugfix、feature、review 或排障刚完成
- 过程中出现了值得复用的经验、踩坑或测试方法

## 标准路径

收集上下文 → 判断技术领域 → 写入知识条目 → 更新索引 → 校验可复用性

## 输入 / 输出边界

**读取：**
- 用户输入、最近修改、相关测试、相关提交信息
- `.aiknowledge/pitfalls/index.md` 和命中的领域索引
- 需要引用的最小 git diff 片段

**写入：**
- `.aiknowledge/pitfalls/index.md`
- `.aiknowledge/pitfalls/<domain>/index.md`
- `.aiknowledge/pitfalls/<domain>/<slug>.md`

**边界约束：**
- knowledge 只维护经验知识库，不修改产品代码、测试代码或 OpenSpec gates
- 写入前优先复用已有领域和已有条目，不重复制造近义目录或近义条目

## 目录结构（三层渐进式披露）

```
.aiknowledge/pitfalls/
├── index.md                        # L1 顶层目录：领域列表 + 条目数量 + 链接
├── memory/
│   ├── index.md                    # L2 领域目录：条目标题 + 一句话摘要 + 链接
│   └── <short-slug>.md             # L3 完整条目（含 diff）
├── concurrency/
│   ├── index.md
│   └── ...
└── ...
```

AI 按需加载：先读 L1 顶层 index → 再读 L2 领域 index → 最后读 L3 具体条目。

## 预定义技术领域

| 目录 | 覆盖范围 |
|------|----------|
| `memory/` | 内存泄漏、OOM、循环引用、野指针、引用计数 |
| `concurrency/` | 死锁、竞态条件、线程安全、异步陷阱、信号量 |
| `api/` | 接口变更、兼容性破坏、序列化、版本适配 |
| `build/` | 编译错误、依赖冲突、链接问题、打包陷阱 |
| `testing/` | 测试陷阱、mock 泄漏、flaky test、覆盖率盲区 |
| `performance/` | 性能退化、N+1 查询、渲染卡顿、CPU/IO 瓶颈 |
| `security/` | 安全漏洞、注入、权限绕过、密钥泄露 |
| `platform/` | 平台差异（Android/iOS/Web/小程序）踩坑 |
| `data/` | 数据一致性、脏数据、迁移失败、缓存不一致 |
| `network/` | 超时、重试风暴、DNS 解析、证书、代理 |
| `lifecycle/` | 生命周期管理、初始化顺序、销毁遗漏、状态机 |
| `config/` | 配置错误、环境变量、Feature Flag、灰度 |
| `misc/` | 不属于以上类别的其他经验 |

新领域可按需创建，但优先归入已有类别。

## 步骤

1. **收集上下文**
   - 读取用户输入、最近修改、相关测试或提交信息
   - 提炼出真正值得复用的信息，而不是一次性过程记录

2. **读取 L1 索引，确认已有领域**（必须先执行）
   - **先读 `.aiknowledge/pitfalls/index.md`**，获取已有领域列表
   - 如果 index.md 不存在，说明是首次写入，从头创建
   - 记录已有领域名称，后续选择时以此为准

3. **判断技术领域**（只能从以下两个来源选择）
   - **首选：** 从上一步读取的已有领域中选择（优先复用现有分类）
   - **次选：** 从预定义领域表中选择（见上方表格）
   - **禁止：** 创建项目特定的目录名（如 `audio-conn/`、`miniprogram/`）
   - **规则：** 如果没有完全匹配的领域，选 `misc/`，而不是创建新领域
   - **例外：** 仅当需要新领域且它是通用技术领域（而非项目特定）时，才创建新目录
   - 如果跨多个领域，放在最核心的那个领域下

4. **检查是否可归并 / 复核**
   - 先读该领域的 `index.md`（如果存在），查看是否已有高度相似的条目
   - 相似条目应合并更新，不要重复创建
   - 如果相似条目仍然成立：刷新 `last_verified_at`
   - 如果相似条目已不再成立：标记为 `superseded` 或 `deprecated`

5. **创建或更新条目**
   - 在 `.aiknowledge/pitfalls/<领域>/` 下创建 kebab-case 文件名
   - 使用统一模板：

   ```md
   ---
   status: active
   created_at: YYYY-MM-DD
   created_from: metadata-backfill | change:<name> | commit:<sha>
   last_verified_at: YYYY-MM-DD
   last_verified_by: opsx-knowledge | opsx-archive | opsx-bugfix
   verification_basis: archive | bugfix | review | repository-audit
   applies_to:
     - module/or/path
   superseded_by:
   ---

   # <简短描述>

   **标签**：[语言/平台标签]

   ## 现象
   出了什么问题

   ## 根因
   为什么会出问题

   ## 修复前
   \`\`\`diff
   - 问题代码（从 git diff 中提取核心片段）
   \`\`\`

   ## 修复后
   \`\`\`diff
   + 修复代码（对应的修复片段）
   \`\`\`

   ## 要点
   一句话总结教训，方便 index 引用

   ## 来源
   commit: <short-sha>（YYYY-MM-DD）
   ```

6. **更新索引（关键步骤）**

   **L2 领域 index.md 格式：**
   ```md
   # <领域名称>

   | 条目 | 状态 | 最近复核 | 摘要 |
   |------|------|----------|------|
   | [<标题>](<slug>.md) | active | 2026-04-13 | 一句话要点 |
   ```

   **L1 顶层 index.md 格式：**
   ```md
   # 经验知识库

   | 领域 | Active | Stale | Superseded | 说明 |
   |------|--------|-------|-------------|------|
   | [memory](memory/index.md) | N | 0 | 0 | 内存泄漏、OOM、循环引用 |
   | [concurrency](concurrency/index.md) | N | 0 | 0 | 死锁、竞态、线程安全 |
   | ... | | |
   ```

   每次写入条目后必须同步更新 L2 和 L1 索引。

7. **diff 提取规则**
   - 从 fix/revert 的 git diff 中提取**核心变更片段**，不要贴整个文件
   - 保留足够上下文（前后各 3-5 行）让读者理解代码位置
   - 如果修复涉及多处，只保留最关键的 1-2 处

8. **校验可复用性**
   - 删除只对这一次会话有意义的表述
   - 确保其他人或未来的自己能独立看懂并复用
   - 确保条目状态正确：`active/stale/superseded/deprecated`
   - 若条目被替代，必须填写 `superseded_by`

9. **索引一致性校验**（每次进入 opsx-knowledge 时无条件执行，无论是否有新写入）

   对每个已存在的领域目录执行：
   ```bash
   # 统计目录下实际条目文件数（排除 index.md）
   ls .aiknowledge/pitfalls/<domain>/*.md | grep -v index.md | wc -l
   # 统计 L2 index.md 表格中的数据行数
   grep -c '^\|.*\[.*\](.*\.md)' .aiknowledge/pitfalls/<domain>/index.md
   ```

   - **文件数 > 索引行数**（孤儿条目）→ 对每个未索引的条目文件：
     1. 读取其内容，与同领域已索引条目逐一比对
     2. 高度相似 → 合并内容到已有条目，删除孤儿文件，刷新已有条目的 `last_verified_at`
     3. 不相似 → 补入 L2 index.md
     4. 最后更新 L1 index.md 的条目数量
   - **索引行数 > 文件数**（幽灵索引）→ 从索引中移除引用了不存在文件的行
   - 修复完成后再继续后续步骤

   **为什么无条件执行：** 批量写入时容易遗漏索引更新，导致条目"写了但不可发现"；也可能产生重复条目。此步骤是防护网，确保索引与文件系统同步且无冗余。

10. **完成前强制自检清单**（每次写入后必须逐项确认）

   ```
   [ ] 条目写入的领域目录属于：已有领域 OR 预定义领域表 中的某一个
   [ ] 没有创建项目特定的自定义目录（如 audio-conn/、miniprogram/ 等）
   [ ] L2 领域 index.md 已存在，且本条目已添加到表格中；表格行数 = 目录下条目文件数
   [ ] L1 pitfalls/index.md 已更新，各领域条目数量与 L2 实际行数一致
   [ ] 条目 frontmatter 已包含 status / last_verified_at / last_verified_by / verification_basis
   [ ] 条目文件使用了标准模板格式（含标签/现象/根因/修复前/修复后/要点/来源）
   [ ] 步骤 9 索引一致性校验已通过（无不一致或已修复）
   ```

   如有任何一项未完成，必须补全后才能结束工作流。

## 护栏

- 不把经验总结写成流水账
- 不重复创建多个高相似度条目
- 条目应聚焦一个问题或一个模式，避免大而全
- 每次写入必须更新两层索引
- 发现旧条目不再成立时，优先标 `superseded` 或 `deprecated`，不要静默覆盖历史
- **绝对禁止**：以问题现象或模块名命名领域目录（如 `audio-conn/`、`session-bug/`）
