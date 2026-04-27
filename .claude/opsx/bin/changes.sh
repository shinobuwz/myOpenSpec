#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
HELPER="$REPO_ROOT/runtime/bin/changes.sh"

if [ ! -x "$HELPER" ]; then
  echo "错误: 找不到 OPSX runtime helper: $HELPER" >&2
  exit 1
fi

exec "$HELPER" "$@"
