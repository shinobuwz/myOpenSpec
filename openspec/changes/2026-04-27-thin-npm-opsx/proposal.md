# Proposal: Thin npm launcher for OPSX runtime

## Why

Current OPSX helper scripts are invoked through repository-relative paths such as `.claude/opsx/bin/changes.sh`, which ties the workflow to the caller's current directory and to a Claude-specific adapter directory. Agents need a stable global entrypoint that can operate on an explicit target project from any working directory, without restoring the previous heavy CLI system.

## What Changes

- Add a minimal npm package entrypoint named `opsx`.
- Route `opsx changes ...` to the existing change helper behavior.
- Add project targeting through `-p/--project`, with cwd discovery only as a fallback.
- Install reusable OPSX skills from the package into the global agent skills directory.
- Initialize project-local OpenSpec state without copying runtime scripts or templates into every repository.
- Update documentation to describe npm/global usage and the thin CLI boundary.

## Capabilities

### New Capabilities

- `thin-npm-launcher`
- `project-target-resolution`
- `global-skill-install`

### Modified Capabilities

- `bootstrap-list`
- `skill-sync`

## Impact

- Adds npm package metadata and a small Node.js launcher.
- Refactors change-helper invocation so project state remains under `<project>/openspec/changes`.
- Keeps `skills/` as source templates in this repository, while global installation becomes the normal runtime path.
- Updates scripts and documentation to avoid treating `.claude/opsx` as the canonical runtime location.
- Does not reintroduce profile, delivery, workflow selection, or interactive CLI systems.

## Slice Decision

### 总判断

- 结论：KEEP_ONE_CHANGE
- 理由：npm entrypoint, project targeting, global skill installation, and documentation are one delivery unit. They are independently taskable but must be verified together through the same user-visible command surface: `opsx`.

### 能力簇

| 簇 | 用户价值 | 主要模块 | 独立交付性 | 备注 |
|----|----------|----------|------------|------|
| Thin launcher | Agents can run OPSX anywhere through one command | `package.json`, launcher script | No | Needs project targeting to be useful |
| Project targeting | A directory can control another repo explicitly | change helper, path resolution | No | Required by launcher |
| Global skills | Templates are installed once per device | install scripts, skill templates | Partial | Useful only after launcher exists |
| Docs and migration | Users know the new boundary | README, docs | Partial | Must match implementation |

### 推荐切分

Single change: `2026-04-27-thin-npm-opsx`

- 范围：thin npm launcher, `-p/--project` support, global skill installation, project initialization, docs.
- 不包含：full CLI workflow engine, profile/delivery configuration, interactive setup, publishing automation beyond local npm/package verification.
- 依赖：current `changes.sh`, `skills/opsx-*`, `openspec/config.yaml`.

### 执行拓扑

- 父 change：none
- execution_mode：serial
- recommended_order：proposal -> specs -> design -> tasks -> implementation
- suggested_focus：not applicable
- 现在应该进入：`opsx-plan 2026-04-27-thin-npm-opsx`
