# Archive Routing

## 归档目录

先创建顶层 archive 目录：

```bash
mkdir -p openspec/changes/archive
```

计算 slug：

- 单个 change：resolved root 为 `openspec/changes/<change>`，`<archive-slug>=<change>`。
- subchange：resolved root 为 `openspec/changes/<group>/subchanges/<subchange>`，`<archive-slug>=<group>-<subchange>`。

计算目录：

- 如果 `<archive-slug>` 已经以 `YYYY-MM-DD-` 开头，则 `<archive-dir>=<archive-slug>`。
- 否则 `<archive-dir>=<today>-<archive-slug>`。

这防止 `2026-04-27-demo` 被归档成 `2026-04-27-2026-04-27-demo`。

目标路径：

```text
openspec/changes/archive/<archive-dir>/
```

目标已存在时失败，不覆盖。

## 移动

```bash
mv <resolved-change-root> openspec/changes/archive/<archive-dir>
```

subchange 必须移动 resolved subchange root，不能移动父 group。

## 父 group 清理

如果归档的是 subchange：

1. 扫描父 group `subchanges/` 剩余目录。
2. 仍有剩余 subchange：
   - `active_subchange` 和 `suggested_focus` 指向下一个有效 subchange。
   - `recommended_order` 收敛为仍存在的 subchange 列表，保留原顺序；原顺序失效时按目录排序回填。
   - 删除父 group 根目录下除 `.openspec.group.yaml` 与 `subchanges/` 外的文件和空目录。
3. 没有剩余 subchange：
   - 删除整个父 group 目录。
   - 不创建父 group 归档目录。

禁止创建 `openspec/changes/<group>/subchanges/archive/`。
