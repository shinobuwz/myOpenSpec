## 1. 修改 TDD skill —— 实时写入 test-report.md

- [x] 1.1 [R1][R2][R3][R4][U1][direct] 更新 `src/core/templates/workflows/tdd.ts`：在红、绿、重构三个阶段各自的步骤列表末尾，追加"立即将结果写入 test-report.md"的指令；新增 test-report.md 格式规范章节（含文件标题、task 节结构、红/绿/重构子节最小字段集、验收标准覆盖对应表规则）
- [x] 1.2 [R1][R2][R3][R4][U1][direct] 同步更新 `.claude/skills/openspec-tdd/SKILL.md`，使其与 `tdd.ts` 生成内容一致（两处必须同步，否则 `openspec-cn update` 会覆盖手动修改）

## 2. 修改 verify skill —— 新增测试留档完整性检查

- [x] 2.1 [R5][R6][U2][direct] 更新 `src/core/templates/workflows/verify.ts`：在步骤4（并行 subagent）中新增 Subagent D，负责检查 `test-report.md` 完整性；检查逻辑为：tasks.md 含 `[test-first]`/`[characterization-first]` 标签时才触发，否则跳过并注明；缺失或不完整则报 CRITICAL，阻止归档
- [x] 2.2 [R5][R6][U2][direct] 同步更新 `.claude/skills/openspec-verify/SKILL.md`，使其与 `verify.ts` 生成内容一致

<!--
规则：
1. 每个任务至少包含一个 [R<number>] 和一个 [U<number>]，确保 plan ↔ task 可追踪
2. [direct]：修改 skill 文本属于纯自然语言配置，无法单测，不适用 test-first；skill 被执行时的行为验证依赖 verify subagent 的文本检查，而非自动化测试
3. 两个实施单元各对应两个任务（源码 + 安装产物同步），依赖关系：1.2 依赖 1.1，2.2 依赖 2.1
4. 同步方式：SKILL.md 是手工同步（非生成），修改 *.ts 后手动将 instructions 字段内容复制到 SKILL.md 并 diff 校验
5. verify.ts 汇总逻辑：Subagent D 并行新增，task 2.1 需同步修改步骤4结束后的汇总节，将 Subagent D 的 CRITICAL 结论合并进最终报告
-->
