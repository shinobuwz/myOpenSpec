#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

node "$REPO_ROOT/bin/opsx.mjs" install-skills

echo ""
echo "Global installation complete."
echo "Agents skills: ${OPSX_AGENTS_SKILLS_HOME:-$HOME/.agents/skills}"
echo "OPSX common: ${OPSX_COMMON_HOME:-$HOME/.opsx/common}"
