## 上下文

OpenSpec 当前维护一个"主规范"目录（`openspec/specs/`），累积所有变更的增量规范。该目录只在 sync-specs 和 archive 两个收尾阶段被读写，日常 plan/review/verify/implement 工作流从不参考它。围绕它存在完整的 skill（`openspec-sync-specs`）、CLI 命令（`spec show/list/validate`、`archive --skip-specs`）和核心逻辑（`specs-apply.ts`、`archive.ts` 中的同步流程）。

## 目标 / 非目标

**目标：**
- 移除主规范目录及其全部相关代码和 skill
- 简化 archive 工作流，去掉规范同步步骤
- 减少用户和系统的维护负担

**非目标：**
- 不改变变更内增量规范（`changes/<name>/specs/`）的格式或流程
- 不引入替代的全局需求存储机制
- 不改变 codemap 或 pitfalls 知识库的结构

## 需求追踪

- [R1] -> [U1] 移除 sync-specs skill 和 command
- [R2] -> [U2] 简化 archive 工作流
- [R3] -> [U3] 移除 spec CLI 命令
- [R4] -> [U4] 移除 specs-apply 核心逻辑
- [R5] -> [U5] 清理注册表和 profile 中的 sync 引用
- [R6] -> [U6] 删除主规范目录和相关测试

## 实施单元

### [U1] 移除 sync-specs skill 模板和 command 模板
- 关联需求: [R1]
- 模块边界: `src/core/templates/workflows/sync-specs.ts`、`src/core/templates/skill-templates.ts`（re-export）、`src/core/shared/skill-generation.ts`（模板注册）
- 验证方式: 构建通过，`openspec-cn init` 不再生成 sync-specs skill
- 知识沉淀: 整文件删除时注意 re-export 链上的所有引用

### [U2] 简化 archive 工作流
- 关联需求: [R2]
- 模块边界: `src/core/archive.ts`（移除 spec 同步逻辑和 `--skip-specs` flag）、`src/core/templates/workflows/archive-change.ts`（skill 模板中移除步骤 4 的同步评估）、`src/cli/index.ts`（archive 命令移除 `--skip-specs` 选项和描述中的"更新主规范"）
- 验证方式: archive 命令不再提示规范同步，`--skip-specs` flag 移除
- 知识沉淀: archive skill 模板存在两份（skill + command），都需要修改

### [U3] 移除 spec CLI 命令
- 关联需求: [R3]
- 模块边界: `src/commands/spec.ts`（整文件删除）、`src/cli/index.ts`（移除 `registerSpecCommand` 调用和 import）
- 验证方式: `openspec-cn spec` 命令不再可用
- 知识沉淀: `show` 和 `validate` 命令中的 spec 逻辑需要同步清理

### [U4] 移除 specs-apply 核心逻辑
- 关联需求: [R4]
- 模块边界: `src/core/specs-apply.ts`（整文件删除）、`src/core/archive.ts`（移除对 specs-apply 的 import）
- 验证方式: 无编译错误
- 知识沉淀: 无

### [U5] 清理注册表和 profile
- 关联需求: [R5]
- 模块边界:
  - `src/core/profiles.ts` — 从 `ALL_WORKFLOWS` 移除 `'sync'`
  - `src/core/init.ts` — 从 `WORKFLOW_TO_SKILL_DIR` 移除 `'sync'` 映射
  - `src/core/profile-sync-drift.ts` — 移除 `'sync'` 映射
  - `src/core/shared/tool-detection.ts` — 从 `SKILL_NAMES` 移除 `'openspec-sync-specs'`，从 `COMMAND_IDS` 移除 `'sync'`
  - `src/core/completions/command-registry.ts` — 移除 archive 描述中的"更新主规范"
  - `src/commands/show.ts`、`src/commands/validate.ts` — 移除对 `getSpecIds` 的调用和 `--specs` 相关逻辑
  - `src/utils/item-discovery.ts` — 移除 `getSpecIds` 函数
  - `src/commands/completion.ts` — 移除 `getSpecIds` 调用
  - `src/cli/index.ts` — `list` 命令移除 `--specs` 选项
- 验证方式: TypeScript 编译通过，所有引用清除
- 知识沉淀: 注册表散布在多个文件，容易遗漏

### [U6] 删除主规范目录和已安装 skill
- 关联需求: [R6]
- 模块边界:
  - 删除 `openspec/specs/` 目录
  - 删除 `.claude/skills/openspec-sync-specs/` 目录
  - 清理相关测试文件（`test/commands/spec.test.ts`、`test/commands/spec.interactive-*.test.ts`、`test/core/archive.test.ts` 中的 spec 同步测试）
- 验证方式: 目录不存在，测试通过
- 知识沉淀: 已安装的 skill 是 init 生成的产物，也需要删除

## 决策

1. **整体删除而非 deprecate** — 主规范没有外部消费者，无需渐进式废弃。直接删除减少代码量和复杂度。
2. **保留 `getSpecIds` 的替代方案：直接删除** — 该函数仅服务于主规范相关命令（`spec show/list/validate`、`show --specs`、`validate --specs`），随命令一起移除。
3. **archive 命令的 `--skip-specs` flag 直接移除** — 该 flag 失去意义，不保留为空操作。

## 风险 / 权衡

- **用户迁移**：已使用 `openspec-cn spec` 命令或 `/opsx:sync` 的用户会发现命令不存在 → 通过 BREAKING 标记在 changelog 中说明
- **已安装 skill 残留**：用户项目中 `.claude/skills/openspec-sync-specs/` 不会自动删除 → `openspec-cn init` 重新运行时应该不再生成它，旧目录对系统无害但可能造成困惑。考虑在 legacy-cleanup 中处理

## 知识沉淀

- 移除贯穿多层的功能（skill 模板 → 注册表 → CLI → 核心逻辑）时，需从注册表常量列表开始排查所有引用点，而非从单一入口文件
- `archive-change.ts` 中 skill 模板和 command 模板是两份独立的文本，修改时必须两份都改
