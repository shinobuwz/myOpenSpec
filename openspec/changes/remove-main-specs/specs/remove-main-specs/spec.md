## 新增需求

### 需求:移除 sync-specs skill 和 command 模板
**Trace**: R1
**Slice**: main-specs/sync-specs-skill
系统必须不再生成 `openspec-sync-specs` skill 及对应的 `/opsx:sync` slash command。

#### 场景:init 不生成 sync-specs skill
- **当** 用户运行 `openspec-cn init`
- **那么** 系统禁止生成 `openspec-sync-specs` skill 目录
- **并且** 禁止注册 `/opsx:sync` slash command

### 需求:archive 不执行主规范同步
**Trace**: R2
**Slice**: main-specs/archive-simplification
系统必须从 archive 工作流中移除主规范同步步骤和相关选项。

#### 场景:archive 不提示规范同步
- **当** 用户运行 `openspec-cn archive <change-name>`
- **那么** 系统禁止提示规范同步操作
- **并且** 系统禁止提供 `--skip-specs` 选项

### 需求:移除 spec CLI 命令
**Trace**: R3
**Slice**: main-specs/spec-cli-removal
系统必须不再提供 `openspec-cn spec` 命令系列。

#### 场景:spec 子命令不可用
- **当** 用户运行 `openspec-cn spec show`、`openspec-cn spec list` 或 `openspec-cn spec validate`
- **那么** 系统必须报告命令不存在

### 需求:移除 specs-apply 核心逻辑
**Trace**: R4
**Slice**: main-specs/specs-apply-removal
系统必须移除将增量规范应用到主规范的核心实现代码。

#### 场景:specs-apply 模块不存在
- **当** 其他模块尝试导入 `specs-apply`
- **那么** 构建系统必须报告模块不存在（编译错误）

### 需求:清理注册表和 profile 中的 sync 引用
**Trace**: R5
**Slice**: main-specs/registry-cleanup
系统必须从所有注册表、profile 和工具列表中移除 sync 工作流相关的引用。

#### 场景:sync 不出现在 profile 工作流列表
- **当** 系统加载工作流 profile
- **那么** `'sync'` 不得出现在 `ALL_WORKFLOWS` 列表中

#### 场景:list 命令不支持 specs 模式
- **当** 用户运行 `openspec-cn list --specs`
- **那么** 系统必须报告 `--specs` 选项不存在

### 需求:删除主规范目录和已安装 skill 文件
**Trace**: R6
**Slice**: main-specs/directory-removal
系统必须移除 `openspec/specs/` 主规范目录及已安装的 `openspec-sync-specs` skill 目录。

#### 场景:主规范目录不存在
- **当** 变更归档完成
- **那么** `openspec/specs/` 目录不存在于项目中

#### 场景:sync-specs skill 目录不存在
- **当** 变更归档完成
- **那么** `.claude/skills/openspec-sync-specs/` 目录不存在于项目中
