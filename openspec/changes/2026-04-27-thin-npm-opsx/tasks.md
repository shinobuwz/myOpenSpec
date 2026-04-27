# Tasks: Thin npm launcher for OPSX

## 0. 测试与包基础

- [x] 0.1 [R1][R4][U1][direct] 创建最小 npm 包与 Node 测试脚手架

**需求追踪**：[R1][R4] → [U1]
**执行方式**：[direct]
**涉及文件**：
- `package.json` — npm 包元数据、bin、test 脚本、files 声明
- `bin/opsx` — npm bin shim
- `bin/opsx.mjs` — launcher 入口
- `tests/opsx.test.mjs` — Node 测试入口

**验收标准**：
- [ ] `npm test` 能执行一个空测试
- [ ] `node bin/opsx.mjs --help` 输出受支持子命令
- [ ] `npm pack --dry-run` 不依赖 `dist/`

**依赖**：无

## 1. 全局 launcher 与项目解析

- [x] 1.1 [R1][R5][R6][R7][R11][U1][test-first] 实现 launcher 参数解析和项目根发现

**需求追踪**：[R1][R5][R6][R7][R11] → [U1]
**执行方式**：[test-first]
**涉及文件**：
- `bin/opsx.mjs` — CLI 参数解析、project 解析、help/error 行为
- `tests/opsx.test.mjs` — `-p/--project`、环境变量、cwd fallback、子目录/文件路径测试

**验收标准**：
- [ ] `-p/--project` 优先于 `OPSX_PROJECT_ROOT`
- [ ] `OPSX_PROJECT_ROOT` 优先于 cwd discovery
- [ ] 子目录和文件路径会归一化到最近 OpenSpec 项目根
- [ ] 未知子命令返回非零退出码
- [ ] 路径测试使用 Node path API，不硬编码 `/`

**依赖**：Task 0.1

- [x] 1.2 [R2][R3][R4][R11][U1][test-first] 实现 `changes` 和 `init-project` 子命令分发

**需求追踪**：[R2][R3][R4][R11] → [U1]
**执行方式**：[test-first]
**涉及文件**：
- `bin/opsx.mjs` — `changes` 转发、`init-project` 初始化
- `tests/opsx.test.mjs` — 子进程 smoke tests 和临时项目断言

**验收标准**：
- [ ] `opsx changes -p <repo> list` 读取目标项目 changes
- [ ] `opsx init-project -p <repo>` 创建 `openspec/config.yaml` 和 `openspec/changes`
- [ ] 已有 `openspec/config.yaml` 不被覆盖
- [ ] 初始化项目不创建 `.opsx` 或 `.claude/opsx`

**依赖**：Task 1.1

## 2. Change helper runtime

- [x] 2.1 [R2][R5][R8][U2][test-first] 迁移 canonical change helper 并支持任意位置 `-p/--project`

**需求追踪**：[R2][R5][R8] → [U2]
**执行方式**：[test-first]
**涉及文件**：
- `runtime/bin/changes.sh` — canonical change helper
- `.claude/opsx/bin/changes.sh` — compatibility wrapper
- `tests/changes-helper.test.mjs` — shell helper smoke tests

**验收标准**：
- [ ] `runtime/bin/changes.sh -p <repo> list` 和 `runtime/bin/changes.sh list -p <repo>` 都有效
- [ ] 从 A 目录操作 B 项目不会读取 A 的 `openspec/changes`
- [ ] `resolve` 输出绝对路径
- [ ] `init ../escape` 被拒绝且不在项目外创建文件

**依赖**：Task 1.2

## 3. 全局 skills 安装与同步边界

- [x] 3.1 [R9][R10][R11][R13][U3][test-first] 实现 `install-skills` 和 project-only 初始化边界

**需求追踪**：[R9][R10][R11][R13] → [U3]
**执行方式**：[test-first]
**涉及文件**：
- `bin/opsx.mjs` — `install-skills` 实现
- `scripts/install-global.sh` — 调用全局 npm/launcher 安装模型或保持等价行为
- `scripts/sync.sh` — 仓库级同步不复制 runtime
- `scripts/install-repos.sh` — usage 文案与同步边界
- `tests/opsx.test.mjs` — 全局 skills 安装和陈旧 skill 清理测试

**验收标准**：
- [ ] `OPSX_AGENTS_SKILLS_HOME=<tmp> node bin/opsx.mjs install-skills` 安装 `opsx-*` skills
- [ ] 陈旧 `opsx-*` skill 被清理
- [ ] 非 `opsx-*` skill 被保留
- [ ] `scripts/sync.sh <target>` 不创建 `<target>/.claude/opsx`

**依赖**：Task 2.1

## 4. Skills 与文档迁移

- [x] 4.1 [R3][R4][R12][R13][U4][direct] 更新 skills、docs、codemap 和经验说明为 thin npm 边界

**需求追踪**：[R3][R4][R12][R13] → [U4]
**执行方式**：[direct]
**涉及文件**：
- `skills/opsx-*/SKILL.md` — helper 调用示例迁移到 `opsx changes`
- `README.md` — npm/global 使用方式
- `docs/getting-started.md` — 安装与初始化流程
- `docs/supported-tools.md` — runtime/source-of-truth 边界
- `docs/workflows.md` — 工作流命令示例
- `.aiknowledge/codemap/skill-sync.md` — 同步模型更新
- `.aiknowledge/codemap/openspec-skills.md` — runtime 分发边界更新
- `.aiknowledge/pitfalls/misc/*.md` — 记录全局 runtime 与项目状态边界

**验收标准**：
- [ ] 通用 helper 示例优先使用 `opsx changes`
- [ ] 文档明确 npm 是 thin launcher，不恢复旧复杂 CLI
- [ ] 文档明确项目内只保留 `openspec/` 状态
- [ ] 只有兼容说明允许出现 `.claude/opsx/bin/changes.sh`

**依赖**：Task 3.1

## 5. 验证

- [x] 5.1 [R1][R2][R5][R8][R9][R10][R11][U1][U2][U3][test-first] 执行端到端 smoke 验证并修复发现的问题

**需求追踪**：[R1][R2][R5][R8][R9][R10][R11] → [U1][U2][U3]
**执行方式**：[test-first]
**涉及文件**：
- `tests/opsx.test.mjs` — npm launcher 验证
- `tests/changes-helper.test.mjs` — helper 验证
- `package.json` — pack/test scripts
- `openspec/changes/2026-04-27-thin-npm-opsx/test-report.md` — TDD 留档

**验收标准**：
- [ ] `npm test` 通过
- [ ] `npm pack --dry-run` 通过且包内容符合预期
- [ ] `node bin/opsx.mjs changes -p <tmp-repo> init demo spec-driven` 可用
- [ ] [manual] 在安装到全局 npm 前，需人工决定最终包名和发布权限

**依赖**：Task 4.1

- [x] 5.2 [R4][R9][R10][R13][U3][direct] 将 OPSX 包源码真相源从 `.claude` 迁移到通用目录

**需求追踪**：[R4][R9][R10][R13] → [U3]
**执行方式**：[direct]
**涉及文件**：
- `skills/opsx-*/SKILL.md` — canonical skill source
- `runtime/schemas/spec-driven/**` — canonical schema/templates
- `bin/opsx.mjs` — `install-skills` source path
- `scripts/sync.sh` — project adapter sync source path
- `package.json` — npm package file scope
- `tests/opsx.test.mjs` — package file scope and sync coverage

**验收标准**：
- [ ] npm package 包含 `skills/` 和 `runtime/`，不包含 `.claude/` 源目录
- [ ] `opsx install-skills` 从 `skills/` 安装全局 skills
- [ ] `scripts/sync.sh <target>` 把 `skills/opsx-*` 同步为目标项目 `.claude/skills/opsx-*`
- [ ] `.claude/opsx/bin/changes.sh` 仅作为源码 checkout 的兼容 wrapper 保留

**依赖**：Task 5.1
