# Test Report

## Characterization

替换前 active 引用：

```text
.aiknowledge/codemap/openspec-skills.md: opsx-ff
docs/supported-tools.md: opsx-ff
docs/concepts.md: opsx-ff
docs/workflows.md: opsx-ff
skills/opsx-explore/SKILL.md: opsx-ff
skills/opsx-ff/SKILL.md
```

## Verification

### Active 旧引用检查

```bash
rg -n "opsx-ff|plan / ff|一次性推进完整规划|/opsx-ff" README.md docs skills .aiknowledge/codemap .aiknowledge/README.md .aiknowledge/lite-runs/README.md
```

结果：通过。无 active 命中。

### 新引用检查

```bash
rg -n "opsx-lite|lite-runs|lite-run" README.md docs skills .aiknowledge/codemap .aiknowledge/README.md .aiknowledge/lite-runs/README.md
```

结果：通过。命中新 skill、docs、codemap 和 `.aiknowledge`。

### Skill 数量检查

```bash
find skills -maxdepth 2 -name SKILL.md | sort | wc -l
```

结果：通过。18 个 skill。

### 仓库测试

```bash
npm test
```

结果：通过。16 tests, 16 pass, 0 fail。
