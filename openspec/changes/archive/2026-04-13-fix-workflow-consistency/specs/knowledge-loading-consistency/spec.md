## 新增需求

### 需求:opsx-continue 和 opsx-ff 补齐知识预加载
**Trace**: R4
**Slice**: knowledge/plan-path

opsx-continue 和 opsx-ff 在创建产出物前，必须执行与 opsx-plan 相同的知识预加载：先读 `.aiknowledge/codemap/index.md` 定位目标模块，再读 `.aiknowledge/pitfalls/index.md` 及相关领域索引。

#### 场景:opsx-continue 创建 design 前读取知识库
- **当** opsx-continue 即将创建 design.md
- **那么** 已读取 codemap index 和相关模块文件，已读取 pitfalls index 和相关领域索引

#### 场景:opsx-ff 创建首个产出物前读取知识库
- **当** opsx-ff 启动并开始创建产出物序列
- **那么** 在创建第一个产出物前已完成 codemap 和 pitfalls 的 index-first 加载

### 需求:opsx-bugfix 修复前读取 pitfalls
**Trace**: R5
**Slice**: knowledge/bugfix

opsx-bugfix 在定位问题（步骤 2）之后、决定测试策略（步骤 3）之前，必须读取 `.aiknowledge/pitfalls/index.md` 并查找相关领域的已知陷阱，避免重复踩已知问题。

#### 场景:bugfix 读取相关领域 pitfalls
- **当** opsx-bugfix 完成 codemap 定位后
- **那么** 读取 pitfalls index 并检查当前 bug 所在领域是否有已知陷阱

### 需求:opsx-explore 补充 pitfalls 读取
**Trace**: R6
**Slice**: knowledge/explore

opsx-explore 在源码搜索强制协议中，除读取 codemap 外，必须同时读取 `.aiknowledge/pitfalls/index.md`，在探索讨论中引用已知陷阱以辅助设计决策。

#### 场景:explore 源码搜索前读取 pitfalls
- **当** opsx-explore 执行源码搜索强制协议
- **那么** 同时加载 pitfalls index 和相关领域索引

### 需求:消费侧 skill 在 L2 命中后读取 L3 条目
**Trace**: R7
**Slice**: knowledge/l3-read

opsx-tdd、opsx-apply、opsx-implement、opsx-review 在读取 pitfalls L2 domain index 并命中相关条目后，必须继续读取对应的 L3 具体条目文件，获取详细的修复模式和根因分析。

#### 场景:opsx-tdd 读取 L3 pitfall 条目
- **当** opsx-tdd 启动时读取 pitfalls domain index 并发现命中条目
- **那么** 继续读取命中条目的 L3 `.md` 文件

#### 场景:opsx-review 利用 L3 条目作为核查清单
- **当** opsx-review 读取 pitfalls domain index 并发现与 diff 相关的条目
- **那么** 读取 L3 条目并将其现象/根因作为具体核查项
