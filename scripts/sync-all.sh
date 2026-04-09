#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# TODO: 在这里填写你常用的仓库路径（每行一个）
REPOS=(
  # "/Users/cc/MyHarness/YourRepo1"
  # "/Users/cc/MyHarness/YourRepo2"
)

if [ ${#REPOS[@]} -eq 0 ]; then
  echo "⚠ No repos configured. Edit REPOS array in $0"
  exit 1
fi

for REPO in "${REPOS[@]}"; do
  if [ ! -d "$REPO" ]; then
    echo "⚠ skipped: $REPO (not found)"
    continue
  fi
  if "$SCRIPT_DIR/sync.sh" "$REPO"; then
    echo "✓ synced: $REPO"
  else
    echo "✗ failed: $REPO"
  fi
done
