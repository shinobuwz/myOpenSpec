---
name: opsx-lite
description: 低风险、范围清晰的小文档、skill 文案、脚本或配置修正使用；不适用于多模块联动、新 capability、兼容性风险或测试策略不明确的变更。
---

执行轻量小改动工作流。它是低仪式感维护通道，不是 `opsx-plan` 的快捷别名。

## 适用边界

**允许：**
- 单文件或少量文件的文档、skill 文案、README、注释、脚本小修。
- 明确、低风险、无需设计取舍的配置调整。
- 可以用一组明确命令验证的改动。

**必须升级到 `opsx-slice -> opsx-plan`：**
- 新 capability 或用户可见功能。
- 多模块、多系统联动。
- API、CLI、数据格式、权限、安全、兼容性变更。
- 需要方案对比、设计取舍或测试策略不明确。
- 范围已无法自然说明为小改动。

## 输入 / 输出边界

**读取：**
- 用户请求、目标文件
- `.aiknowledge/codemap/index.md` 和命中模块
- `.aiknowledge/pitfalls/index.md` 和命中领域

**写入：**
- 本次小改动涉及的目标文件
- `.aiknowledge/lite-runs/YYYY-MM/<run-id>.md`
- 长期知识相关的 `.aiknowledge/logs/YYYY-MM.md`、pitfalls 或 codemap

**禁止写入：**
- `openspec/changes/<change>/proposal.md`
- `openspec/changes/<change>/design.md`
- `openspec/changes/<change>/specs/`
- `openspec/changes/<change>/tasks.md`
- `.openspec.yaml` gates

## 快速流程

1. classify：确认是低风险小改动；命中升级条件立即停止并转正式流程。
2. inspect：按 index-first 策略读取最小上下文，确需搜索时用 `rg` 限定范围。
3. patch：只改请求范围内目标文件，不顺手重构。
4. verify：运行最小必要验证，必须取得 fresh verification evidence。
5. review：按 diff 风险维度自查是否越界、未验证或破坏兼容。
6. capture：写 `.aiknowledge/lite-runs/YYYY-MM/<run-id>.md`。
7. exit：输出改动、验证、lite-run 路径和是否建议 commit。

没有当前轮验证证据或 fresh verification evidence 时，禁止输出“完成”“已修复”“通过”，只能说明“已修改但未验证”并列出待验证命令。

lite-run 自然语言默认使用中文，并记录：意图、范围、变更、验证、风险、知识沉淀。

## Reference 导航

- `references/workflow.md`：classify/inspect/patch/verify/review/capture/exit 的详细步骤。
- `references/lite-run-template.md`：lite-run 中文模板和字段说明；自然语言默认使用中文。

## 护栏

- lite-run 是事实留档，不是 proposal/design/spec/tasks。
- 不向 `openspec/changes/` 写入任何内容。
- 不创建 gates，不参与 `opsx changes status`。
- 一旦范围扩大，立即升级正式 OpenSpec 流程。
