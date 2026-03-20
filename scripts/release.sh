#!/bin/bash
set -e
set -o pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
WHITE='\033[1;37m'
GREY='\033[0;90m'
NC='\033[0m'

log_info() { echo -e "${GREY}│${NC} ${GREEN}✓${NC} $1"; }
log_error() {
  echo -e "${GREY}│${NC} ${RED}✗${NC} $1"
  exit 1
}
log_step() { echo -e "${GREY}│${NC}\n${GREY}├${NC} ${WHITE}$1${NC}"; }

close_timeline() {
  echo -e "${GREY}└${NC}"
}

select_option() {
  local prompt_text=$1
  shift
  local options=("$@")
  local cur=0
  local count=${#options[@]}

  echo -ne "${GREY}│${NC}\n${GREEN}◆${NC} ${prompt_text}\n"

  while true; do
    for i in "${!options[@]}"; do
      if [ "$i" -eq "$cur" ]; then
        echo -e "${GREY}│${NC}  ${GREEN}❯ ${options[$i]}${NC}"
      else
        echo -e "${GREY}│${NC}    ${GREY}${options[$i]}${NC}"
      fi
    done

    read -rsn1 key
    case "$key" in
    $'\x1b')
      if read -rsn2 -t 0.001 key_seq; then
        if [[ "$key_seq" == "[A" ]]; then cur=$(((cur - 1 + count) % count)); fi
        if [[ "$key_seq" == "[B" ]]; then cur=$(((cur + 1) % count)); fi
      else
        echo -en "\033[$((count + 1))A\033[J"
        echo -e "\033[1A${GREY}│${NC}\n${GREY}◇${NC} ${prompt_text} ${RED}Cancelled${NC}"
        exit 1
      fi
      ;;
    "k") cur=$(((cur - 1 + count) % count)) ;;
    "j") cur=$(((cur + 1) % count)) ;;
    "q")
      echo -en "\033[$((count + 1))A\033[J"
      echo -e "\033[1A${GREY}│${NC}\n${GREY}◇${NC} ${prompt_text} ${RED}Cancelled${NC}"
      exit 1
      ;;
    "") break ;;
    esac

    echo -en "\033[${count}A"
  done

  echo -en "\033[$((count + 1))A\033[J"
  echo -e "\033[1A${GREY}│${NC}\n${GREY}◇${NC} ${prompt_text} ${WHITE}${options[$cur]}${NC}"
  SELECTED_OPTION="${options[$cur]}"
}

check_dependencies() {
  command -v git >/dev/null 2>&1 || log_error "git is not installed"
  command -v npm >/dev/null 2>&1 || log_error "npm is not installed"
  command -v node >/dev/null 2>&1 || log_error "node is not installed"
}

check_git_state() {
  local branch
  branch=$(git rev-parse --abbrev-ref HEAD)
  [ "$branch" = "main" ] || log_error "Must be on main branch (currently on ${branch})"
  [ -z "$(git status --porcelain)" ] || log_error "Working tree is not clean: commit or stash changes first"
  log_info "On main, working tree clean"
}

get_version() {
  node -p "require('./package.json').version"
}

bump_version() {
  local bump_type=$1
  npm version "$bump_type" --no-git-tag-version >/dev/null
}

commit_and_tag() {
  local version=$1
  git add package.json
  git commit -m "chore(release): v${version}"
  git tag "v${version}"
}

push_release() {
  git push --follow-tags
}

main() {
  cd "$(dirname "${BASH_SOURCE[0]}")/.."
  check_dependencies

  echo -e "${GREY}┌${NC}"
  echo -e "${GREY}│${NC} ${WHITE}Release${NC}"
  echo -e "${GREY}├${NC} ${WHITE}Validating state${NC}"
  trap close_timeline EXIT

  check_git_state

  local current_version
  current_version=$(get_version)
  log_info "Current version: ${current_version}"

  select_option "Bump type?" "patch" "minor" "major"
  local bump_type="$SELECTED_OPTION"

  log_step "Bumping version"
  bump_version "$bump_type"
  local new_version
  new_version=$(get_version)
  log_info "${current_version} → ${new_version}"

  log_step "Committing and tagging"
  commit_and_tag "$new_version"
  log_info "Tagged v${new_version}"

  log_step "Pushing"
  push_release

  trap - EXIT
  echo -e "${GREY}└${NC}\n"
  echo -e "${GREEN}✓ Released v${new_version} — workflow triggered${NC}"
}

main "$@"
