## 1. 移除 sync-specs 模板和 skill 注册

- [ ] 1.1 [R1][U1][direct] 删除 `src/core/templates/workflows/sync-specs.ts` 文件
- [ ] 1.2 [R1][U1][characterization-first] 从 `src/core/templates/skill-templates.ts` 移除 sync-specs re-export
- [ ] 1.3 [R1][U1][characterization-first] 从 `src/core/shared/skill-generation.ts` 移除 sync-specs 模板注册（`getSyncSpecsSkillTemplate`、`getOpsxSyncCommandTemplate` 及对应 entry）

## 2. 简化 archive 工作流

- [ ] 2.1 [R2][U2][characterization-first] 从 `src/core/archive.ts` 移除 spec 同步逻辑（`findSpecUpdates`/`buildUpdatedSpec`/`writeUpdatedSpec` 调用及 `--skip-specs` 分支）
- [ ] 2.2 [R2][U2][characterization-first] 从 `src/core/templates/workflows/archive-change.ts` 的 skill 模板和 command 模板中移除步骤 4（同步评估）及相关 `--skip-specs` 描述
- [ ] 2.3 [R2][U2][direct] 从 `src/cli/index.ts` archive 命令移除 `--skip-specs` 选项和描述中的"更新主规范"文字

## 3. 移除 spec CLI 命令

- [ ] 3.1 [R3][U3][direct] 删除 `src/commands/spec.ts` 文件
- [ ] 3.2 [R3][U3][direct] 从 `src/cli/index.ts` 移除 `registerSpecCommand` 调用和 import

## 4. 移除 specs-apply 核心逻辑

- [ ] 4.1 [R4][U4][direct] 删除 `src/core/specs-apply.ts` 文件
- [ ] 4.2 [R4][U4][direct] 从 `src/core/archive.ts` 移除对 `specs-apply` 的 import 语句

## 5. 清理注册表和 profile

- [ ] 5.1 [R5][U5][characterization-first] 从 `src/core/profiles.ts` `ALL_WORKFLOWS` 和 `CORE_WORKFLOWS` 中移除 `'sync'`
- [ ] 5.2 [R5][U5][direct] 从 `src/core/init.ts` `WORKFLOW_TO_SKILL_DIR` 移除 `'sync'` 映射
- [ ] 5.3 [R5][U5][direct] 从 `src/core/profile-sync-drift.ts` `WORKFLOW_TO_SKILL_DIR` 移除 `'sync'` 映射
- [ ] 5.4 [R5][U5][characterization-first] 从 `src/core/shared/tool-detection.ts` `SKILL_NAMES` 移除 `'openspec-sync-specs'`，从 `COMMAND_IDS` 移除 `'sync'`
- [ ] 5.5 [R5][U5][direct] 从 `src/core/completions/command-registry.ts` 移除 archive 描述中的"更新主规范"文字
- [ ] 5.6 [R5][U5][characterization-first] 从 `src/commands/show.ts` 和 `src/commands/validate.ts` 移除对 `getSpecIds` 的调用及 `--specs` 相关逻辑
- [ ] 5.7 [R5][U5][characterization-first] 从 `src/utils/item-discovery.ts` 移除 `getSpecIds` 函数
- [ ] 5.8 [R5][U5][direct] 从 `src/commands/completion.ts` 移除 `getSpecIds` 调用和 import
- [ ] 5.9 [R5][U5][direct] 从 `src/cli/index.ts` `list` 命令移除 `--specs` 选项

## 6. 删除主规范目录、已安装 skill 及相关测试

- [ ] 6.1 [R6][U6][direct] 删除 `openspec/specs/` 目录
- [ ] 6.2 [R6][U6][direct] 删除 `.claude/skills/openspec-sync-specs/` 目录
- [ ] 6.3 [R6][U6][characterization-first] 删除 `test/commands/spec.test.ts`、`test/commands/spec.interactive-show.test.ts`、`test/commands/spec.interactive-validate.test.ts`
- [ ] 6.4 [R6][U6][characterization-first] 从 `test/core/archive.test.ts` 移除 spec 同步相关测试用例

## 7. 构建验证

- [ ] 7.1 [R1][R2][R3][R4][R5][U1][U2][U3][U4][U5][direct] 运行 `npm run build` 确认 TypeScript 编译无错误
- [ ] 7.2 [R1][R2][R3][R4][R5][R6][U1][U2][U3][U4][U5][U6][direct] 运行 `npm test` 确认所有测试通过
