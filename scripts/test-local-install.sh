#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARBALL=""

cleanup() {
  if [[ -n "$TARBALL" ]]; then
    rm -f "$ROOT_DIR/$TARBALL"
  fi
}
trap cleanup EXIT

cd "$ROOT_DIR"

TARBALL="$(npm pack --silent)"
npm install -g "$ROOT_DIR/$TARBALL" >/dev/null

opsx --version
opsx --help >/dev/null
opsx changes --help >/dev/null

echo "Global local tarball install OK: $TARBALL"
