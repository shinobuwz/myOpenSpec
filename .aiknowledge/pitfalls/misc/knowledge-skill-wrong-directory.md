# knowledge skill 将经验写入错误目录

## 现象

调用 `/opsx:knowledge` 写经验时，AI 新建了 `.aiknowledge/pitfalls/douyin-platform/` 目录，
而正确的归类应该是已存在的 `platform/` 目录。同时没有更新 `platform/index.md` 和顶层 `pitfalls/index.md`。

## 根因

AI 看到内容与"抖音平台"相关，倾向于创建更细粒度的子目录（`douyin-platform`），
而没有先检查 `.aiknowledge/pitfalls/` 下的**已有目录列表**，导致：

1. 新建了不该存在的目录
2. 未将条目追加到已有领域的 `index.md`
3. 未更新顶层 `index.md` 的条目数

## 正确做法

写经验前，**必须先 `ls .aiknowledge/pitfalls/`**，确认目标领域目录是否已存在：

- 存在 → 追加到该目录，更新该目录的 `index.md` 条目数，更新顶层 `index.md` 条目数
- 不存在 → 才创建新目录，同时在顶层 `index.md` 新增一行

平台相关的踩坑统一归入 `platform/`，不按平台名（微信/抖音/H5）细分子目录。

## 修复步骤（事后补救）

```bash
# 1. 将文件移到正确目录
cp pitfalls/douyin-platform/xxx.md pitfalls/platform/xxx.md

# 2. 更新 platform/index.md（追加条目行）
# 3. 更新 pitfalls/index.md（条目数 +1）
# 4. 删除错误目录
rm -rf pitfalls/douyin-platform
```

## 教训

**写经验之前先 ls，确认目录是否已存在。** 宁可归入宽泛目录，也不要随意创建细分目录打碎已有结构。
