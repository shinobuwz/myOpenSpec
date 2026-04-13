#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_HOME="${HOME}/.claude"
CODEX_HOME="${HOME}/.codex"

ensure_symlink() {
  local source_path="$1"
  local link_path="$2"

  if [ -e "$link_path" ] && [ ! -L "$link_path" ]; then
    echo "✗ refused to replace existing path: $link_path"
    exit 1
  fi

  ln -sfn "$source_path" "$link_path"
  echo "✓ linked: $link_path -> $source_path"
}

"$SCRIPT_DIR/sync.sh" "$HOME"

mkdir -p "$CODEX_HOME"

ensure_symlink "$CLAUDE_HOME/skills" "$CODEX_HOME/skills"
ensure_symlink "$CLAUDE_HOME/opsx" "$CODEX_HOME/opsx"

echo ""
echo "Global installation complete."
echo "Claude home: $CLAUDE_HOME"
echo "Codex home:  $CODEX_HOME"
