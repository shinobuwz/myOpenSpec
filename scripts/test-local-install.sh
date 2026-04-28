#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARBALL=""
NPM_PREFIX=""
SKILLS_HOME=""

cleanup() {
  if [[ -n "$TARBALL" ]]; then
    rm -f "$ROOT_DIR/$TARBALL"
  fi
  if [[ -n "$NPM_PREFIX" ]]; then
    rm -rf "$NPM_PREFIX"
  fi
  if [[ -n "$SKILLS_HOME" ]]; then
    rm -rf "$SKILLS_HOME"
  fi
}
trap cleanup EXIT

cd "$ROOT_DIR"

NPM_PREFIX="$(mktemp -d)"
SKILLS_HOME="$(mktemp -d)"
mkdir -p "$SKILLS_HOME/opsx-old" "$SKILLS_HOME/custom-skill"
printf "old\n" > "$SKILLS_HOME/opsx-old/SKILL.md"
printf "custom\n" > "$SKILLS_HOME/custom-skill/SKILL.md"

TARBALL="$(npm pack --silent)"
npm install -g --prefix "$NPM_PREFIX" "$ROOT_DIR/$TARBALL" >/dev/null

OPSX="$NPM_PREFIX/bin/opsx"
"$OPSX" --version
"$OPSX" --help >/dev/null
"$OPSX" changes --help >/dev/null
OPSX_AGENTS_SKILLS_HOME="$SKILLS_HOME" "$OPSX" install-skills >/dev/null

test -f "$SKILLS_HOME/opsx-plan/SKILL.md"
test -f "$SKILLS_HOME/opsx-lite/SKILL.md"
test ! -e "$SKILLS_HOME/opsx-old"
test -f "$SKILLS_HOME/custom-skill/SKILL.md"

echo "Global local tarball install OK: $TARBALL"
