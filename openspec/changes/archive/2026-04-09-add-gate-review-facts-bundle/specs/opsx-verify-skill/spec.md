## MODIFIED Requirements

### 需求:Verify Skill 调用
系统必须提供 `/opsx:verify` skill，验证实现是否与变更产出物匹配。

**Trace**: R5

#### 场景:指定变更名称进行 verify
- **当** agent 执行 `/opsx:verify <change-name>`
- **那么** agent 验证该特定变更的实现
- **并且** 生成验证报告

#### 场景:未指定变更名称进行 verify
- **当** agent 执行 `/opsx:verify` 但未提供变更名称
- **那么** agent 提示用户从可用变更中选择
- **并且** 仅显示具有实现任务的变更

#### 场景:变更没有任务
- **当** 选定的变更没有 tasks.md 或任务为空
- **那么** agent 报告"没有可验证的任务"
- **并且** 建议运行 `/opsx:continue` 来创建任务

#### 场景:Verify reviewers 共享同一个 facts bundle
- **当** agent 为某个变更启动 `/opsx:verify`
- **那么** 首先读取 `openspec instructions apply --change <id> --json`
- **并且** 所有完整性/正确性/一致性/测试留档 reviewers 消费同一个 `gateReview` facts bundle

#### 场景:Verify reviewers 对彼此结论保持 blind
- **当** agent 派遣 verify reviewers
- **那么** 每个 reviewer 可以读取共享 facts bundle、目标产出物和代码证据
- **并且** 不得读取其他 reviewer 的 findings、orchestrator 怀疑点列表或预设 severity

#### 场景:仅在冲突时触发 arbiter
- **当** reviewer 输出在问题存在性、severity 或需求意图上存在冲突
- **那么** agent 可以派遣一个 arbiter 仅聚焦冲突 findings 和证据
- **并且** 不得通过 arbiter 重跑全量验证

#### 场景:Reviewers 一致时跳过 arbiter
- **当** reviewer 输出不存在相关冲突
- **那么** agent 直接汇总 findings 而不调用 arbiter
