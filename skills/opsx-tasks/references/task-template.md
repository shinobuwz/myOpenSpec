# Tasks Template

`tasks.md` 使用以下结构。任务标题行只保留执行方式标签，R/U 信息只写在 `需求追踪` 字段，避免重复不一致。

```md
## Task N：<动词开头的描述>

**需求追踪**：[R1] → [U1]
**执行方式**：[test-first | characterization-first | direct]
**涉及文件**：
- `src/...` — 实现
- `tests/...` — 测试（test-first/characterization-first 必填）

**验收标准**：
- [ ] <具体可验证的标准 1>
- [ ] [manual] <需要人工验证的标准，说明验证方法>
- [ ] <具体可验证的标准 2>

**验证命令 / 方法**：
- `<command>`，预期：<通过条件>

**依赖**：Task M（如有）
```

## 测试框架探测

生成 tasks 前必须确认测试框架状态：

```bash
ls package.json pyproject.toml CMakeLists.txt build.gradle 2>/dev/null
cat package.json 2>/dev/null | grep -E '"test"|"vitest"|"jest"'
ls src/**/*.test.* tests/ test/ __tests__/ 2>/dev/null | head -5
```

| 发现 | 结论 |
|------|------|
| 有测试文件 + 测试命令 | 测试框架就绪，直接使用 |
| 有 package.json 但无测试配置 | 在第一个 `[test-first]` task 前添加 Task 0: 配置测试框架 `[direct]` |
| 完全无测试基础设施 | 添加 Task 0: 搭建测试框架 `[direct]`，验收标准是跑通一个空测试 |

## `[manual]`

无法自动化验证的验收标准标注 `[manual]`，并附验证方法。`[manual]` 不改变 task 的 TDD 标签选择。
