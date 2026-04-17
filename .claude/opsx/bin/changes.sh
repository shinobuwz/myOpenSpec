#!/usr/bin/env bash
# 统一处理 OpenSpec change 的常用本地操作：
# - 默认 / list / status: 列出活动变更及其阶段和进度
# - init <name> [schema]: 初始化单个变更目录和 .openspec.yaml
# - init-group <name>: 初始化父 change 容器和 .openspec.group.yaml
# - init-subchange <group> <name> [schema]: 初始化 subchange 目录和 .openspec.yaml
# - set-active <group> <name>: 设置父 change 的 active_subchange
# - set-suggested <group> <name>: 设置父 change 的 suggested_focus
# - set-mode <group> <mode>: 设置 execution_mode（serial|parallel|mixed）
# - set-order <group> <csv>: 设置 recommended_order（逗号分隔）
# - resolve <name>: 将逻辑 change 标识解析为真实 change root 路径

set -euo pipefail

PROJECT_ROOT="$PWD"
CHANGES_DIR="$PROJECT_ROOT/openspec/changes"
PROJECT_SCHEMAS_DIR="$PROJECT_ROOT/.claude/opsx/schemas"
GLOBAL_SCHEMAS_DIR="$HOME/.claude/opsx/schemas"
SCHEMAS_DIR="$PROJECT_SCHEMAS_DIR"

[ -d "$PROJECT_SCHEMAS_DIR" ] || SCHEMAS_DIR="$GLOBAL_SCHEMAS_DIR"

usage() {
  cat <<'EOF'
用法:
  bash .claude/opsx/bin/changes.sh
  bash .claude/opsx/bin/changes.sh list
  bash .claude/opsx/bin/changes.sh status
  bash .claude/opsx/bin/changes.sh init <change-name> [schema]
  bash .claude/opsx/bin/changes.sh init-group <group-name>
  bash .claude/opsx/bin/changes.sh init-subchange <group-name> <subchange-name> [schema]
  bash .claude/opsx/bin/changes.sh set-active <group-name> <subchange-name>
  bash .claude/opsx/bin/changes.sh set-suggested <group-name> <subchange-name>
  bash .claude/opsx/bin/changes.sh set-mode <group-name> <serial|parallel|mixed>
  bash .claude/opsx/bin/changes.sh set-order <group-name> <sub1,sub2,...>
  bash .claude/opsx/bin/changes.sh resolve <change-name|group-name|group/subchange>

说明:
  list/status         列出活动变更及其阶段和进度
  init                创建 openspec/changes/<name>/specs 和 .openspec.yaml
  init-group          创建 openspec/changes/<group>/subchanges、index.md 和 .openspec.group.yaml
  init-subchange      创建 openspec/changes/<group>/subchanges/<name>/specs 和 .openspec.yaml
  set-active          写入父 change 的 active_subchange（运行态）
  set-suggested       写入父 change 的 suggested_focus（slice 推荐焦点）
  set-mode            写入 execution_mode（serial|parallel|mixed）
  set-order           写入 recommended_order（逗号分隔）
  resolve             输出真实 change root 路径；优先 active，再退化到 suggested_focus / recommended_order / 唯一子项
EOF
}

ensure_changes_dir() {
  mkdir -p "$CHANGES_DIR"
}

schema_exists() {
  local schema="$1"
  [ -f "$SCHEMAS_DIR/$schema/schema.yaml" ]
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
    cat "$file" > "$tmp"
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

  if [[ "$target" == */* ]]; then
    local group="${target%%/*}"
    local subchange="${target#*/}"
    candidate="$CHANGES_DIR/$group/subchanges/$subchange"
    [ -f "$candidate/.openspec.yaml" ] && {
      printf "%s\n" "$candidate"
      return 0
    }
  fi

  candidate="$CHANGES_DIR/$target"
  if [ -f "$candidate/.openspec.yaml" ]; then
    printf "%s\n" "$candidate"
    return 0
  fi

  if is_group_dir "$candidate"; then
    local group_meta="$candidate/.openspec.group.yaml"
    local active_subchange
    active_subchange="$(read_group_field "$group_meta" "active_subchange")"

    if [ -n "$active_subchange" ] && subchange_exists "$candidate" "$active_subchange"; then
      printf "%s\n" "$candidate/subchanges/$active_subchange"
      return 0
    fi

    local suggested_focus
    suggested_focus="$(read_group_field "$group_meta" "suggested_focus")"
    if [ -n "$suggested_focus" ] && subchange_exists "$candidate" "$suggested_focus"; then
      printf "%s\n" "$candidate/subchanges/$suggested_focus"
      return 0
    fi

    local order_first=""
    order_first="$(first_recommended_subchange "$group_meta" || true)"
    if [ -n "$order_first" ] && subchange_exists "$candidate" "$order_first"; then
      printf "%s\n" "$candidate/subchanges/$order_first"
      return 0
    fi

    local sub_count
    sub_count="$(count_subchanges "$candidate")"
    if [ "$sub_count" = "1" ]; then
      local only_subchange
      only_subchange="$(first_subchange "$candidate")"
      printf "%s\n" "$candidate/subchanges/$only_subchange"
      return 0
    fi

    echo "错误: 父 change '$target' 没有唯一可解析的 subchange；请显式指定 group/subchange 或先设置 suggested_focus / active_subchange" >&2
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
    total=$({ grep -E '^\s*- \[' "$dir/tasks.md" 2>/dev/null || true; } | wc -l | tr -d ' ')
    done=$({ grep -E '^\s*- \[x\]' "$dir/tasks.md" 2>/dev/null || true; } | wc -l | tr -d ' ')
    if [ "$total" -gt 0 ]; then
      progress=" ($done/$total)"
    fi
  fi

  printf "%s%s\n" "$stage" "$progress"
}

print_change() {
  local dir="$1"
  local name
  name="$(basename "$dir")"
  local summary
  summary="$(change_stage_summary "$dir")"

  printf "  %-40s  [%s]\n" "$name" "$summary"
}

print_group() {
  local dir="$1"
  local name
  name="$(basename "$dir")"
  local meta_file="$dir/.openspec.group.yaml"
  local active_subchange
  active_subchange="$(read_group_field "$meta_file" "active_subchange")"
  local suggested_focus
  suggested_focus="$(read_group_field "$meta_file" "suggested_focus")"
  local execution_mode
  execution_mode="$(read_group_field "$meta_file" "execution_mode")"
  local recommended_order
  recommended_order="$(read_group_field "$meta_file" "recommended_order")"

  local count=0
  if [ -d "$dir/subchanges" ]; then
    count=$(find "$dir/subchanges" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')
  fi

  if [ -n "$active_subchange" ] && [ -d "$dir/subchanges/$active_subchange" ]; then
    local summary
    summary="$(change_stage_summary "$dir/subchanges/$active_subchange")"
    printf "  %-40s  [group mode=%s suggested=%s active=%s stage=%s subchanges=%s]\n" "$name" "${execution_mode:--}" "${suggested_focus:--}" "$active_subchange" "$summary" "$count"
  else
    printf "  %-40s  [group mode=%s suggested=%s active=- order=%s subchanges=%s]\n" "$name" "${execution_mode:--}" "${suggested_focus:--}" "${recommended_order:--}" "$count"
  fi

  if [ -d "$dir/subchanges" ]; then
    local subdir
    while IFS= read -r -d '' subdir; do
      local subname
      subname="$(basename "$subdir")"
      local summary
      summary="$(change_stage_summary "$subdir")"
      printf "    - %-36s  [%s]\n" "$subname" "$summary"
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

init_group() {
  local name="${1:-}"

  if [ -z "$name" ]; then
    echo "错误: init-group 需要父 change 名称" >&2
    usage >&2
    exit 1
  fi

  if [[ "$name" == "archive" ]]; then
    echo "错误: archive 是保留目录名，不能用作 change 名称" >&2
    exit 1
  fi

  ensure_changes_dir

  local group_dir="$CHANGES_DIR/$name"
  local meta_file="$group_dir/.openspec.group.yaml"
  local created
  created="$(date +%F)"

  mkdir -p "$group_dir/subchanges"

  if [ ! -f "$meta_file" ]; then
    {
      echo "kind: group"
      printf "created: %s\n" "$created"
      echo "execution_mode: mixed"
      echo "suggested_focus: "
      echo "active_subchange: "
      echo "recommended_order: "
    } > "$meta_file"
  fi

  if [ ! -f "$group_dir/index.md" ]; then
    cat > "$group_dir/index.md" <<EOF
# Change Group: $name

## Goal

## Subchanges

## Execution Topology
- execution_mode:
- suggested_focus:
- recommended_order:

## Dependencies

## Active
- active_subchange:
EOF
  fi

  echo "已初始化父 change: openspec/changes/$name"
}

init_subchange() {
  local group_name="${1:-}"
  local subchange_name="${2:-}"
  local schema="${3:-spec-driven}"

  if [ -z "$group_name" ] || [ -z "$subchange_name" ]; then
    echo "错误: init-subchange 需要父 change 名称和 subchange 名称" >&2
    usage >&2
    exit 1
  fi

  if ! schema_exists "$schema"; then
    echo "错误: 找不到 schema '$schema' ($SCHEMAS_DIR/$schema/schema.yaml)" >&2
    exit 1
  fi

  local group_dir="$CHANGES_DIR/$group_name"
  if ! is_group_dir "$group_dir"; then
    echo "错误: 父 change '$group_name' 不存在或不是 group" >&2
    exit 1
  fi

  local change_dir="$group_dir/subchanges/$subchange_name"
  local meta_file="$change_dir/.openspec.yaml"
  local created
  created="$(date +%F)"

  mkdir -p "$change_dir/specs"

  if [ ! -f "$meta_file" ]; then
    printf "schema: %s\ncreated: %s\n" "$schema" "$created" > "$meta_file"
    echo "已初始化 subchange: openspec/changes/$group_name/subchanges/$subchange_name"
  else
    echo "subchange 已存在: openspec/changes/$group_name/subchanges/$subchange_name"
  fi

  echo "schema: $schema"
}

set_active_subchange() {
  local group_name="${1:-}"
  local subchange_name="${2:-}"

  if [ -z "$group_name" ] || [ -z "$subchange_name" ]; then
    echo "错误: set-active 需要父 change 名称和 subchange 名称" >&2
    usage >&2
    exit 1
  fi

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

  if [ -z "$group_name" ]; then
    echo "错误: set-suggested 需要父 change 名称" >&2
    usage >&2
    exit 1
  fi

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

  if [ -z "$group_name" ] || [ -z "$mode" ]; then
    echo "错误: set-mode 需要父 change 名称和 execution_mode" >&2
    usage >&2
    exit 1
  fi

  case "$mode" in
    serial|parallel|mixed) ;;
    *)
      echo "错误: execution_mode 仅支持 serial|parallel|mixed" >&2
      exit 1
      ;;
  esac

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

  if [ -z "$group_name" ]; then
    echo "错误: set-order 需要父 change 名称" >&2
    usage >&2
    exit 1
  fi

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
  list|status)
    list_changes
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
