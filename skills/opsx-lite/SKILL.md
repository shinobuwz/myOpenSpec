---
name: opsx-lite
description: 低风险、范围清晰的小文档、skill 文案、脚本或配置修正使用；不适用于多模块联动、新 capability、兼容性风险或测试策略不明确的变更。
---

执行轻量小改动工作流。目标是在不创建正式 OpenSpec change 的情况下完成低风险小改动，同时留下事实留档和验证结果。

## 定位

`opsx-lite` 是低仪式感维护通道，不是 `opsx-plan` 的快捷别名。

**允许：**
- 单文件或少量文件的文档修正
- skill 文案、README、注释、脚本小修
- 明确、低风险、无需设计取舍的配置调整
- 可以用一组明确命令验证的改动

**禁止：**
- 新增 capability 或用户可见功能
- 多模块联动或跨系统变更
- API、CLI、数据格式、权限、安全、兼容性变更
- 测试策略不明确的改动
- 预计超过 3-5 个文件且无法自然说明边界的改动

命中禁止项时，立即停止 lite，转入 `opsx-slice → opsx-plan`。

## 输入 / 输出边界

**读取：**
- 用户请求
- `.aiknowledge/codemap/index.md` 和命中模块
- `.aiknowledge/pitfalls/index.md` 和命中领域
- 需要修改的目标文件

**写入：**
- 本次小改动涉及的目标文件
- `.aiknowledge/lite-runs/YYYY-MM/<run-id>.md`
- `.aiknowledge/logs/YYYY-MM.md`（如本次维护了长期知识）
- `.aiknowledge/pitfalls/` 或 `.aiknowledge/codemap/`（仅当产生可复用经验或架构认知）

**禁止写入：**
- `openspec/changes/<change>/proposal.md`
- `openspec/changes/<change>/design.md`
- `openspec/changes/<change>/specs/`
- `openspec/changes/<change>/tasks.md`
- `.openspec.yaml` gates

## 流程

### 1. classify

判断请求是否适合 lite。

如果命中任一升级条件：
- 新 capability
- 多模块或多系统联动
- 需要方案对比或设计取舍
- 涉及 API / CLI / 数据格式 / 权限 / 安全 / 兼容性
- 测试策略不明确
- 改动范围已经不再小

输出升级建议，并转入 `opsx-slice → opsx-plan`。不要继续 patch。

### 2. inspect

按 index-first 策略收集最小上下文：

1. 读取 `.aiknowledge/codemap/index.md`。
2. 命中模块时读取对应 codemap；未覆盖且需要架构定位时调用 `opsx-codemap`。
3. 读取 `.aiknowledge/pitfalls/index.md`。
4. 命中领域时读取对应领域 index；需要具体约束时再读取 L3 条目。
5. 读取目标文件。

禁止无边界全局扫描。确需搜索时，用 `rg` 并限制范围。

### 3. patch

直接修改目标文件。

规则：
- 只做本次请求范围内的最小改动。
- 不顺手重构无关代码。
- 如果过程中发现范围扩大，停止并升级正式流程。

### 4. verify

运行最小必要验证：

- 文档/skill 改动：`rg` 引用检查、格式/链接检查（如适用）。
- 脚本/代码改动：相关测试或最小复现命令。
- 包装/发布相关改动：`npm test`、`npm pack --dry-run` 等按风险选择。

验证命令和结果必须写入 lite-run。没有当前轮验证证据时，禁止输出"完成"、"已修复"、"通过"等结论，只能说明"已修改但未验证"并列出待验证命令。

### 5. review

用 `opsx-review` 的 diff 风险维度做轻量自查：
- 是否改动超出请求范围
- 是否破坏兼容性
- 是否存在未验证项
- 是否命中已知 pitfalls
- 是否有 fresh verification evidence 支撑完成声明

如果风险不可接受，修正或升级正式流程。

### 6. capture

创建 lite-run：

`.aiknowledge/lite-runs/YYYY-MM/<run-id>.md`

lite-run 必须记录：
- Intent
- Scope
- Changes
- Verification
- Risks
- Knowledge

如果产生可复用经验，调用 `opsx-knowledge` 并在知识条目 `source_refs` 中引用 `lite-run:<run-id>`。如果更新架构认知，调用 `opsx-codemap`。

### 7. exit

输出简要结果：
- 改了什么
- 验证了什么
- lite-run 路径
- 是否产生 knowledge/codemap 更新
- 是否建议 commit

## Lite-run 模板

```md
---
id: YYYY-MM-DD-short-topic
created_at: YYYY-MM-DDTHH:MM:SSZ
kind: lite
status: done
source_refs:
---

# <short-topic>

## Intent

为什么改。

## Scope

改了哪些文件。

## Changes

实际改了什么。

## Verification

运行了什么命令，结果如何。

## Risks

剩余风险或未验证项。

## Knowledge

是否沉淀到 `.aiknowledge/pitfalls` / `.aiknowledge/codemap`。
```

## 护栏

- lite 是事实执行流，不是规划流。
- lite-run 是事实留档，不是 proposal/design/spec/tasks。
- 不向 `openspec/changes/` 写入任何内容。
- 不创建 gates，不参与 `opsx changes status`。
- 一旦范围扩大，立即升级正式 OpenSpec 流程。
