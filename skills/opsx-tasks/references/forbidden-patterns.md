# Tasks Forbidden Patterns

出现以下情况时必须重写 task：

| 禁止 | 原因 |
|------|------|
| Task N: "编写单元测试" / "添加测试" | 测试不是独立 task |
| Task N `[direct]` 涉及函数逻辑 | 应改为 `[test-first]` |
| task 标题行包含 `[R1]` / `[U1]` | 追踪信息只写在 `需求追踪` 字段 |
| task 没有 `需求追踪` | 无法做 plan ↔ task 一致性检查 |
| task 没有 `涉及文件` | 无法验证实现边界 |
| task 没有验收标准 | 无法判断完成 |
| task 没有 `验证命令 / 方法` | 无 fresh evidence 来源 |
| `[test-first]` task 的涉及文件里没有测试文件 | 缺失测试路径 |
| 同一 task 混合 `[test-first]` 和 `[characterization-first]` | 必须拆为两个不同性质的 task |
| 验收标准写"处理边界情况"、"适当验证"、"完善逻辑"、"保持兼容" | 不可执行、不可验证 |
| 一个 task 同时修改多个互不依赖的行为 | 不是 bite-sized，必须拆分 |
