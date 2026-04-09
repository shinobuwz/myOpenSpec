#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ $# -eq 0 ]; then
  echo "Usage: $0 <target-dir>"
  echo "  Syncs .claude/skills/opsx-* to <target-dir>/.claude/skills/"
  exit 1
fi

TARGET="$1"

# Sync Claude skills (each skill is a directory containing SKILL.md)
# First, remove stale skill directories from target that no longer exist in source
mkdir -p "$TARGET/.claude/skills"
for target_skill_dir in "$TARGET/.claude/skills"/opsx-*/; do
  [ -d "$target_skill_dir" ] || continue
  skill_name="$(basename "$target_skill_dir")"
  if [ ! -d "$REPO_ROOT/.claude/skills/$skill_name" ]; then
    rm -rf "$target_skill_dir"
  fi
done
# Copy current skills from source to target
for skill_dir in "$REPO_ROOT/.claude/skills"/opsx-*/; do
  cp -r "$skill_dir" "$TARGET/.claude/skills/"
done

# Sync .claude/bin (helper scripts for skills)
if [ -d "$REPO_ROOT/.claude/bin" ]; then
  mkdir -p "$TARGET/.claude/bin"
  cp "$REPO_ROOT/.claude/bin"/* "$TARGET/.claude/bin/" 2>/dev/null || true
  chmod +x "$TARGET/.claude/bin"/* 2>/dev/null || true
fi

# Sync Codex commands (optional)
echo "✓ synced: $TARGET"
