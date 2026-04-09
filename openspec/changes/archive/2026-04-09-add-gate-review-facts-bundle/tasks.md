## 1. gateReview facts bundle 数据层

- [x] 1.1 [R1][U1][test-first] 在 `shared.ts` 中定义 `GateReviewFacts` 类型接口（包含 artifactState、changeLocalContext、taskSummary 字段）
- [x] 1.2 [R1][U1][test-first] 实现 `buildGateReviewFacts()` 函数：读取 change 产出物状态并组装最小事实字段
- [x] 1.3 [R1][U1][test-first] 在 `buildGateReviewFacts()` 中支持读取 `context/knowledge-refs.md`、`context/review-scope.md`、`context/artifact-index.md`（存在时纳入，缺失时优雅降级）
- [x] 1.4 [R1][U1][direct] 确保 `buildGateReviewFacts()` 中文件路径使用 `path.join()` 而非硬编码斜杠

## 2. Apply Instructions JSON 输出集成

- [x] 2.1 [R1][R5][U1][test-first] 在 `instructions.ts` 的 apply JSON 输出中添加 `gateReview` 字段，调用 `buildGateReviewFacts()`
- [x] 2.2 [R1][U1][test-first] 测试：当 context 文件存在时，`gateReview` 包含声明性 context 事实
- [x] 2.3 [R1][U1][test-first] 测试：当 context 文件缺失时，`gateReview` 仍返回稳定结构（优雅降级）
- [x] 2.4 [R1][U1][test-first] 测试：`gateReview` 不包含 findings、severity 或 fix recommendations

## 3. plan-review blind facts 消费模式

- [x] 3.1 [R2][U2][direct] 更新 `plan-review.ts` 模板：要求 reviewer 先读取 `gateReview` facts bundle 作为事实底座
- [x] 3.2 [R2][U2][direct] 在 `plan-review.ts` 模板中声明可见/不可见信息边界（facts 可见，其他 reviewer 结论不可见）

## 4. verify blind reviewers 与可选 arbiter

- [x] 4.1 [R3][R5][U3][direct] 更新 `verify.ts` 模板：要求 A/B/C/D reviewers 共享同一 facts bundle
- [x] 4.2 [R3][R5][U3][direct] 在 `verify.ts` 模板中声明 reviewer 间 blind 规则（不得读取其他 reviewer 的 findings）
- [x] 4.3 [R4][U3][direct] 在 `verify.ts` 模板中添加 arbiter 触发条件：仅在 existence/severity/intent conflict 时触发
- [x] 4.4 [R4][R6][U3][direct] 在 `verify.ts` 模板中限定 arbiter 范围：只聚焦冲突点与证据，不退化为全量 verify

## 5. 跨平台验证

- [x] 5.1 [R1][U1][direct] 确认所有新增测试中路径断言使用 `path.join()` 而非硬编码字符串
