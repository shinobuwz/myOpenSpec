---
status: active
created_at: 2026-04-29
created_from: change:2026-04-29-opsx-fast-workflow
last_verified_at: 2026-04-29
last_verified_by: opsx-archive
verification_basis: archive
applies_to:
  - skills/*/SKILL.md
source_refs:
  - change:2026-04-29-opsx-fast-workflow
  - review-report:openspec/changes/archive/2026-04-29-opsx-fast-workflow/review-report.md
superseded_by:
merged_from:
deprecated_reason:
---

# SKILL.md frontmatter description 含冒号时必须加引号

**标签**：[opsx, skill, yaml, frontmatter, install-skills]

## 现象

安装或加载 skill 时出现：

```text
invalid YAML: mapping values are not allowed in this context
```

本次触发点是 `opsx-fast` 的 frontmatter：

```yaml
description: ... source_type: lite | bugfix ...
```

`description` 未加引号，YAML 将冒号解析为 mapping 语法，导致整个 skill 被跳过加载。

## 根因

`SKILL.md` frontmatter 是 YAML。自然语言 description 中只要包含未转义的 `:`、尤其是 `key: value` 形态，就可能被 YAML 解析器当成结构字段，而不是普通字符串。

## 修复前

```diff
- description: 统一快速通道；使用 source_type: lite | bugfix 标记需求来源
```

## 修复后

```diff
+ description: "统一快速通道；使用 source_type: lite | bugfix 标记需求来源"
```

并在安装后校验全局 skill：

```bash
ruby -e "require 'yaml'; YAML.load_file('/Users/cc/.agents/skills/opsx-fast/SKILL.md')"
```

## 要点

`SKILL.md` frontmatter 的 `description` 只要包含冒号、竖线、反引号或其他容易干扰 YAML 的字符，就直接使用引号包裹。修改 skill 后必须重新运行 `opsx install-skills`，并至少校验仓库源文件和全局安装文件都能被 YAML 解析。

## 来源

change: 2026-04-29-opsx-fast-workflow
