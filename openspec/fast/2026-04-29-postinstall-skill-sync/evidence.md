# Evidence：2026-04-29-postinstall-skill-sync

正文默认使用中文；路径、命令、配置键名、frontmatter key 和状态枚举保持原文。

## TDD 策略证据

- 策略: direct
- 选择理由: npm postinstall 集成不适合先写业务失败测试；应验证生命周期入口、环境变量和安装结果。
- 跳过 TDD 理由（direct 必填）: 无业务算法或用户功能路径，测试重点是安装副作用。
- 替代验证: CLI 单元测试、本地 tarball 全局安装、全量测试。

## 命令证据

### 2026-04-29 20:47

- 命令: `node --test tests/opsx.test.mjs`
- 退出状态: 0
- 结果摘要: 16 项通过；覆盖 postinstall 全局安装判定、跳过开关、非致命失败、package 内容、skills/common 同步和 `opsx fast init`。

### 2026-04-29 20:47

- 命令: `bash scripts/test-local-install.sh`
- 退出状态: 0
- 结果摘要: 本地 tarball 全局安装通过；安装期 postinstall 自动同步 `opsx-*` skills 和 `~/.opsx/common` contract，并验证安装后的 `opsx fast init` 可生成 fast artifacts。

### 2026-04-29 20:47

- 命令: `git diff --check`
- 退出状态: 0
- 结果摘要: diff whitespace 检查通过。

### 2026-04-29 20:47

- 命令: `npm test`
- 退出状态: 0
- 结果摘要: 全量 69 项测试通过。

### 2026-04-29 20:40

- 命令: `rg -n "runtime/schemas/.*/templates|runtime/schemas/fast/templates|opsx-subagent|\\.\\./common" skills`
- 退出状态: 1
- 结果摘要: `skills/` 下无旧 runtime template 路径、旧 `opsx-subagent` 路径或错误 `../common` 引用。

### 2026-04-29 20:40

- 命令: `node --test tests/workflow-discipline.test.mjs`
- 退出状态: 0
- 结果摘要: 22 项通过；新增覆盖 `opsx-fast` 及其 `item-schema` 调用 `opsx fast init <id> --source-type lite|bugfix`，且不引用 `~/.opsx/templates`。

### 2026-04-29 20:47

- 命令: `rm -rf ~/.opsx/templates && OPSX_POSTINSTALL=1 node bin/postinstall.mjs && find ~/.opsx -maxdepth 3 -type f -print | sort`
- 退出状态: 0
- 结果摘要: 本机同步成功；`/Users/cc/.opsx/common/git-lifecycle.md`、`subagent.md`、`subagent-lifecycle.md` 均已生成，`~/.opsx/templates` 不再创建；runtime templates 保留在包内由 CLI 使用。

## 人工观察证据

### 2026-04-29 20:35

- 观察内容: `package.json` 增加 `postinstall`，`bin/postinstall.mjs` 只在 `npm_config_global=true`、`npm_config_location=global` 或 `OPSX_POSTINSTALL=1` 时运行；`OPSX_SKIP_POSTINSTALL=1` 可跳过。
- 结果: 全局安装默认同步 skills 和 common，本地依赖安装默认不写用户目录，失败仅输出 `OPSX postinstall skipped`；fast 模板初始化通过 CLI 完成。
- 结论: 安装默认体验已补齐，同时保留 npm 生命周期的安全边界。

## 被否定的尝试

无。
