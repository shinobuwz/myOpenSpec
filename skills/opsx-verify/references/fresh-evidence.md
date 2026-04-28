# Verify Fresh Evidence

`opsx-verify` 的成功结论必须基于当前轮证据。可引用证据包括：

- 实际读取的权威产物：`tasks.md`、`specs/**/*.md`、`design.md`、`test-report.md`
- 实际检查的实现文件或 `git diff`
- 实际运行的验证命令及退出状态
- 人工验收项的已验 / 待验状态

不可单独作为成功依据：

- 历史命令输出
- 主观判断
- reviewer 的口头成功报告
- 未落入 StageResult / audit-log 的临时结论

## Audit 写入

通过时追加：

```md
## verify | <ISO8601 时间戳> | pass
方向：tasks.md + specs/**/*.md + design.md + 代码文件 → 验证通过
修正：无发现
```

或列出当轮已修正问题：

```md
修正：
- <修正项>
```

失败时追加：

```md
## verify | <ISO8601 时间戳> | fail
方向：tasks.md + specs/**/*.md + design.md + 代码文件 → 验证未通过
问题：
- <问题列表>
需修正：
- <需修正内容>
```

通过后写入 `.openspec.yaml` 的 `gates.verify`；失败时不写 gates。
