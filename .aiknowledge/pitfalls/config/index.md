# Config Pitfalls

配置管理、环境变量、Feature Flag、config 数据同步等踩坑经验。

## 条目

| 条目 | 状态 | 最近复核 | 摘要 |
|------|------|----------|------|
| [migration.ts 作为跨模块 config 同步的粘合层](migration-as-config-glue-layer.md) | active | 2026-04-13 | migration.ts 适合放置跨 global-config 与 profiles 的幂等升级逻辑；内部清理同步静默执行，不输出日志 |
| [门控机制修改时的自举悖论](bootstrap-paradox-in-gating.md) | active | 2026-04-13 | 修改门控机制本身时，变更无法通过自身新增的校验；需"首次豁免"或手动预填 gates |
| [纯指令工作流的门控状态应持久化为结构化字段](gate-state-yaml-not-prose.md) | active | 2026-04-13 | 用 yaml 字段替代文字约束实现门控，使后续环节可程序化校验而非靠 AI 自觉 |
| [知识库三层披露的消费侧缺口](l3-knowledge-consumption-gap.md) | active | 2026-04-13 | L3 详细条目写了但消费侧只读到 L2，需显式要求"L2 命中后继续读 L3" |
| [run-report-data.json 只存判定结果，不存上下文副本](run-report-json-separation-of-concerns.md) | active | 2026-04-14 | run-report-data.json 职责是判定结果（decision/findings/metrics），上下文从权威源（specs/design/tasks）实时读取，packet 文件才是子 agent 输入 |
