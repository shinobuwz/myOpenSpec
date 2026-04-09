#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ $# -eq 0 ]; then
  echo "Usage: $0 <target-dir>"
  echo "  Installs OpenSpec skills into <target-dir>"
  echo ""
  echo "Example: $0 ~/my-project"
  exit 1
fi

TARGET="$1"

"$SCRIPT_DIR/sync.sh" "$TARGET"

echo ""
echo "Installation complete."
echo "Tell your AI: /opsx:propose <feature you want to build>"
