#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is required but was not found in PATH."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required but was not found in PATH."
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "Error: pnpm is required but was not found in PATH."
  exit 1
fi

cd "$ROOT_DIR"

echo "Installing dependencies..."
pnpm install

echo "Building OpenSpec..."
pnpm run build

echo "Linking openspec-cn globally with npm link..."
npm link

echo
echo "Local install complete."
echo "Try: openspec-cn --version"
