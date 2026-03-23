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

load_env() {
  local env_file
  env_file="$(dirname "${BASH_SOURCE[0]}")/../.env.local"
  [ -f "$env_file" ] || log_error ".env.local not found"
  # shellcheck disable=SC1090
  source "$env_file"
  [ -n "${CWS_CLIENT_ID:-}" ] || log_error "CWS_CLIENT_ID is not set in .env.local"
  [ -n "${CWS_CLIENT_SECRET:-}" ] || log_error "CWS_CLIENT_SECRET is not set in .env.local"
  if [ -z "${CWS_AUTH_CODE:-}" ]; then
    local auth_url="https://accounts.google.com/o/oauth2/auth?client_id=${CWS_CLIENT_ID}&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=https://www.googleapis.com/auth/chromewebstore&response_type=code"
    log_error "CWS_AUTH_CODE is not set in .env.local. Open this URL to get one: ${auth_url}"
  fi
}

REFRESH_TOKEN=""

fetch_refresh_token() {
  local response
  response=$(curl -s -X POST https://oauth2.googleapis.com/token \
    -d client_id="${CWS_CLIENT_ID}" \
    -d client_secret="${CWS_CLIENT_SECRET}" \
    -d code="${CWS_AUTH_CODE}" \
    -d grant_type=authorization_code \
    -d redirect_uri=urn:ietf:wg:oauth:2.0:oob)

  REFRESH_TOKEN=$(echo "$response" | grep -o '"refresh_token": *"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || true)
  if [ -z "$REFRESH_TOKEN" ]; then
    local error
    error=$(echo "$response" | grep -o '"error": *"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || true)
    [ -n "$error" ] && log_error "Google returned: ${error}. Auth code may be expired or already used"
    log_error "No refresh token in response. Auth code may be expired or already used"
  fi
}

main() {
  echo -e "${GREY}┌${NC}"
  echo -e "${GREY}│${NC} ${WHITE}CWS token${NC}"
  echo -e "${GREY}├${NC} ${WHITE}Loading credentials${NC}"
  trap close_timeline EXIT

  load_env
  log_info "Credentials loaded"

  log_step "Fetching refresh token"
  fetch_refresh_token
  log_info "CWS_REFRESH_TOKEN: ${REFRESH_TOKEN}"

  trap - EXIT
  echo -e "${GREY}└${NC}\n"
  echo -e "${GREEN}✓ Add CWS_REFRESH_TOKEN to your GitHub repo secrets${NC}"
}

main "$@"
