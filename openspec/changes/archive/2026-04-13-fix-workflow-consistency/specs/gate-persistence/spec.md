## 新增需求

### 需求:关卡通过后写入 gates 状态
**Trace**: R1
**Slice**: gate/write

opsx-plan-review、opsx-task-analyze、opsx-verify、opsx-review 在输出"通过"结论后，必须向 `.openspec.yaml` 的 `gates` 字段追加一条记录，包含关卡名称和通过时间戳。

#### 场景:plan-review 通过后写入状态
- **当** opsx-plan-review 输出"通过"结论
- **那么** `.openspec.yaml` 的 `gates` 字段包含 `plan-review: <ISO时间戳>`

#### 场景:关卡未通过时不写入
- **当** 关卡输出"需修正"或"需补充"结论
- **那么** `.openspec.yaml` 的 `gates` 字段不包含该关卡记录

### 需求:后续 skill 启动时校验前置关卡
**Trace**: R2
**Slice**: gate/verify

opsx-tasks 启动时必须校验 `gates.plan-review` 存在；opsx-implement 启动时必须校验 `gates.plan-review` 和 `gates.task-analyze` 均存在；opsx-archive 启动时必须校验 `gates.verify` 和 `gates.review` 均存在。校验失败时必须拒绝执行并提示用户先完成缺失的关卡。

#### 场景:opsx-tasks 校验 plan-review
- **当** opsx-tasks 启动且 `.openspec.yaml` 中不存在 `gates.plan-review`
- **那么** 拒绝执行并提示"请先完成 opsx-plan-review"

#### 场景:opsx-implement 校验双关卡
- **当** opsx-implement 启动且 `gates.task-analyze` 不存在
- **那么** 拒绝执行并提示缺失的关卡名称

#### 场景:opsx-archive 校验 verify 和 review
- **当** opsx-archive 启动且 `gates.verify` 或 `gates.review` 不存在
- **那么** 拒绝执行并提示缺失的关卡名称

### 需求:修正退出契约路由错误
**Trace**: R3
**Slice**: description/routing

opsx-task-analyze 的退出契约中，失败时的路由目标从"opsx-plan"修正为"opsx-tasks"（tasks.md 由 opsx-tasks 生成，修正应回到 opsx-tasks 而非 opsx-plan）。

#### 场景:task-analyze 失败路由修正
- **当** opsx-task-analyze 输出"需补充"结论
- **那么** 退出契约指向 opsx-tasks 而非 opsx-plan

### 需求:修正 skill 定位描述歧义
**Trace**: R9
**Slice**: description/positioning

修正以下 skill 的 frontmatter description，消除触发歧义：
1. opsx-continue：去掉"替代 opsx-plan"，改为说明与 opsx-plan 的差异（轻量路径，无 codemap/pitfalls 预加载）
2. opsx-archive：去掉"实验性"一词
3. opsx-tdd：修正为与 `[direct]` 模式不矛盾的表述（如"需要编写产品代码且非 direct 模式时使用"）
4. opsx-apply：增加"轻量实施，不强制前置关卡"的定位说明以区分 opsx-implement

#### 场景:continue 描述不再声称"替代"
- **当** 读取 opsx-continue 的 frontmatter description
- **那么** 不包含"替代 opsx-plan"的表述

#### 场景:apply 与 implement 触发边界清晰
- **当** 读取 opsx-apply 和 opsx-implement 的 frontmatter description
- **那么** 两者包含明确的区分说明

### 需求:修正步骤编号重复
**Trace**: R8
**Slice**: description/numbering

opsx-tasks 和 opsx-bugfix 中存在重复的步骤编号，必须修正为连续唯一编号。

#### 场景:opsx-tasks 步骤编号连续
- **当** 读取 opsx-tasks 的启动序列步骤列表
- **那么** 所有步骤编号连续无重复

#### 场景:opsx-bugfix 步骤编号连续
- **当** 读取 opsx-bugfix 的步骤列表
- **那么** 所有步骤编号连续无重复
