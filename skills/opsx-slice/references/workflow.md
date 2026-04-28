# opsx-slice Workflow

## 建立最小上下文

1. 运行 `opsx changes list`，确认是否已有相似活动 change。
2. 读取 `.aiknowledge/codemap/index.md`，命中模块时继续读取对应 codemap。
3. 读取 `.aiknowledge/pitfalls/index.md`，识别切分风险。
4. 只收集切分和 proposal 定界需要的信息。

## 识别能力簇

每个 capability cluster 至少说明：

- 用户价值。
- 依赖模块或子系统。
- 主要输入/输出。
- 是否依赖其他 cluster 先落地。

优先按用户可感知能力切，不先按技术层切。

## cohesion 判定

检查：

- 是否可以独立验证。
- 是否可以独立演示或上线。
- 一个 cluster 延期是否不阻塞其他价值。
- 是否共享同一组关键设计决策。
- 是否能在一次 `implement -> verify` 周期内收敛。

## 落地动作

`SPLIT_MULTI_CHANGE`：

1. `opsx changes init-group <group-name>`
2. 为每个 subchange 执行 `opsx changes init-subchange <group-name> <subchange-name> spec-driven`
3. 为每个 subchange 写正式 `proposal.md`
4. 写 group 拓扑：`execution_mode`、`recommended_order`、可选 `suggested_focus`

`KEEP_ONE_CHANGE`：创建单个 change 或单个 subchange proposal，下一步进入 `opsx-plan`。

`NEED_EXPLORE_FIRST`：不创建任何 change，转回 `opsx-explore`。
