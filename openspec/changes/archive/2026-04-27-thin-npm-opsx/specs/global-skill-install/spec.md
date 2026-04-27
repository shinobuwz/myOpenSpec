## ADDED Requirements

### 需求:skills 从包内模板安装到全局 agent 目录
**Trace**: R9
系统必须提供 `opsx install-skills`，将包内 `opsx-*` skills 安装到 `~/.agents/skills` 或 `OPSX_AGENTS_SKILLS_HOME` 指定目录。

#### 场景:默认安装目录
- **当** 用户运行 `opsx install-skills`
- **那么** 系统必须把包内 `skills/opsx-*` 同步到 `~/.agents/skills`

#### 场景:自定义安装目录
- **当** 用户设置 `OPSX_AGENTS_SKILLS_HOME=<target>`
- **当** 用户运行 `opsx install-skills`
- **那么** 系统必须把 skills 同步到 `<target>`

### 需求:skills 安装会清理陈旧 opsx skills
**Trace**: R10
系统必须在安装全局 skills 时移除目标目录中不再由当前包提供的 `opsx-*` skill 目录，并禁止删除非 `opsx-*` skill。

#### 场景:移除陈旧 opsx skill
- **当** `<target>/opsx-old/SKILL.md` 存在
- **当** 当前包不包含 `opsx-old`
- **当** 用户运行 `opsx install-skills`
- **那么** 系统必须删除 `<target>/opsx-old`

#### 场景:保留非 opsx skill
- **当** `<target>/custom-skill/SKILL.md` 存在
- **当** 用户运行 `opsx install-skills`
- **那么** 系统必须保留 `<target>/custom-skill`

### 需求:init-project 只初始化项目状态
**Trace**: R11
系统必须提供 `opsx init-project -p <repo>`，只初始化 `<repo>/openspec/config.yaml` 和 `<repo>/openspec/changes`，并且不得覆盖已有 config 内容。

#### 场景:新项目初始化
- **当** `<repo>/openspec/config.yaml` 不存在
- **当** 用户运行 `opsx init-project -p <repo>`
- **那么** 系统必须创建默认 config 和 changes 目录

#### 场景:已有 config 不被覆盖
- **当** `<repo>/openspec/config.yaml` 已存在且包含自定义内容
- **当** 用户运行 `opsx init-project -p <repo>`
- **那么** 系统必须保留原 config 内容

## MODIFIED Requirements

### 需求:bootstrap list 使用全局 opsx 入口
**Trace**: R12
当文档或 skills 需要建议列出 active changes 时，必须优先使用 `opsx changes list` 或 `opsx changes -p <project> list`，而不是硬编码 `.claude/opsx/bin/changes.sh`。

#### 场景:skill 文档不再硬编码 Claude helper
- **当** 维护者检查 `skills/opsx-*/SKILL.md`
- **那么** 通用 change helper 示例必须使用 `opsx changes`

### 需求:仓库同步不复制通用 runtime
**Trace**: R13
仓库级同步脚本必须只同步必要的 agent adapter 文件，不再把通用 helper scripts 和 schemas 复制到目标项目 `.claude/opsx`。

#### 场景:sync 目标项目不生成 .claude/opsx
- **当** 用户运行 `scripts/sync.sh <target>`
- **那么** 脚本必须把 `skills/opsx-*` 同步为 `.claude/skills/opsx-*`
- **那么** 脚本禁止创建或刷新 `<target>/.claude/opsx`
