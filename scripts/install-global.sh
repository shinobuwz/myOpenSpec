#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
AGENTS_SKILLS_HOME="${HOME}/.agents/skills"

mkdir -p "$AGENTS_SKILLS_HOME"

for target_skill_dir in "$AGENTS_SKILLS_HOME"/opsx-*/; do
  [ -d "$target_skill_dir" ] || continue
  skill_name="$(basename "$target_skill_dir")"
  if [ ! -d "$REPO_ROOT/.claude/skills/$skill_name" ]; then
    rm -rf "$target_skill_dir"
  fi
done

for skill_dir in "$REPO_ROOT/.claude/skills"/opsx-*/; do
  [ -d "$skill_dir" ] || continue
  skill_name="$(basename "$skill_dir")"
  rm -rf "$AGENTS_SKILLS_HOME/$skill_name"
  cp -r "${skill_dir%/}" "$AGENTS_SKILLS_HOME/"
done

echo ""
echo "Global installation complete."
echo "Agents skills: $AGENTS_SKILLS_HOME"
