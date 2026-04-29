---
name: opsx-slice
description: 在规划前做 change 切分与交付边界判定。凡是涉及全栈、多模块、多 capability、前后端联动、用户明确提到“拆分/切分/slice/分模块/是否要多个 change/任务太大”等情况时，都应优先使用这个 skill；它负责判断应该保持一个 change 还是拆成多个 change，并给出每个 slice 的边界、依赖和下一步建议。
---

切分 Skill。它不是设计，也不是实现；它负责定义 change/subchange 交付边界和执行拓扑。

## 输入 / 输出边界

**读取：**
- 用户当前需求、目标、约束
- `openspec/changes/` 下现有活动 change
- `.aiknowledge/codemap/index.md` + 命中模块
- `.aiknowledge/pitfalls/index.md` + 命中领域

**写入：**
- `openspec/changes/<group>/.openspec.group.yaml`
- `openspec/changes/<group>/subchanges/<name>/.openspec.yaml`
- `openspec/changes/<group>/subchanges/<name>/proposal.md`

**禁止写入：**
- `design.md`、`specs/`、`tasks.md`
- gates、`test-report.md`、`review-report.md`
- 父级 `index.md` 或父级 `audit-log.md`

## 核心判定

1. 这是否仍是一个单一交付单元？
2. 如果不是，最自然切分轴是用户能力、业务能力、系统边界还是技术探针？
3. 哪些部分必须一起做，哪些可以延期？
4. subchange 的执行关系是串行、并行还是混合？

## 快速流程

1. 建立最小上下文：运行 `opsx changes list`，按 index-first 读取 codemap/pitfalls。
2. 识别 capability clusters，并记录用户价值、模块、输入/输出、依赖关系。
3. 做 cohesion 判定：独立验证、独立演示、延期影响、共享设计决策、一次 implement/verify 是否能收敛。
4. 根据结论落地：
   - `SPLIT_MULTI_CHANGE`：创建父 group 和 subchanges，写入 `execution_mode`、`recommended_order`、可选 `suggested_focus` 或 `active_subchange`。
   - `KEEP_ONE_CHANGE`：创建单一 change 或单一 subchange proposal，再进入 `opsx-plan`。
   - `NEED_EXPLORE_FIRST`：不创建 change，转回 `opsx-explore`。
5. 创建正式 change 时按 `~/.opsx/common/git-lifecycle.md` 执行 branch init 和 metadata 检查。

正式 `proposal.md` 默认使用中文，至少包含：目标、范围内、范围外、依赖、完成标准。

## Reference 导航

- `references/workflow.md`：能力簇识别、cohesion 判定和 group/subchange 落地细节。
- `references/templates.md`：切分报告格式和中文 `proposal.md` 模板要求。
- `~/.opsx/common/git-lifecycle.md`：change branch、Git metadata 和 checkpoint 公共规则。

## 护栏

- 优先按交付价值切，不默认按前端/后端/数据库切。
- 同一用户能力的前后端通常留在同一 change。
- 已发现 2 个以上独立交付单元时，必须创建父 change + subchanges。
- 只是 task 粒度粗，不要误判成多 change。
- 唯一正式 proposal 放在 `subchanges/<name>/proposal.md`。
