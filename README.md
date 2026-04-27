# OPSX

Thin global launcher for my local OpenSpec/OPSX workflow.

This package intentionally stays small. It provides a global `opsx` command, installs OPSX skills into the agent skills directory, and keeps project state inside each target repository's `openspec/` directory.

It does not recreate the old full OpenSpec CLI, profile system, workflow selector, or interactive setup.

## Install

```bash
npm install -g @shinobuwz/opsx
opsx install-skills
```

Initialize a project:

```bash
opsx init-project -p /path/to/repo
opsx changes -p /path/to/repo list
```

After that, tell the agent to use the relevant skill, for example:

```text
请使用 opsx-slice 判断是否需要拆分 change
请使用 opsx-plan 创建一个新变更
请使用 opsx-continue 恢复当前 change
```

## Commands

```bash
opsx --help
opsx changes -p /path/to/repo list
opsx changes -p /path/to/repo init 2026-04-27-add-feature spec-driven
opsx changes -p /path/to/repo resolve 2026-04-27-add-feature
opsx install-skills
opsx init-project -p /path/to/repo
```

`-p/--project` can point to a repo root, a subdirectory, or a file inside the repo. OPSX resolves it to the nearest OpenSpec project root.

## Project Layout

Projects keep only workflow state:

```text
openspec/
  config.yaml
  changes/
```

Runtime scripts and skill templates are distributed by the npm package. They are not copied into every target repository.

## Development

```bash
npm test
npm pack --dry-run
npm run install:local
node bin/opsx.mjs changes -p . list
```

`npm run install:local` packs the current checkout and installs that tarball into the local global npm prefix, replacing any previously installed `opsx`.

From a source checkout, install current skills globally:

```bash
./scripts/install-global.sh
```

Sync project-level skill adapters only when a tool cannot read global skills:

```bash
./scripts/install-repos.sh /path/to/repo
```

## License

MIT
