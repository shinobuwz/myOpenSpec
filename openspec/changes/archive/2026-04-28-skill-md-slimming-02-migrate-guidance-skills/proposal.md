# 目标

按 `01-slimming-structure` 建立的政策，瘦身 guidance-heavy OPSX skills：把长流程、模板、示例和生命周期细节从 `SKILL.md` 迁入同 skill 的 `references/`，同时保持各 skill 的执行语义不变。

# 范围内

- 优先迁移最高体量的 guidance skills：
  - `skills/opsx-explore/SKILL.md`
  - `skills/opsx-knowledge/SKILL.md`
  - `skills/opsx-codemap/SKILL.md`
- 在不改变 stage 边界的前提下迁移次级 guidance skills：
  - `skills/opsx-lite/SKILL.md`
  - `skills/opsx-slice/SKILL.md`
  - `skills/opsx-auto-drive/SKILL.md`
  - `skills/opsx-bugfix/SKILL.md`
- 为受影响 skill 创建 `references/` 文件，承载：
  - 详细 workflow
  - 示例对话或报告
  - 文档模板
  - 生命周期和目录格式细节
  - 较长的护栏解释
- 在 `SKILL.md` 入口继续保留硬边界：
  - `opsx-explore` 对产品代码保持只读。
  - 源码探索保持 codemap-first。
  - `opsx-knowledge` 和 `opsx-codemap` 写入前继续读取 `.aiknowledge/README.md`。
  - `opsx-lite` 继续拒绝非 lite 变更，并要求 fresh verification evidence。
- 保留中文 skill 正文和现有 frontmatter `name` / `description`。

# 范围外

- Gate-stage skills 和 reviewer prompts；它们由 `03-migrate-gate-skills` 处理。
- 改变 `.aiknowledge` lifecycle 语义。
- 改变 `opsx-slice` 的交付边界判断规则。
- 新增 workflow stage。
- 安装、发布或同步迁移后的 skills。

# 依赖

- `01-slimming-structure`
- `.aiknowledge/README.md` 中现有知识生命周期契约
- `.aiknowledge/codemap/openspec-skills.md` 中现有 skill 拓扑和瘦身规则

# 完成定义

- 受影响 guidance skills 拥有短而可执行的 `SKILL.md`，并包含清晰 reference 导航。
- 长示例、模板、详细生命周期流程迁入同 skill `references/`。
- 硬性安全规则仍直接保留在入口文件中，而不是只埋在 references。
- `rg` 或检查脚本能确认旧的 canonical-contract 重复已删除或替换为引用。
- 已迁移 `SKILL.md` 行数显著下降，但行为不被删除。
