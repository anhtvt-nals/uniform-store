#!/usr/bin/env bash

# Provision a fresh, single-project Supabase self-hosted instance on
# Ubuntu/Debian. It uses the official Supabase Docker stack, Nginx, and
# Let's Encrypt. Only Nginx is exposed publicly; the API gateway, Postgres,
# and Supavisor are bound to loopback.
#
# Example:
#   sudo DOMAIN=supabase.example.com CERTBOT_EMAIL=ops@example.com \
#     AUTH_SITE_URL=https://app.example.com \
#     bash scripts/setup-supabase-self-host.sh
#
# Optional:
#   INSTALL_DIR=/opt/supabase SUPABASE_REF=self-hosted/v0.8.0 \
#   ADDITIONAL_REDIRECT_URLS='https://app.example.com/**' \
#   DASHBOARD_USERNAME=admin bash scripts/setup-supabase-self-host.sh

set -Eeuo pipefail

DOMAIN="${DOMAIN:-}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"
INSTALL_DIR="${INSTALL_DIR:-/opt/supabase}"
SUPABASE_REF="${SUPABASE_REF:-self-hosted/v0.8.0}"
AUTH_SITE_URL="${AUTH_SITE_URL:-}"
ADDITIONAL_REDIRECT_URLS="${ADDITIONAL_REDIRECT_URLS:-}"
DASHBOARD_USERNAME="${DASHBOARD_USERNAME:-supabase-admin}"
NGINX_SITE="/etc/nginx/sites-available/supabase-self-host"

die() { printf '[supabase-self-host] ERROR: %s\n' "$*" >&2; exit 1; }
log() { printf '[supabase-self-host] %s\n' "$*"; }

[[ "$EUID" -eq 0 ]] || die 'Run with sudo/root: sudo DOMAIN=... CERTBOT_EMAIL=... bash scripts/setup-supabase-self-host.sh'
[[ "$DOMAIN" =~ ^[A-Za-z0-9.-]+$ && "$DOMAIN" == *.* ]] || die 'DOMAIN must be a hostname, for example supabase.example.com'
[[ "$CERTBOT_EMAIL" =~ ^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$ ]] || die 'CERTBOT_EMAIL must be a valid email address'
[[ "$INSTALL_DIR" == /* && "$INSTALL_DIR" != / ]] || die 'INSTALL_DIR must be a specific absolute directory'
[[ "$DASHBOARD_USERNAME" =~ ^[A-Za-z0-9._-]{3,64}$ ]] || die 'DASHBOARD_USERNAME must be 3-64 safe characters'

PUBLIC_URL="https://${DOMAIN}"
AUTH_SITE_URL="${AUTH_SITE_URL:-$PUBLIC_URL}"
ADDITIONAL_REDIRECT_URLS="${ADDITIONAL_REDIRECT_URLS:-${AUTH_SITE_URL}/**}"

install_packages() {
  command -v apt-get >/dev/null 2>&1 || die 'This script supports Ubuntu/Debian hosts using apt-get'
  log 'Installing Docker, Nginx, Certbot, and prerequisites'
  apt-get update
  DEBIAN_FRONTEND=noninteractive apt-get install -y \
    ca-certificates certbot curl git jq nginx openssl python3-certbot-nginx \
    docker.io
  if ! docker compose version >/dev/null 2>&1; then
    DEBIAN_FRONTEND=noninteractive apt-get install -y docker-compose-plugin \
      || DEBIAN_FRONTEND=noninteractive apt-get install -y docker-compose-v2 \
      || die 'Install Docker Compose v2, then run this script again'
  fi
  systemctl enable --now docker nginx
  docker compose version >/dev/null 2>&1 || die 'Docker Compose plugin is unavailable after installation'
}

set_env() {
  local key="$1" value="$2" escaped
  escaped="$(printf '%s' "$value" | sed 's/[\\&|]/\\&/g')"
  if grep -qE "^${key}=" .env; then
    sed -i "s|^${key}=.*|${key}=${escaped}|" .env
  else
    printf '\n%s=%s\n' "$key" "$value" >> .env
  fi
}

install_stack() {
  if [[ -e "$INSTALL_DIR" ]]; then
    [[ -f "$INSTALL_DIR/docker-compose.yml" && -f "$INSTALL_DIR/.env" ]] || die "INSTALL_DIR exists but is not a Supabase installation: $INSTALL_DIR"
    log "Resuming existing Supabase installation without changing its secrets"
    cd "$INSTALL_DIR"
    docker compose up -d --wait
    docker compose ps
    return
  fi
  local install_parent source_dir
  install_parent="$(dirname "$INSTALL_DIR")"
  mkdir -p "$install_parent"
  source_dir="$(mktemp -d "${install_parent}/.supabase-source.XXXXXX")"
  trap 'rm -rf "$source_dir"' EXIT

  log "Fetching official Supabase Docker configuration (${SUPABASE_REF})"
  git clone --depth 1 --branch "$SUPABASE_REF" --filter=blob:none --sparse \
    https://github.com/supabase/supabase.git "$source_dir"
  git -C "$source_dir" sparse-checkout set docker
  mkdir -p "$INSTALL_DIR"
  cp -a "$source_dir/docker/." "$INSTALL_DIR/"
  printf 'ref=%s\n' "$SUPABASE_REF" > "$INSTALL_DIR/.supabase-version"
  rm -rf "$source_dir"
  trap - EXIT

  cd "$INSTALL_DIR"
  cp .env.example .env
  chmod 600 .env

  # Official helpers write strong secrets and modern asymmetric API keys into
  # .env. Do not replace them with sample values from .env.example.
  log 'Generating Supabase secrets and API keys'
  sh utils/generate-keys.sh --update-env >/dev/null
  sh utils/add-new-auth-keys.sh --update-env >/dev/null
  chmod 600 .env .env.old 2>/dev/null || true

  set_env SUPABASE_PUBLIC_URL "$PUBLIC_URL"
  set_env API_EXTERNAL_URL "${PUBLIC_URL}/auth/v1"
  set_env SITE_URL "$AUTH_SITE_URL"
  set_env ADDITIONAL_REDIRECT_URLS "$ADDITIONAL_REDIRECT_URLS"
  set_env DASHBOARD_USERNAME "$DASHBOARD_USERNAME"
  set_env DASHBOARD_PASSWORD "$(openssl rand -hex 24)"
  set_env API_GW_HTTP_PORT 8000
  set_env KONG_HTTP_PORT 8000

  # The official stack publishes Envoy, Postgres, and Supavisor by default.
  # Keep each on loopback; Nginx is the only Internet-facing process.
  sed -i -E \
    -e '/^[[:space:]]*-[[:space:]]*\$\{API_GW_HTTP_PORT:-\$\{KONG_HTTP_PORT:-8000\}\}:8000\/tcp/s/-[[:space:]]*/- 127.0.0.1:/' \
    -e '/^[[:space:]]*-[[:space:]]*\$\{POSTGRES_PORT\}:5432/s/-[[:space:]]*/- 127.0.0.1:/' \
    -e '/^[[:space:]]*-[[:space:]]*\$\{POOLER_PROXY_PORT_TRANSACTION\}:6543/s/-[[:space:]]*/- 127.0.0.1:/' \
    docker-compose.yml

  grep -q '127.0.0.1:${API_GW_HTTP_PORT:-${KONG_HTTP_PORT:-8000}}:8000/tcp' docker-compose.yml || die 'Could not bind the API gateway to loopback; inspect docker-compose.yml before starting'
  grep -q '127.0.0.1:${POSTGRES_PORT}:5432' docker-compose.yml || die 'Could not bind Postgres to loopback; inspect docker-compose.yml before starting'
  grep -q '127.0.0.1:${POOLER_PROXY_PORT_TRANSACTION}:6543' docker-compose.yml || die 'Could not bind Supavisor to loopback; inspect docker-compose.yml before starting'

  docker compose pull
  docker compose up -d --wait
  docker compose ps
}

write_nginx() {
  log "Configuring Nginx for ${DOMAIN}"
  cat > "$NGINX_SITE" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    client_max_body_size 55m;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
        proxy_buffering off;
    }
}
EOF
  ln -sfn "$NGINX_SITE" /etc/nginx/sites-enabled/supabase-self-host
  nginx -t
  systemctl reload nginx
}

issue_certificate() {
  log "Requesting Let's Encrypt certificate for ${DOMAIN}"
  certbot --nginx --non-interactive --agree-tos --email "$CERTBOT_EMAIL" --redirect -d "$DOMAIN"
  systemctl enable --now certbot.timer >/dev/null 2>&1 || true
}

verify() {
  local anon_key
  anon_key="$(grep '^ANON_KEY=' "$INSTALL_DIR/.env" | cut -d= -f2-)"
  [[ -n "$anon_key" ]] || die 'ANON_KEY is missing from the Supabase .env file'
  curl --fail --silent --show-error --max-time 15 \
    --header "apikey: ${anon_key}" \
    "https://${DOMAIN}/auth/v1/health" >/dev/null || die 'HTTPS gateway health check failed'
  log "Ready: ${PUBLIC_URL}"
  log "Install directory: ${INSTALL_DIR}"
  log "Show generated credentials locally: cd ${INSTALL_DIR} && sh run.sh secrets"
  log 'Keep .env private. Configure SMTP, OAuth redirect URLs, and backups before production traffic.'
}

main() {
  install_packages
  install_stack
  write_nginx
  issue_certificate
  verify
}

main "$@"
