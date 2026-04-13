## 为什么

工作流审计发现 opsx skill 体系存在系统性一致性问题：门控环节可被跳过（无持久化状态验证）、知识库复用在多条路径中缺失、skill 之间存在描述冲突。这些问题导致工作流的质量保障能力与设计意图不匹配。

## 变更内容

1. **门控状态持久化**：各关卡通过后写入 `.openspec.yaml` 的 `gates` 字段，后续 skill 启动时程序化校验
2. **补齐知识预加载**：opsx-continue、opsx-ff、opsx-explore、opsx-bugfix 补充缺失的 codemap/pitfalls 读取步骤
3. **修正描述冲突**：修复路由目标错误、消除"替代"歧义、统一 apply/implement 触发边界、修正步骤编号
4. **archive 前置检查强化**：archive 启动时校验 verify/review 门控状态
5. **L3 pitfall 条目消费指引**：消费侧 skill 在 L2 命中后要求继续读 L3 具体条目

## 功能 (Capabilities)

### 新增功能
- `gate-persistence`: 门控状态持久化机制——关卡通过后写入 `.openspec.yaml` gates 字段，后续 skill 程序化校验
- `knowledge-loading-consistency`: 统一所有规划/实施路径的知识库预加载行为

### 修改功能
- （无项目级 specs 需修改，本次变更的对象是 skill 文件自身）

## 影响

- **直接修改的文件**：`.claude/skills/opsx-*/SKILL.md`（约 12 个 skill 文件）
- **间接影响**：`.claude/opsx/schemas/spec-driven/schema.yaml`（如需调整 `.openspec.yaml` 结构）、`changes.sh`（如需支持 gates 写入命令）
- **不影响**：项目源码、`.aiknowledge/` 目录结构
