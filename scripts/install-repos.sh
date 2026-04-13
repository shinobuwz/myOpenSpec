#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ $# -eq 0 ]; then
  echo "Usage: $0 <repo-dir> [repo-dir ...]"
  echo "  Installs OpenSpec into each repository root in the list"
  echo ""
  echo "Example:"
  echo "  $0 ~/repo-a ~/repo-b"
  exit 1
fi

FAILED=0

for REPO in "$@"; do
  if [ ! -d "$REPO" ]; then
    echo "⚠ skipped: $REPO (not found)"
    FAILED=1
    continue
  fi

  if ! "$SCRIPT_DIR/sync.sh" "$REPO"; then
    echo "✗ failed: $REPO"
    FAILED=1
  fi
done

if [ "$FAILED" -ne 0 ]; then
  exit 1
fi

echo ""
echo "Installation complete."
echo "Tell your AI: use opsx-plan for <feature you want to build>"
