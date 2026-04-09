## MODIFIED Requirements

### 需求:Apply Instructions 命令
系统必须通过 `openspec instructions apply` 生成 schema 感知的 apply 指令。

**Trace**: R4

#### 场景:生成 apply 指令
- **当** 用户运行 `openspec instructions apply --change <id>`
- **并且** 所有必需的产出物（按 schema 的 `apply.requires`）都存在
- **那么** 系统输出：
  - 所有已存在产出物的上下文文件
  - Schema 特定的指令文本
  - 进度跟踪文件路径（如果 `apply.tracks` 已设置）

#### 场景:缺少产出物时 apply 被阻塞
- **当** 用户运行 `openspec instructions apply --change <id>`
- **并且** 必需的产出物缺失
- **那么** 系统指示 apply 被阻塞
- **并且** 列出需要先创建的产出物

#### 场景:Apply 指令 JSON 输出
- **当** 用户运行 `openspec instructions apply --change <id> --json`
- **那么** 系统输出 JSON 包含：
  - `contextFiles`：已存在产出物的路径数组
  - `instruction`：apply 指令文本
  - `tracks`：进度文件路径或 null
  - `applyRequires`：必需产出物 ID 列表
  - `gateReview`：当变更准备好或接近 gate review 时，为 gate review 消费者提供的 facts bundle

#### 场景:Gate review facts 包含声明的 change-local context
- **当** 用户运行 `openspec instructions apply --change <id> --json`
- **并且** 变更包含 `context/knowledge-refs.md`、`context/review-scope.md` 或 `context/artifact-index.md`
- **那么** `gateReview` JSON 将这些声明作为结构化事实包含
- **并且** 文件缺失时保持其可选性质

#### 场景:Gate review facts 暴露就绪相关的产出物状态
- **当** 用户运行 `openspec instructions apply --change <id> --json`
- **那么** `gateReview` JSON 包含现有 spec 文件、design 存在性、test-report 存在性和任务摘要等事实
- **并且** 不包含 reviewer findings、severity 级别或修复建议
