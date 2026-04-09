# spec-parser 坑点

## 1. `extractRequirementsSection` 只匹配中文节标题

**现象**：主 spec 用英文 `## Requirements` 节标题时，`extractRequirementsSection` 返回 0 个需求块，归档报"未找到需求"。

**根因**：`requirement-blocks.ts` 第31行正则 `/^##\s+需求\s*$/i` 只匹配 `## 需求`。

**修复**：改为 `/^##\s+(?:需求|Requirements)\s*$/i`（已修复，commit `c57276f`）。

**预防**：写新 spec 时，节标题用 `## 需求` 或 `## Requirements` 均可；若发现归档报"未找到需求 X"，先确认主 spec 的需求节标题格式。

---

## 2. delta spec 的需求描述第一行不能是元数据行

**现象**：delta spec 中需求写法：
```
### 需求:某需求
**Trace**: R1
**Slice**: domain/slice

实际描述 必须 ...
```
归档时 `MarkdownParser.parseRequirements` 取第一个非空行作为 `text`，得到 `**Trace**: R1`，不含 SHALL/MUST，校验失败。

**修复**：把 `**Trace**` / `**Slice**` 移到需求描述文本**之后**，或直接删除（归档到主 spec 后这些元数据不需要保留）。

**正确写法**：
```
### 需求:某需求

实际描述 必须 ...

#### 场景:...
```

---

## 4. ADDED vs MODIFIED delta spec 语言不一致

**现象**：同一变更中，ADDED spec 用中文格式（`### 需求:`、`#### 场景:`），MODIFIED spec 继承主规范的英文格式（`### Requirement:`、`#### Scenario:`）。verify 和 plan-review 解析时需要同时支持两种格式，或者在创建时统一语言。

**根因**：MODIFIED spec 从主规范复制结构时保留了原始语言；ADDED spec 由 AI 生成时使用了项目默认语言（中文）。

**预防**：创建 delta spec 时，无论 ADDED 还是 MODIFIED，统一使用同一语言。如果主规范是英文，MODIFIED 可以在创建时翻译为中文以保持一致性。

---

## 3. 归档幂等性问题

**现象**：归档中途因校验失败中止，部分 spec（如 `opsx-verify-skill`）已写入主 spec，再次归档时对已写入的 spec 报"需求已存在"冲突。

**解决**：在对应 delta spec 目录下删除已成功应用的 spec 文件，只保留尚未应用的，再次归档。
