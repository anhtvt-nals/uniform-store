#!/usr/bin/env bash

# Stream a logical Supabase Platform export directly into a fresh self-hosted
# Supabase database. No SQL dump files are written to disk.
#
# Run this ON the self-host VPS after the Docker stack is healthy:
#   sudo SOURCE_DB_URL='postgresql://...' CONFIRM_RESTORE=YES \
#     bash scripts/stream-supabase-cloud-to-self-host.sh
#
# The source should be in a maintenance window: roles, schema, and data are
# independent logical dumps, so concurrent writes can otherwise span snapshots.

set -Eeuo pipefail

SOURCE_DB_URL="${SOURCE_DB_URL:-}"
INSTALL_DIR="${INSTALL_DIR:-/opt/supabase}"
CONFIRM_RESTORE="${CONFIRM_RESTORE:-}"
ALLOW_NONEMPTY_TARGET="${ALLOW_NONEMPTY_TARGET:-false}"
INCLUDE_MIGRATION_HISTORY="${INCLUDE_MIGRATION_HISTORY:-true}"
RESUME_FROM_DATA="${RESUME_FROM_DATA:-false}"
# The Docker stack already creates the required Supabase database roles. Cloud
# role definitions/configuration are environment-specific and can include
# superuser-only GUCs, so never import them unless explicitly requested.
INCLUDE_DATABASE_ROLES="${INCLUDE_DATABASE_ROLES:-false}"
SUPABASE_CLI_VERSION="${SUPABASE_CLI_VERSION:-latest}"
SUPABASE_CLI_INSTALL_PATH="${SUPABASE_CLI_INSTALL_PATH:-/usr/local/bin/supabase}"

die() { printf '[supabase-stream-restore] ERROR: %s\n' "$*" >&2; exit 1; }
log() { printf '[supabase-stream-restore] %s\n' "$*"; }

[[ "$EUID" -eq 0 ]] || die 'Run with sudo/root so the self-host .env can be read'
[[ -n "$SOURCE_DB_URL" ]] || die 'Set SOURCE_DB_URL to the Supabase Platform session/direct connection string'
[[ "$CONFIRM_RESTORE" == YES ]] || die 'Set CONFIRM_RESTORE=YES after confirming that the target is the intended fresh instance'
[[ -f "$INSTALL_DIR/.env" && -f "$INSTALL_DIR/docker-compose.yml" ]] || die "No self-hosted Supabase installation found in $INSTALL_DIR"
[[ "$RESUME_FROM_DATA" == true || "$RESUME_FROM_DATA" == false ]] || die 'RESUME_FROM_DATA must be true or false'

install_supabase_cli() {
  local machine archive download_url temp_dir
  command -v curl >/dev/null 2>&1 || {
    command -v apt-get >/dev/null 2>&1 || die 'curl is required to install the Supabase CLI automatically'
    apt-get update
    DEBIAN_FRONTEND=noninteractive apt-get install -y curl ca-certificates
  }
  command -v tar >/dev/null 2>&1 || die 'tar is required to install the Supabase CLI automatically'

  case "$(uname -m)" in
    x86_64|amd64) machine='amd64' ;;
    aarch64|arm64) machine='arm64' ;;
    *) die "Unsupported CPU architecture for automatic Supabase CLI install: $(uname -m)" ;;
  esac

  archive="supabase_linux_${machine}.tar.gz"
  if [[ "$SUPABASE_CLI_VERSION" == latest ]]; then
    download_url="https://github.com/supabase/cli/releases/latest/download/${archive}"
  elif [[ "$SUPABASE_CLI_VERSION" =~ ^[0-9]+(\.[0-9]+){1,2}$ ]]; then
    download_url="https://github.com/supabase/cli/releases/download/v${SUPABASE_CLI_VERSION}/supabase_${SUPABASE_CLI_VERSION}_linux_${machine}.tar.gz"
  else
    die 'SUPABASE_CLI_VERSION must be "latest" or a version such as "2.101.0"'
  fi

  temp_dir="$(mktemp -d)"
  log "Supabase CLI was not found; installing ${SUPABASE_CLI_VERSION} for linux/${machine}"
  curl --fail --show-error --silent --location --proto '=https' --tlsv1.2 \
    --output "$temp_dir/$archive" "$download_url"
  tar -xzf "$temp_dir/$archive" -C "$temp_dir"
  [[ -f "$temp_dir/supabase" ]] || die 'Downloaded Supabase CLI archive did not contain the expected binary'
  install -D -m 0755 "$temp_dir/supabase" "$SUPABASE_CLI_INSTALL_PATH"
  "$SUPABASE_CLI_INSTALL_PATH" --version >/dev/null || die 'Installed Supabase CLI could not be executed'
  rm -rf "$temp_dir"
}

if command -v supabase >/dev/null 2>&1; then
  SUPABASE_COMMAND=(supabase)
else
  install_supabase_cli
  SUPABASE_COMMAND=("$SUPABASE_CLI_INSTALL_PATH")
fi

read_env() {
  local key="$1"
  awk -F= -v key="$key" '$1 == key { print substr($0, index($0, "=") + 1); exit }' "$INSTALL_DIR/.env"
}

POSTGRES_PASSWORD="$(read_env POSTGRES_PASSWORD)"
[[ -n "$POSTGRES_PASSWORD" ]] || die 'POSTGRES_PASSWORD is missing from the target .env'

target_psql() {
  # The published host port may be Supavisor on newer self-hosted stacks.
  # Execute inside the official `db` container to obtain the real PostgreSQL
  # socket without relying on a pooler tenant identifier.
  docker compose exec -T -e "PGPASSWORD=$POSTGRES_PASSWORD" db psql \
    --username=postgres \
    --dbname=postgres \
    "$@"
}

target_auth_owner_psql() {
  # Auth migrations in the official Docker stack own auth.* through this role.
  # Use TCP inside the container: local sockets use peer authentication and
  # would ignore PGPASSWORD for a non-OS role such as supabase_auth_admin.
  docker compose exec -T -e "PGPASSWORD=$POSTGRES_PASSWORD" db psql \
    --host=127.0.0.1 \
    --username=supabase_auth_admin \
    --dbname=postgres \
    "$@"
}

target_admin_psql() {
  # supabase_admin is the stack's administrative database role. Restore data
  # through it because public `postgres` is intentionally not the owner of
  # every auth/storage relation in current self-hosted deployments.
  docker compose exec -T -e "PGPASSWORD=$POSTGRES_PASSWORD" db psql \
    --host=127.0.0.1 \
    --username=supabase_admin \
    --dbname=postgres \
    "$@"
}

target_storage_owner_psql() {
  # Storage migrations in the official Docker stack own storage.* through
  # their dedicated database role.
  docker compose exec -T -e "PGPASSWORD=$POSTGRES_PASSWORD" db psql \
    --host=127.0.0.1 \
    --username=supabase_storage_admin \
    --dbname=postgres \
    "$@"
}

target_has_app_data() {
  local relation count
  relation="$(target_psql --tuples-only --no-align --command "select to_regclass('public.profiles')")"
  [[ -n "$relation" ]] || return 1
  count="$(target_psql --tuples-only --no-align --command 'select count(*) from public.profiles')"
  [[ "${count//[[:space:]]/}" != 0 ]]
}

stream_dump() {
  # Omitting --file intentionally sends SQL to stdout, which is piped into
  # psql. `supabase db dump` filters Supabase internals unlike raw pg_dump.
  "${SUPABASE_COMMAND[@]}" db dump --db-url "$SOURCE_DB_URL" "$@"
}

restore_phase() {
  local phase="$1"
  shift
  log "Streaming ${phase}"
  stream_dump "$@" | target_psql --single-transaction --variable ON_ERROR_STOP=1
}

prepare_platform_auth_compatibility() {
  # Supabase Auth 2.192 added this field for custom OAuth/OIDC providers.
  # Platform data dumps include the column even when the self-hosted Auth
  # image predates that migration. The migration itself is IF NOT EXISTS, so
  # adding the compatible text[] field is safe before streaming data.
  local has_table
  has_table="$(target_psql --tuples-only --no-align --command "select to_regclass('auth.custom_oauth_providers') is not null")"
  if [[ "${has_table//[[:space:]]/}" == t ]]; then
    log 'Applying compatible Auth column custom_oauth_providers.custom_claims_allowlist when needed'
    target_auth_owner_psql --command 'alter table auth.custom_oauth_providers add column if not exists custom_claims_allowlist text[]'
  fi
}

prepare_payment_invoice_compatibility() {
  # The application validates new deposits at 10,000 IDR. Older sandbox and
  # failed invoices can be below that amount, and must remain restorable for
  # accounting/audit history. The durable schema migration uses this same
  # positive-amount constraint.
  local has_table
  has_table="$(target_psql --tuples-only --no-align --command "select to_regclass('public.payment_invoices') is not null")"
  if [[ "${has_table//[[:space:]]/}" == t ]]; then
    log 'Allowing historical positive payment invoice amounts during restore'
    target_psql --command 'alter table public.payment_invoices drop constraint if exists payment_invoices_amount_idr_check'
    target_psql --command 'alter table public.payment_invoices add constraint payment_invoices_amount_idr_check check (amount_idr > 0)'
  fi
}

prepare_platform_storage_compatibility() {
  # Current Platform Storage includes this bucket-versioning metadata while
  # older self-hosted Storage images do not. It is text metadata and older
  # Storage versions safely ignore the additional column.
  local has_table
  has_table="$(target_psql --tuples-only --no-align --command "select to_regclass('storage.buckets') is not null")"
  if [[ "${has_table//[[:space:]]/}" == t ]]; then
    log 'Applying compatible Storage columns when needed'
    target_storage_owner_psql --command 'alter table storage.buckets add column if not exists versioning_status text'
    target_storage_owner_psql --command 'alter table storage.objects add column if not exists archived_at timestamptz'
    target_storage_owner_psql --command 'alter table storage.objects add column if not exists is_delete_marker boolean default false'
    target_storage_owner_psql --command 'alter table storage.objects add column if not exists is_versioned boolean default false'
  fi
}

main() {
  cd "$INSTALL_DIR"
  docker compose ps >/dev/null
  if target_has_app_data && [[ "$ALLOW_NONEMPTY_TARGET" != true ]]; then
    die 'Target public.profiles already contains data. Refusing to merge databases; use a fresh target or explicitly set ALLOW_NONEMPTY_TARGET=true.'
  fi

  log 'Starting restore. Do not point application traffic at either database until it completes.'
  if [[ "$INCLUDE_DATABASE_ROLES" == true ]]; then
    log 'Importing database roles explicitly requested by INCLUDE_DATABASE_ROLES=true'
    restore_phase 'roles' --role-only
  else
    log 'Skipping Cloud database roles; the self-hosted stack owns its Supabase roles and role settings'
  fi
  if [[ "$RESUME_FROM_DATA" == true ]]; then
    log 'Resuming from data; skipping schema because a prior schema phase already completed'
  else
    restore_phase 'schema'
  fi

  prepare_platform_auth_compatibility
  prepare_payment_invoice_compatibility
  prepare_platform_storage_compatibility
  log 'Streaming data with triggers disabled during import'
  { printf 'SET session_replication_role = replica;\n'; stream_dump --use-copy --data-only; } \
    | target_admin_psql --single-transaction --variable ON_ERROR_STOP=1

  if [[ "$INCLUDE_MIGRATION_HISTORY" == true ]]; then
    log 'Streaming Supabase migration-history schema'
    stream_dump --schema supabase_migrations \
      | target_admin_psql --single-transaction --variable ON_ERROR_STOP=1
    log 'Streaming Supabase migration-history data'
    stream_dump --use-copy --data-only --schema supabase_migrations \
      | target_admin_psql --single-transaction --variable ON_ERROR_STOP=1
  fi

  log 'Restore complete. Verify auth.users, public.profiles, RLS policies, and key row counts before cutover.'
}

main "$@"
