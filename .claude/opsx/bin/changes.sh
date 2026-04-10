#!/usr/bin/env bash
# 统一处理 OpenSpec change 的常用本地操作：
# - 默认 / list / status: 列出活动变更及其阶段和进度
# - init <name> [schema]: 初始化变更目录和 .openspec.yaml

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
CHANGES_DIR="$REPO_ROOT/openspec/changes"
SCHEMAS_DIR="$REPO_ROOT/.claude/opsx/schemas"

usage() {
  cat <<'EOF'
用法:
  bash .claude/opsx/bin/changes.sh
  bash .claude/opsx/bin/changes.sh list
  bash .claude/opsx/bin/changes.sh status
  bash .claude/opsx/bin/changes.sh init <change-name> [schema]

说明:
  list/status         列出活动变更及其阶段和进度
  init                创建 openspec/changes/<name>/specs 和 .openspec.yaml
EOF
}

ensure_changes_dir() {
  mkdir -p "$CHANGES_DIR"
}

schema_exists() {
  local schema="$1"
  [ -f "$SCHEMAS_DIR/$schema/schema.yaml" ]
}

print_change() {
  local dir="$1"
  local name
  name="$(basename "$dir")"

  local has_proposal=false has_design=false has_tasks=false
  [ -f "$dir/proposal.md" ] && has_proposal=true
  [ -f "$dir/design.md" ] && has_design=true
  [ -f "$dir/tasks.md" ] && has_tasks=true

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

list_changes() {
  if [ ! -d "$CHANGES_DIR" ]; then
    echo "无活动变更"
    return 0
  fi

  local active=()
  while IFS= read -r -d '' d; do
    [[ "$(basename "$d")" == "archive" ]] && continue
    active+=("$d")
  done < <(find "$CHANGES_DIR" -mindepth 1 -maxdepth 1 -type d -not -name "archive" -print0 | sort -z)

  if [ ${#active[@]} -eq 0 ]; then
    echo "无活动变更"
    return 0
  fi

  echo "活动变更 (${#active[@]}):"
  for d in "${active[@]}"; do
    print_change "$d"
  done
}

init_change() {
  local name="${1:-}"
  local schema="${2:-spec-driven}"

  if [ -z "$name" ]; then
    echo "错误: init 需要 change 名称" >&2
    usage >&2
    exit 1
  fi

  if [[ "$name" == "archive" ]]; then
    echo "错误: archive 是保留目录名，不能用作 change 名称" >&2
    exit 1
  fi

  if ! schema_exists "$schema"; then
    echo "错误: 找不到 schema '$schema' ($SCHEMAS_DIR/$schema/schema.yaml)" >&2
    exit 1
  fi

  ensure_changes_dir

  local change_dir="$CHANGES_DIR/$name"
  local meta_file="$change_dir/.openspec.yaml"
  local created
  created="$(date +%F)"

  mkdir -p "$change_dir/specs"

  if [ ! -f "$meta_file" ]; then
    printf "schema: %s\ncreated: %s\n" "$schema" "$created" > "$meta_file"
    echo "已初始化变更: openspec/changes/$name"
  else
    echo "变更已存在: openspec/changes/$name"
  fi

  echo "schema: $schema"
}

command="${1:-list}"

case "$command" in
  list|status)
    list_changes
    ;;
  init)
    shift
    init_change "${1:-}" "${2:-spec-driven}"
    ;;
  -h|--help|help)
    usage
    ;;
  *)
    echo "错误: 未知命令 '$command'" >&2
    usage >&2
    exit 1
    ;;
esac
