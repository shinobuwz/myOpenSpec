#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ $# -eq 0 ]; then
  echo "Usage: $0 <target-dir>"
  echo "  Syncs canonical skills/opsx-* to <target-dir>/.claude/skills"
  exit 1
fi

TARGET="$1"
SKILLS_SOURCE="$REPO_ROOT/skills"

if [ ! -d "$SKILLS_SOURCE" ]; then
  echo "✗ skills source not found: $SKILLS_SOURCE" >&2
  exit 1
fi

# Sync Claude adapter skills (each skill is a directory containing SKILL.md)
# First, remove stale skill directories from target that no longer exist in source
mkdir -p "$TARGET/.claude/skills"

# Clean up a legacy macOS copy artifact from older versions of this script.
if [ -f "$TARGET/.claude/skills/SKILL.md" ] && [ ! -f "$SKILLS_SOURCE/SKILL.md" ]; then
  rm -f "$TARGET/.claude/skills/SKILL.md"
fi

for target_skill_dir in "$TARGET/.claude/skills"/opsx-*/; do
  [ -d "$target_skill_dir" ] || continue
  skill_name="$(basename "$target_skill_dir")"
  if [ ! -d "$SKILLS_SOURCE/$skill_name" ]; then
    rm -rf "$target_skill_dir"
  fi
done
# Copy current skills from source to target.
# Remove the existing target directory first so stale files inside a skill do not linger.
# Strip the trailing slash so BSD cp preserves the skill directory name on macOS.
for skill_dir in "$SKILLS_SOURCE"/opsx-*/; do
  skill_name="$(basename "$skill_dir")"
  rm -rf "$TARGET/.claude/skills/$skill_name"
  cp -r "${skill_dir%/}" "$TARGET/.claude/skills/"
done

echo "✓ synced: $TARGET"
