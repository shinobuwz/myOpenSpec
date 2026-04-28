#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNTIME_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

PROJECT_ROOT="${OPSX_PROJECT_ROOT:-}"
ARGS=()

while [ $# -gt 0 ]; do
  case "$1" in
    -p|--project)
      if [ $# -lt 2 ]; then
        echo "错误: $1 需要项目路径" >&2
        exit 1
      fi
      PROJECT_ROOT="$2"
      shift 2
      ;;
    *)
      ARGS+=("$1")
      shift
      ;;
  esac
done

set -- "${ARGS[@]}"

usage() {
  cat <<'EOF'
用法:
  opsx changes [-p <project>] list
  opsx changes [-p <project>] status
  opsx changes [-p <project>] init <change-name> [schema]
  opsx changes [-p <project>] init-group <group-name>
  opsx changes [-p <project>] init-subchange <group-name> <subchange-name> [schema]
  opsx changes [-p <project>] set-active <group-name> <subchange-name>
  opsx changes [-p <project>] set-suggested <group-name> <subchange-name>
  opsx changes [-p <project>] set-mode <group-name> <serial|parallel|mixed>
  opsx changes [-p <project>] set-order <group-name> <sub1,sub2,...>
  opsx changes [-p <project>] resolve <change-name|group-name|group/subchange>
EOF
}

abs_existing_dir() {
  local input="$1"
  if [ ! -e "$input" ]; then
    echo "错误: 项目路径不存在: $input" >&2
    exit 1
  fi

  if [ -f "$input" ]; then
    input="$(dirname "$input")"
  fi

  (cd "$input" && pwd -P)
}

find_project_root() {
  local dir="$1"
  while true; do
    if [ -f "$dir/openspec/config.yaml" ] || [ -d "$dir/openspec/changes" ]; then
      printf "%s\n" "$dir"
      return 0
    fi

    local parent
    parent="$(dirname "$dir")"
    if [ "$parent" = "$dir" ]; then
      printf "%s\n" "$1"
      return 0
    fi
    dir="$parent"
  done
}

if [ -z "$PROJECT_ROOT" ]; then
  PROJECT_ROOT="$PWD"
fi

PROJECT_ROOT="$(find_project_root "$(abs_existing_dir "$PROJECT_ROOT")")"
CHANGES_DIR="$PROJECT_ROOT/openspec/changes"
SCHEMAS_DIR="$RUNTIME_DIR/schemas"

if [ ! -d "$SCHEMAS_DIR" ] && [ -d "$PROJECT_ROOT/.claude/opsx/schemas" ]; then
  SCHEMAS_DIR="$PROJECT_ROOT/.claude/opsx/schemas"
fi

if [ ! -d "$SCHEMAS_DIR" ] && [ -d "$HOME/.claude/opsx/schemas" ]; then
  SCHEMAS_DIR="$HOME/.claude/opsx/schemas"
fi

ensure_changes_dir() {
  mkdir -p "$CHANGES_DIR"
}

schema_exists() {
  local schema="$1"
  [ -f "$SCHEMAS_DIR/$schema/schema.yaml" ]
}

is_safe_component() {
  local value="$1"
  [ -n "$value" ] || return 1
  [[ "$value" != "." ]] || return 1
  [[ "$value" != ".." ]] || return 1
  [[ "$value" != .* ]] || return 1
  [[ "$value" != */* ]] || return 1
  [[ "$value" != *".."* ]] || return 1
}

validate_component() {
  local kind="$1"
  local value="$2"
  if ! is_safe_component "$value"; then
    echo "错误: $kind 名称不合法: $value" >&2
    exit 1
  fi
  if [ "$value" = "archive" ]; then
    echo "错误: archive 是保留目录名，不能用作 $kind 名称" >&2
    exit 1
  fi
}

is_group_dir() {
  local dir="$1"
  [ -f "$dir/.openspec.group.yaml" ]
}

read_group_field() {
  local file="$1"
  local key="$2"
  awk -F': ' -v key="$key" '$1 == key { print $2 }' "$file" 2>/dev/null | tail -n 1
}

write_group_field() {
  local file="$1"
  local key="$2"
  local value="$3"
  local tmp
  tmp="$(mktemp)"
  if grep -q "^$key:" "$file" 2>/dev/null; then
    awk -F': ' -v key="$key" -v value="$value" '
      $1 == key { print key ": " value; next }
      { print }
    ' "$file" > "$tmp"
  else
    cp "$file" "$tmp"
    printf "%s: %s\n" "$key" "$value" >> "$tmp"
  fi
  mv "$tmp" "$file"
}

normalize_group_value() {
  local value="${1:-}"
  if [ "$value" = "-" ]; then
    printf "\n"
  else
    printf "%s\n" "$value"
  fi
}

subchange_exists() {
  local group_dir="$1"
  local subchange_name="$2"
  [ -f "$group_dir/subchanges/$subchange_name/.openspec.yaml" ]
}

count_subchanges() {
  local group_dir="$1"
  if [ ! -d "$group_dir/subchanges" ]; then
    echo 0
    return 0
  fi
  find "$group_dir/subchanges" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' '
}

first_subchange() {
  local group_dir="$1"
  if [ ! -d "$group_dir/subchanges" ]; then
    return 1
  fi
  find "$group_dir/subchanges" -mindepth 1 -maxdepth 1 -type d -print | sort | head -n 1 | xargs -n 1 basename
}

first_recommended_subchange() {
  local file="$1"
  local order
  order="$(read_group_field "$file" "recommended_order")"
  if [ -z "$order" ]; then
    return 1
  fi
  printf "%s\n" "$order" | cut -d',' -f1 | tr -d ' '
}

resolve_target_dir() {
  local target="$1"
  local candidate=""

  if [[ "$target" == *".."* ]] || [[ "$target" == /* ]]; then
    echo "错误: change 标识不合法: $target" >&2
    return 1
  fi

  if [[ "$target" == */* ]]; then
    local group="${target%%/*}"
    local subchange="${target#*/}"
    candidate="$CHANGES_DIR/$group/subchanges/$subchange"
    [ -f "$candidate/.openspec.yaml" ] && {
      (cd "$candidate" && pwd -P)
      return 0
    }
  fi

  candidate="$CHANGES_DIR/$target"
  if [ -f "$candidate/.openspec.yaml" ]; then
    (cd "$candidate" && pwd -P)
    return 0
  fi

  if is_group_dir "$candidate"; then
    local group_meta="$candidate/.openspec.group.yaml"
    local active_subchange
    active_subchange="$(read_group_field "$group_meta" "active_subchange")"

    if [ -n "$active_subchange" ] && subchange_exists "$candidate" "$active_subchange"; then
      (cd "$candidate/subchanges/$active_subchange" && pwd -P)
      return 0
    fi

    local suggested_focus
    suggested_focus="$(read_group_field "$group_meta" "suggested_focus")"
    if [ -n "$suggested_focus" ] && subchange_exists "$candidate" "$suggested_focus"; then
      (cd "$candidate/subchanges/$suggested_focus" && pwd -P)
      return 0
    fi

    local order_first=""
    order_first="$(first_recommended_subchange "$group_meta" || true)"
    if [ -n "$order_first" ] && subchange_exists "$candidate" "$order_first"; then
      (cd "$candidate/subchanges/$order_first" && pwd -P)
      return 0
    fi

    local sub_count
    sub_count="$(count_subchanges "$candidate")"
    if [ "$sub_count" = "1" ]; then
      local only_subchange
      only_subchange="$(first_subchange "$candidate")"
      (cd "$candidate/subchanges/$only_subchange" && pwd -P)
      return 0
    fi

    echo "错误: 父 change '$target' 没有唯一可解析的 subchange" >&2
    return 1
  fi

  echo "错误: 找不到 change '$target'" >&2
  return 1
}

change_stage_summary() {
  local dir="$1"
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
    total=$({ grep -E '^\s*- \[[ x]\] [0-9]+[.][0-9]+' "$dir/tasks.md" 2>/dev/null || true; } | wc -l | tr -d ' ')
    done=$({ grep -E '^\s*- \[x\] [0-9]+[.][0-9]+' "$dir/tasks.md" 2>/dev/null || true; } | wc -l | tr -d ' ')
    if [ "$total" -gt 0 ]; then
      progress=" ($done/$total)"
    fi
  fi

  printf "%s%s\n" "$stage" "$progress"
}

change_stage_name() {
  local dir="$1"
  if [ -f "$dir/tasks.md" ]; then
    echo "tasks"
  elif [ -f "$dir/design.md" ]; then
    echo "design"
  elif [ -f "$dir/proposal.md" ]; then
    echo "proposal"
  else
    echo "empty"
  fi
}

task_progress() {
  local dir="$1"
  if [ ! -f "$dir/tasks.md" ]; then
    echo "-"
    return 0
  fi

  local total done
  total=$({ grep -E '^\s*- \[[ x]\] [0-9]+[.][0-9]+' "$dir/tasks.md" 2>/dev/null || true; } | wc -l | tr -d ' ')
  done=$({ grep -E '^\s*- \[x\] [0-9]+[.][0-9]+' "$dir/tasks.md" 2>/dev/null || true; } | wc -l | tr -d ' ')
  if [ "$total" -gt 0 ]; then
    printf "%s/%s\n" "$done" "$total"
  else
    echo "-"
  fi
}

gate_value() {
  local dir="$1"
  local key="$2"
  local file="$dir/.openspec.yaml"
  if [ ! -f "$file" ]; then
    echo "missing"
    return 0
  fi

  local value
  value="$(awk -v key="$key" '
    {
      line = $0
      sub(/^[[:space:]]*/, "", line)
      split(line, parts, ":")
      if (parts[1] == key) {
        sub(/^[^:]+:[[:space:]]*/, "", line)
        gsub(/^"/, "", line)
        gsub(/"$/, "", line)
        print line
        exit
      }
    }
  ' "$file")"

  if [ -n "$value" ]; then
    printf "%s\n" "$value"
  else
    echo "missing"
  fi
}

has_specs() {
  local dir="$1"
  [ -d "$dir/specs" ] && find "$dir/specs" -type f -name "*.md" -print -quit | grep -q .
}

yes_no_file() {
  local file="$1"
  if [ -f "$file" ]; then
    echo "yes"
  else
    echo "no"
  fi
}

next_step() {
  local dir="$1"
  if [ ! -f "$dir/proposal.md" ]; then
    echo "opsx-slice"
  elif [ ! -f "$dir/design.md" ] || ! has_specs "$dir"; then
    echo "opsx-plan"
  elif [ "$(gate_value "$dir" "plan-review")" = "missing" ]; then
    echo "opsx-plan-review"
  elif [ ! -f "$dir/tasks.md" ]; then
    echo "opsx-tasks"
  elif [ "$(gate_value "$dir" "task-analyze")" = "missing" ]; then
    echo "opsx-task-analyze"
  elif [ "$(gate_value "$dir" "verify")" = "missing" ]; then
    echo "opsx-verify"
  elif [ "$(gate_value "$dir" "review")" = "missing" ]; then
    echo "opsx-review"
  else
    echo "opsx-archive"
  fi
}

print_change() {
  local dir="$1"
  local name
  name="$(basename "$dir")"
  printf "  %-40s  [%s]\n" "$name" "$(change_stage_summary "$dir")"
}

print_group() {
  local dir="$1"
  local name
  name="$(basename "$dir")"
  local meta_file="$dir/.openspec.group.yaml"
  local active_subchange suggested_focus execution_mode recommended_order
  active_subchange="$(read_group_field "$meta_file" "active_subchange")"
  suggested_focus="$(read_group_field "$meta_file" "suggested_focus")"
  execution_mode="$(read_group_field "$meta_file" "execution_mode")"
  recommended_order="$(read_group_field "$meta_file" "recommended_order")"

  local count=0
  if [ -d "$dir/subchanges" ]; then
    count=$(find "$dir/subchanges" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')
  fi

  if [ -n "$active_subchange" ] && [ -d "$dir/subchanges/$active_subchange" ]; then
    printf "  %-40s  [group mode=%s suggested=%s active=%s stage=%s subchanges=%s]\n" "$name" "${execution_mode:--}" "${suggested_focus:--}" "$active_subchange" "$(change_stage_summary "$dir/subchanges/$active_subchange")" "$count"
  else
    printf "  %-40s  [group mode=%s suggested=%s active=- order=%s subchanges=%s]\n" "$name" "${execution_mode:--}" "${suggested_focus:--}" "${recommended_order:--}" "$count"
  fi

  if [ -d "$dir/subchanges" ]; then
    local subdir
    while IFS= read -r -d '' subdir; do
      printf "    - %-36s  [%s]\n" "$(basename "$subdir")" "$(change_stage_summary "$subdir")"
    done < <(find "$dir/subchanges" -mindepth 1 -maxdepth 1 -type d -print0 | sort -z)
  fi
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
    if is_group_dir "$d"; then
      print_group "$d"
    else
      print_change "$d"
    fi
  done
}

print_status_change() {
  local dir="$1"
  local indent="${2:-}"
  local name
  name="$(basename "$dir")"

  printf "%sChange: %s\n" "$indent" "$name"
  printf "%s  Stage: %s\n" "$indent" "$(change_stage_name "$dir")"
  printf "%s  Tasks: %s\n" "$indent" "$(task_progress "$dir")"
  printf "%s  Gates:\n" "$indent"
  printf "%s    plan-review:  %s\n" "$indent" "$(gate_value "$dir" "plan-review")"
  printf "%s    task-analyze: %s\n" "$indent" "$(gate_value "$dir" "task-analyze")"
  printf "%s    verify:       %s\n" "$indent" "$(gate_value "$dir" "verify")"
  printf "%s    review:       %s\n" "$indent" "$(gate_value "$dir" "review")"
  printf "%s  Reports:\n" "$indent"
  printf "%s    audit-log.md:     %s\n" "$indent" "$(yes_no_file "$dir/audit-log.md")"
  printf "%s    test-report.md:   %s\n" "$indent" "$(yes_no_file "$dir/test-report.md")"
  printf "%s    review-report.md: %s\n" "$indent" "$(yes_no_file "$dir/review-report.md")"
  printf "%s  Next: %s\n" "$indent" "$(next_step "$dir")"
}

print_status_group() {
  local dir="$1"
  local name
  name="$(basename "$dir")"
  local meta_file="$dir/.openspec.group.yaml"
  local active_subchange suggested_focus execution_mode recommended_order
  active_subchange="$(read_group_field "$meta_file" "active_subchange")"
  suggested_focus="$(read_group_field "$meta_file" "suggested_focus")"
  execution_mode="$(read_group_field "$meta_file" "execution_mode")"
  recommended_order="$(read_group_field "$meta_file" "recommended_order")"

  printf "Group: %s\n" "$name"
  printf "  Mode: %s\n" "${execution_mode:--}"
  printf "  Active: %s\n" "${active_subchange:--}"
  printf "  Suggested: %s\n" "${suggested_focus:--}"
  printf "  Order: %s\n" "${recommended_order:--}"

  if [ -d "$dir/subchanges" ]; then
    local subdir
    while IFS= read -r -d '' subdir; do
      print_status_change "$subdir" "  "
    done < <(find "$dir/subchanges" -mindepth 1 -maxdepth 1 -type d -print0 | sort -z)
  fi
}

status_changes() {
  echo "Project: $PROJECT_ROOT"

  if [ ! -d "$CHANGES_DIR" ]; then
    echo
    echo "Active changes: 0"
    return 0
  fi

  local active=()
  while IFS= read -r -d '' d; do
    [[ "$(basename "$d")" == "archive" ]] && continue
    active+=("$d")
  done < <(find "$CHANGES_DIR" -mindepth 1 -maxdepth 1 -type d -not -name "archive" -print0 | sort -z)

  echo
  echo "Active changes: ${#active[@]}"
  if [ ${#active[@]} -eq 0 ]; then
    return 0
  fi

  local d
  for d in "${active[@]}"; do
    echo
    if is_group_dir "$d"; then
      print_status_group "$d"
    else
      print_status_change "$d"
    fi
  done
}

init_change() {
  local name="${1:-}"
  local schema="${2:-spec-driven}"

  validate_component "change" "$name"
  if ! schema_exists "$schema"; then
    echo "错误: 找不到 schema '$schema' ($SCHEMAS_DIR/$schema/schema.yaml)" >&2
    exit 1
  fi

  ensure_changes_dir
  local change_dir="$CHANGES_DIR/$name"
  local meta_file="$change_dir/.openspec.yaml"
  mkdir -p "$change_dir/specs"

  if [ ! -f "$meta_file" ]; then
    printf "schema: %s\ncreated: %s\n" "$schema" "$(date +%F)" > "$meta_file"
    echo "已初始化变更: openspec/changes/$name"
  else
    echo "变更已存在: openspec/changes/$name"
  fi
  echo "schema: $schema"
}

init_group() {
  local name="${1:-}"
  validate_component "父 change" "$name"
  ensure_changes_dir

  local group_dir="$CHANGES_DIR/$name"
  local meta_file="$group_dir/.openspec.group.yaml"
  if [ -e "$group_dir" ] && [ ! -f "$meta_file" ]; then
    echo "错误: 父 change '$name' 已存在但不是 group" >&2
    exit 1
  fi
  mkdir -p "$group_dir/subchanges"
  if [ ! -f "$meta_file" ]; then
    {
      echo "kind: group"
      printf "created: %s\n" "$(date +%F)"
      echo "execution_mode: mixed"
      echo "suggested_focus: "
      echo "active_subchange: "
      echo "recommended_order: "
    } > "$meta_file"
  fi
  echo "已初始化父 change: openspec/changes/$name"
}

init_subchange() {
  local group_name="${1:-}"
  local subchange_name="${2:-}"
  local schema="${3:-spec-driven}"
  validate_component "父 change" "$group_name"
  validate_component "subchange" "$subchange_name"

  if ! schema_exists "$schema"; then
    echo "错误: 找不到 schema '$schema' ($SCHEMAS_DIR/$schema/schema.yaml)" >&2
    exit 1
  fi

  local group_dir="$CHANGES_DIR/$group_name"
  if [ ! -e "$group_dir" ]; then
    init_group "$group_name" >/dev/null
  fi
  if ! is_group_dir "$group_dir"; then
    echo "错误: 父 change '$group_name' 已存在但不是 group" >&2
    exit 1
  fi

  local change_dir="$group_dir/subchanges/$subchange_name"
  local meta_file="$change_dir/.openspec.yaml"
  mkdir -p "$change_dir/specs"
  if [ ! -f "$meta_file" ]; then
    printf "schema: %s\ncreated: %s\n" "$schema" "$(date +%F)" > "$meta_file"
    echo "已初始化 subchange: openspec/changes/$group_name/subchanges/$subchange_name"
  else
    echo "subchange 已存在: openspec/changes/$group_name/subchanges/$subchange_name"
  fi
  echo "schema: $schema"
}

set_active_subchange() {
  local group_name="${1:-}"
  local subchange_name="${2:-}"
  validate_component "父 change" "$group_name"
  local group_dir="$CHANGES_DIR/$group_name"
  local meta_file="$group_dir/.openspec.group.yaml"
  if ! is_group_dir "$group_dir"; then
    echo "错误: 父 change '$group_name' 不存在或不是 group" >&2
    exit 1
  fi
  subchange_name="$(normalize_group_value "$subchange_name")"
  if [ -n "$subchange_name" ] && ! subchange_exists "$group_dir" "$subchange_name"; then
    echo "错误: subchange '$subchange_name' 不存在" >&2
    exit 1
  fi
  write_group_field "$meta_file" "active_subchange" "$subchange_name"
  echo "已设置 active_subchange: $group_name -> ${subchange_name:--}"
}

set_suggested_focus() {
  local group_name="${1:-}"
  local subchange_name="${2:-}"
  validate_component "父 change" "$group_name"
  local group_dir="$CHANGES_DIR/$group_name"
  local meta_file="$group_dir/.openspec.group.yaml"
  if ! is_group_dir "$group_dir"; then
    echo "错误: 父 change '$group_name' 不存在或不是 group" >&2
    exit 1
  fi
  subchange_name="$(normalize_group_value "$subchange_name")"
  if [ -n "$subchange_name" ] && ! subchange_exists "$group_dir" "$subchange_name"; then
    echo "错误: subchange '$subchange_name' 不存在" >&2
    exit 1
  fi
  write_group_field "$meta_file" "suggested_focus" "$subchange_name"
  echo "已设置 suggested_focus: $group_name -> ${subchange_name:--}"
}

set_execution_mode() {
  local group_name="${1:-}"
  local mode="${2:-}"
  validate_component "父 change" "$group_name"
  case "$mode" in serial|parallel|mixed) ;; *) echo "错误: execution_mode 仅支持 serial|parallel|mixed" >&2; exit 1 ;; esac
  local group_dir="$CHANGES_DIR/$group_name"
  local meta_file="$group_dir/.openspec.group.yaml"
  if ! is_group_dir "$group_dir"; then
    echo "错误: 父 change '$group_name' 不存在或不是 group" >&2
    exit 1
  fi
  write_group_field "$meta_file" "execution_mode" "$mode"
  echo "已设置 execution_mode: $group_name -> $mode"
}

set_recommended_order() {
  local group_name="${1:-}"
  local order="${2:-}"
  validate_component "父 change" "$group_name"
  local group_dir="$CHANGES_DIR/$group_name"
  local meta_file="$group_dir/.openspec.group.yaml"
  if ! is_group_dir "$group_dir"; then
    echo "错误: 父 change '$group_name' 不存在或不是 group" >&2
    exit 1
  fi
  order="$(normalize_group_value "$order")"
  if [ -n "$order" ]; then
    local item
    IFS=',' read -ra items <<< "$order"
    for item in "${items[@]}"; do
      item="$(printf "%s" "$item" | tr -d ' ')"
      if [ -n "$item" ] && ! subchange_exists "$group_dir" "$item"; then
        echo "错误: recommended_order 中的 subchange '$item' 不存在" >&2
        exit 1
      fi
    done
  fi
  write_group_field "$meta_file" "recommended_order" "$order"
  echo "已设置 recommended_order: $group_name -> ${order:--}"
}

command="${1:-list}"

case "$command" in
  list)
    list_changes
    ;;
  status)
    status_changes
    ;;
  init)
    shift
    init_change "${1:-}" "${2:-spec-driven}"
    ;;
  init-group)
    shift
    init_group "${1:-}"
    ;;
  init-subchange)
    shift
    init_subchange "${1:-}" "${2:-}" "${3:-spec-driven}"
    ;;
  set-active)
    shift
    set_active_subchange "${1:-}" "${2:-}"
    ;;
  set-suggested)
    shift
    set_suggested_focus "${1:-}" "${2:-}"
    ;;
  set-mode)
    shift
    set_execution_mode "${1:-}" "${2:-}"
    ;;
  set-order)
    shift
    set_recommended_order "${1:-}" "${2:-}"
    ;;
  resolve)
    shift
    resolve_target_dir "${1:-}"
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
