## ADDED Requirements

### 需求:全局 opsx 命令作为薄入口
**Trace**: R1
系统必须提供 npm 可安装的全局 `opsx` 命令，并且该命令只负责分发到受支持的少量子命令，不实现 OpenSpec 工作流状态机。

#### 场景:显示帮助
- **当** 用户运行 `opsx --help`
- **那么** 输出必须列出 `changes`、`install-skills`、`init-project` 三类受支持子命令

#### 场景:拒绝未知子命令
- **当** 用户运行 `opsx workflow run`
- **那么** 命令必须以非零退出码退出，并提示未知子命令

### 需求:changes 子命令转发到 change helper
**Trace**: R2
系统必须支持 `opsx changes ...`，并将其参数转发到包内 change helper，使现有 `list`、`status`、`init`、`init-group`、`init-subchange`、`set-*`、`resolve` 操作可通过全局入口执行。

#### 场景:列出目标项目变更
- **当** 用户运行 `opsx changes -p <repo> list`
- **那么** 系统必须列出 `<repo>/openspec/changes` 下的活动变更

#### 场景:init 转发参数
- **当** 用户运行 `opsx changes -p <repo> init 2026-04-27-add-thing spec-driven`
- **那么** 系统必须初始化 `<repo>/openspec/changes/2026-04-27-add-thing`

### 需求:入口不复制 runtime 到项目
**Trace**: R3
系统必须将 runtime 脚本和 schemas 保留在 npm 包内，不得在 `init-project` 或 `install-skills` 时把 runtime 复制到目标项目的 `.opsx` 或 `.claude/opsx` 目录。

#### 场景:初始化项目不创建 runtime 目录
- **当** 用户运行 `opsx init-project -p <repo>`
- **那么** 系统必须创建或保留 `<repo>/openspec`
- **那么** 系统禁止创建 `<repo>/.opsx`
- **那么** 系统禁止创建 `<repo>/.claude/opsx`

### 需求:npm 包内容声明最小运行面
**Trace**: R4
系统必须在 npm 包配置中只声明 `opsx` bin、runtime helper、schemas、skills 模板和必要文档，不得声明 shell completion、profile、delivery 或 workflow selection 相关安装逻辑。

#### 场景:package files 范围可审计
- **当** 维护者执行 npm pack 预检
- **那么** 包内容必须包含 `bin/`、`runtime/`、`.claude/skills/`、`.claude/opsx/schemas/`
- **那么** 包内容不得依赖 `dist/` 目录
