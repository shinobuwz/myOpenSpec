## ADDED Requirements

### 需求:SKILL.md 体量库存
**Trace**: R6
**Slice**: skill-slimming-validation/inventory
仓库必须提供当前 OPSX `SKILL.md` 的体量库存。

#### 场景: 维护者准备选择迁移顺序
- **当** 维护者查看瘦身规划产物或仓库文档
- **那么** 维护者能看到每个 `skills/opsx-*/SKILL.md` 的基线行数、风险标签、优先级

### 需求:入口文件超限检查
**Trace**: R7
**Slice**: skill-slimming-validation/size-check
仓库必须提供可重复执行的检查来发现过大的 `SKILL.md` 入口文件。

#### 场景: 后续变更重新增大入口文件
- **当** 维护者运行仓库测试或指定检查命令
- **那么** 检查结果会指出超过政策阈值的 `skills/opsx-*/SKILL.md`

### 需求:重复公共契约检查
**Trace**: R8
**Slice**: skill-slimming-validation/duplication-check
仓库必须提供可重复执行的检查来发现重复复制 canonical contract 的入口文件。

#### 场景: 后续变更复制 StageResult 或 subagent 平台映射
- **当** 维护者运行仓库测试或指定检查命令
- **那么** 检查结果会指出含有完整 StageResult schema、完整 subagent 平台映射、完整 `.aiknowledge` lifecycle 正文的非 canonical `SKILL.md`

### 需求:检查不依赖非必要外部 CLI
**Trace**: R9
**Slice**: skill-slimming-validation/no-external-cli
瘦身检查必须使用仓库已有运行环境或基础 shell 能力。

#### 场景: 新环境执行瘦身检查
- **当** 维护者在只安装仓库声明依赖的环境中运行检查
- **那么** 检查不依赖未声明的外部 CLI
