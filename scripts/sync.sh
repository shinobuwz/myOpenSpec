#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ $# -eq 0 ]; then
  echo "Usage: $0 <target-dir>"
  echo "  Syncs .claude/skills/openspec-*.md to <target-dir>/.claude/skills/"
  echo "  Syncs .codex/commands/opsx*.md to <target-dir>/.codex/commands/ (if source exists)"
  exit 1
fi

TARGET="$1"

# Sync Claude skills (each skill is a directory containing SKILL.md)
mkdir -p "$TARGET/.claude/skills"
for skill_dir in "$REPO_ROOT/.claude/skills"/openspec-*/; do
  cp -r "$skill_dir" "$TARGET/.claude/skills/"
done

# Sync Codex commands (optional)
if [ -d "$REPO_ROOT/.codex/commands" ]; then
  mkdir -p "$TARGET/.codex/commands"
  cp "$REPO_ROOT/.codex/commands"/opsx*.md "$TARGET/.codex/commands/" 2>/dev/null || true
fi

echo "✓ synced: $TARGET"
