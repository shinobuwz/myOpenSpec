## ADDED Requirements

### 需求:project 参数显式选择目标仓库
**Trace**: R5
系统必须支持 `-p <path>` 和 `--project <path>` 参数，并将解析后的目标项目作为所有 change 操作的唯一项目状态根。

#### 场景:从 A 目录操作 B 仓库
- **当** 当前 shell 工作目录位于 `<repo-a>`
- **当** 用户运行 `opsx changes -p <repo-b> list`
- **那么** 系统必须读取 `<repo-b>/openspec/changes`
- **那么** 系统禁止读取 `<repo-a>/openspec/changes`

#### 场景:参数位置宽松
- **当** 用户运行 `opsx changes init demo -p <repo> spec-driven`
- **那么** 系统必须将 `<repo>` 识别为目标项目
- **那么** 系统必须将 `demo` 和 `spec-driven` 识别为 `init` 参数

### 需求:项目路径自动归一化
**Trace**: R6
系统必须接受项目根、项目内子目录或项目内文件路径作为 project 参数，并向上查找最近的 OpenSpec 项目根。

#### 场景:传入子目录
- **当** `<repo>/docs` 存在
- **当** 用户运行 `opsx changes -p <repo>/docs list`
- **那么** 系统必须把目标项目归一化为 `<repo>`

#### 场景:传入文件路径
- **当** `<repo>/README.md` 存在
- **当** 用户运行 `opsx changes -p <repo>/README.md list`
- **那么** 系统必须把目标项目归一化为 `<repo>`

#### 场景:Windows 路径
- **当** 用户在 Windows 上传入 `C:\work\repo\docs`
- **那么** 系统必须使用 Node.js path API 或 shell 安全解析机制处理路径
- **那么** 系统禁止依赖硬编码 `/` 分隔符判断项目根

### 需求:project 解析优先级固定
**Trace**: R7
系统必须按 `CLI -p/--project`、`OPSX_PROJECT_ROOT`、当前工作目录向上查找的顺序解析项目根。

#### 场景:CLI 参数覆盖环境变量
- **当** `OPSX_PROJECT_ROOT=<repo-a>`
- **当** 用户运行 `opsx changes -p <repo-b> list`
- **那么** 系统必须操作 `<repo-b>`

#### 场景:缺省时使用当前目录发现
- **当** 当前目录位于 `<repo>/docs`
- **当** 用户运行 `opsx changes list`
- **那么** 系统必须操作 `<repo>`

### 需求:change 写入必须限制在目标项目
**Trace**: R8
系统必须保证所有 `init`、`init-group`、`init-subchange`、`set-*` 写操作都落在目标项目的 `openspec/changes` 内，并拒绝路径穿越或保留名称。

#### 场景:拒绝路径穿越名称
- **当** 用户运行 `opsx changes -p <repo> init ../escape`
- **那么** 命令必须失败
- **那么** 系统不得在 `<repo>/openspec/changes` 外创建文件

#### 场景:resolve 输出绝对路径
- **当** 用户运行 `opsx changes -p <repo> resolve demo`
- **那么** 输出必须是目标 change root 的绝对路径
