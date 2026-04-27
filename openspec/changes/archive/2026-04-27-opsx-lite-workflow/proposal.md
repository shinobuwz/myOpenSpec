## 为什么

当前 `opsx-ff` 的语义是“一次性生成规划产物并推进强制关卡到实施”，与现有强门控主流程重叠。主流程适合大型功能，但小文档、小 skill 文案、小脚本维护也需要一个低仪式感入口，否则每次都创建完整 OpenSpec change 会显著增加流程成本。

需要将 `opsx-ff` 改造为轻量小改动 workflow：不创建正式 change、不写 proposal/design/spec/tasks/gates，但保留事实留档、知识预加载、验证和升级边界。

## 变更内容

- 将 `opsx-ff` 替换为 `opsx-lite`，定位为轻量小改动工作流。
- `opsx-lite` 使用 `intent → inspect → patch → verify → review → capture → exit` 流程。
- 新增 `.aiknowledge/lite-runs/YYYY-MM/<run-id>.md` 事实留档规范，用于记录小改动实际发生了什么。
- 明确升级规则：一旦命中多模块、新 capability、设计取舍、兼容性风险等，必须转入 `opsx-slice → opsx-plan`。
- 更新 docs、codemap 和 skill 引用，移除 `opsx-ff` 的完整规划链路语义。

## 功能 (Capabilities)

### 新增功能
- `opsx-lite-workflow`: 提供轻量小改动流程和 lite-run 事实留档规范。

### 修改功能
- `openspec-skills`: 将 `opsx-ff` 的角色替换为 `opsx-lite`，并更新工作流拓扑、文档和 skill 清单。

## 影响

- 影响 skill：`skills/opsx-ff/SKILL.md` 将替换为 `skills/opsx-lite/SKILL.md`。
- 影响文档：`README.md`、`docs/workflows.md`、`docs/supported-tools.md`、`docs/concepts.md`。
- 影响长期知识：`.aiknowledge/codemap/openspec-skills.md` 和 `.aiknowledge/logs/2026-04.md`。
- 不改变 `opsx changes` runtime，不把 lite-run 纳入正式 change 状态。
