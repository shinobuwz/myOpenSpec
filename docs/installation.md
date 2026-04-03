# 安装

## 前置条件

- **Node.js 20.19.0 或更高版本** —— 查看版本：`node --version`

## 本地安装

在当前仓库根目录执行：

```bash
./scripts/install-local.sh
```

该脚本会：

- 安装依赖
- 构建 CLI
- 使用 `npm link` 把 `openspec-cn` 链接到全局命令

## Nix

如果你更偏向 Nix，也可以直接从当前仓库运行：

```bash
nix run . -- init
```

或者安装到 profile：

```bash
nix profile install .
```

或者在其他项目的 `flake.nix` 中通过本地路径引入：

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    openspec.url = "path:/path/to/OpenSpec-cn";
  };

  outputs = { nixpkgs, openspec, ... }: {
    devShells.x86_64-linux.default = nixpkgs.legacyPackages.x86_64-linux.mkShell {
      buildInputs = [ openspec.packages.x86_64-linux.default ];
    };
  };
}
```

## 验证安装

```bash
openspec-cn --version
```

## 下一步

安装完成后，在你的项目中初始化 OpenSpec：

```bash
cd your-project
openspec-cn init
```

完整流程请参见 [快速上手](getting-started.md)。
