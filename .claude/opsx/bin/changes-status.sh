#!/usr/bin/env bash
# 列出所有活动变更及其当前阶段和进度

set -euo pipefail

CHANGES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/openspec/changes"

if [ ! -d "$CHANGES_DIR" ]; then
  echo "错误: 找不到 $CHANGES_DIR" >&2
  exit 1
fi

print_change() {
  local dir="$1"
  local name
  name="$(basename "$dir")"

  local has_proposal=false has_design=false has_tasks=false
  [ -f "$dir/proposal.md" ] && has_proposal=true
  [ -f "$dir/design.md" ]   && has_design=true
  [ -f "$dir/tasks.md" ]    && has_tasks=true

  # 阶段
  local stage
  if $has_tasks; then
    stage="tasks"
  elif $has_design; then
    stage="design"
  elif $has_proposal; then
    stage="proposal"
  else
    stage="empty"
  fi

  # 进度（仅 tasks 阶段有意义）
  local progress=""
  if $has_tasks; then
    local total done
    total=$({ grep -E '^\s*- \[' "$dir/tasks.md" 2>/dev/null || true; } | wc -l | tr -d ' ')
    done=$({ grep -E '^\s*- \[x\]' "$dir/tasks.md" 2>/dev/null || true; } | wc -l | tr -d ' ')
    if [ "$total" -gt 0 ]; then
      progress=" ($done/$total)"
    fi
  fi

  printf "  %-40s  [%s]%s\n" "$name" "$stage" "$progress"
}

# 活动变更
active=()
while IFS= read -r -d '' d; do
  [[ "$(basename "$d")" == "archive" ]] && continue
  active+=("$d")
done < <(find "$CHANGES_DIR" -mindepth 1 -maxdepth 1 -type d -not -name "archive" -print0 | sort -z)

if [ ${#active[@]} -eq 0 ]; then
  echo "无活动变更"
else
  echo "活动变更 (${#active[@]}):"
  for d in "${active[@]}"; do
    print_change "$d"
  done
fi
