## 修改需求

### 需求:bootstrap-list 通过读目录获取变更列表
**Trace**: R4
**Slice**: bootstrap-list/directory-read
`openspec-bootstrap.md` 中的变更列表逻辑必须通过 `ls openspec/changes/` 命令直接读取目录，禁止调用 `openspec-cn list --json`。

#### 场景:存在活动变更
- **当** Claude 会话启动时执行 bootstrap 引导序列
- **那么** 使用 `ls openspec/changes/` 列出变更目录，过滤掉 `archive` 子目录

#### 场景:不存在活动变更
- **当** `openspec/changes/` 目录为空或只包含 `archive/`
- **那么** bootstrap 输出"无活动变更"并继续后续步骤
