#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARBALL=""
NPM_PREFIX=""
SKILLS_HOME=""
COMMON_HOME=""

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
  if [[ -n "$COMMON_HOME" ]]; then
    rm -rf "$COMMON_HOME"
  fi
}
trap cleanup EXIT

cd "$ROOT_DIR"

NPM_PREFIX="$(mktemp -d)"
SKILLS_HOME="$(mktemp -d)"
COMMON_HOME="$(mktemp -d)"
mkdir -p "$SKILLS_HOME/opsx-old" "$SKILLS_HOME/custom-skill"
printf "old\n" > "$SKILLS_HOME/opsx-old/SKILL.md"
printf "custom\n" > "$SKILLS_HOME/custom-skill/SKILL.md"
printf "stale\n" > "$COMMON_HOME/stale.md"

TARBALL="$(npm pack --silent)"
OPSX_AGENTS_SKILLS_HOME="$SKILLS_HOME" OPSX_COMMON_HOME="$COMMON_HOME" \
  npm install -g --prefix "$NPM_PREFIX" "$ROOT_DIR/$TARBALL" >/dev/null

OPSX="$NPM_PREFIX/bin/opsx"
"$OPSX" --version
"$OPSX" --help >/dev/null
"$OPSX" changes --help >/dev/null

test -f "$SKILLS_HOME/opsx-plan/SKILL.md"
test -f "$SKILLS_HOME/opsx-fast/SKILL.md"
test ! -e "$SKILLS_HOME/opsx-old"
test -f "$SKILLS_HOME/custom-skill/SKILL.md"
test -f "$COMMON_HOME/git-lifecycle.md"
test -f "$COMMON_HOME/subagent.md"
test -f "$COMMON_HOME/subagent-lifecycle.md"
test ! -e "$COMMON_HOME/stale.md"

FAST_REPO="$(mktemp -d)"
"$OPSX" fast -p "$FAST_REPO" init demo-fast --source-type bugfix >/dev/null
test -f "$FAST_REPO/openspec/fast/demo-fast/item.md"
test -f "$FAST_REPO/openspec/fast/demo-fast/evidence.md"
test -f "$FAST_REPO/openspec/fast/demo-fast/root-cause.md"
rm -rf "$FAST_REPO"

echo "Global local tarball install OK: $TARBALL"
