---
id: 2026-04-28-coverage-na-reason
created_at: 2026-04-28T15:04:59+0800
kind: lite
status: done
source_refs:
  - skills/opsx-tdd/SKILL.md
  - skills/opsx-verify/SKILL.md
---

# 覆盖率 N/A 原因

## 意图

明确 `test-report.md` 的覆盖率记录规则，避免后续报告只写裸 `N/A`，从而隐藏覆盖率是未支持、被阻塞、未启用，还是被静态/人工验证替代。

## 范围

- `skills/opsx-tdd/SKILL.md`
- `skills/opsx-verify/SKILL.md`
- Installed global copies under `/Users/cc/.agents/skills/opsx-tdd/SKILL.md` and `/Users/cc/.agents/skills/opsx-verify/SKILL.md` via `node bin/opsx.mjs install-skills`

## 变更

- 更新 refactor 阶段覆盖率规则：可获取覆盖率时必须记录真实数字和采集命令。
- 覆盖率不可用时，要求写 `N/A（<原因>；补救：<下一步>）`，禁止只写裸 `N/A`。
- 列出必须区分的原因类别：覆盖率未启用、测试命令被阻塞、框架不支持或未配置、仅静态验证、仅人工验收。
- 更新 verify 指引：`test-report.md` 中缺失覆盖率字段或出现裸覆盖率 `N/A` 时，按 critical 的 test-report 不完整处理，而不是静默接受。

## 验证

- `rg -n '覆盖率.*N/A|裸 \`N/A\`|不可用原因|coverage' skills/opsx-tdd/SKILL.md` 确认新文案存在。
- `rg -n '裸 \`N/A\`|缺失覆盖率字段|采集命令|覆盖率字段' skills/opsx-tdd/SKILL.md skills/opsx-verify/SKILL.md` 确认源文件文案存在。
- `node --test tests/*.test.mjs` 通过：30/30 个测试通过。
- `node bin/opsx.mjs install-skills` 将 19 个 OPSX skills 安装到 `/Users/cc/.agents/skills`。
- `rg -n '禁止只写裸 \`N/A\`|补救：<下一步命令|覆盖率字段：禁止裸写' /Users/cc/.agents/skills/opsx-tdd/SKILL.md skills/opsx-tdd/SKILL.md` 确认源文件与已安装 tdd skill 同步。
- `rg -n '覆盖率为裸 \`N/A\`|缺失覆盖率字段|采集命令或产物引用' /Users/cc/.agents/skills/opsx-verify/SKILL.md skills/opsx-verify/SKILL.md` 确认源文件与已安装 verify skill 同步。

## 风险

历史归档的 `test-report.md` 文件保持不变，因为它们是先前运行的事实记录。本修复影响后续 TDD 报告写入。

## 知识沉淀

未新增长期 pitfall 条目。本次是对 canonical `opsx-tdd` skill contract 的直接收紧。
