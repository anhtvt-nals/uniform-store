#!/usr/bin/env bash
set -Eeuo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/supabase}"
SOURCE_DATABASE_URL="${SOURCE_DATABASE_URL:-}"
TARGET_DATABASE_URL="${TARGET_DATABASE_URL:-}"
CONFIRM=false

die() { printf '[supabase-migrate] ERROR: %s\n' "$*" >&2; exit 1; }
usage() { printf 'Usage: SOURCE_DATABASE_URL=... TARGET_DATABASE_URL=... %s --confirm\n' "$0"; }

while (($#)); do
  case "$1" in
    --confirm) CONFIRM=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) usage >&2; die "unknown option: $1" ;;
  esac
done

$CONFIRM || die '--confirm is required; target data may be overwritten'
[[ -n "$SOURCE_DATABASE_URL" && -n "$TARGET_DATABASE_URL" ]] || die 'SOURCE_DATABASE_URL and TARGET_DATABASE_URL are required'
command -v pg_dump >/dev/null || die 'pg_dump is required'
command -v pg_restore >/dev/null || die 'pg_restore is required'
command -v python3 >/dev/null || die 'python3 is required to parse database URLs safely'
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

read_url() {
  python3 - "$1" <<'PY'
from urllib.parse import urlparse, unquote
import sys
u = urlparse(sys.argv[1])
if u.scheme not in ('postgres', 'postgresql') or not u.hostname or not u.path.strip('/'):
    raise SystemExit('invalid PostgreSQL URL: scheme, host and database are required')
print(u.hostname)
print(u.port or 5432)
print(unquote(u.username or 'postgres'))
print(unquote(u.password or ''))
print(u.path.lstrip('/').split('?', 1)[0])
PY
}

read_connection() {
  local raw=()
  mapfile -t raw < <(read_url "$1")
  DB_HOST=${raw[0]}; DB_PORT=${raw[1]}; DB_USER=${raw[2]}; DB_PASSWORD=${raw[3]}; DB_NAME=${raw[4]}
}

write_passfile() {
  local host=$1 port=$2 user=$3 password=$4 file=$5
  umask 077
  password=${password//\\/\\\\}
  password=${password//:/\\:}
  printf '%s:%s:*:%s:%s\n' "$host" "$port" "$user" "$password" > "$file"
  chmod 600 "$file"
}

source_passfile=$(mktemp)
target_passfile=$(mktemp)
dump=$(mktemp "$BACKUP_DIR/migration.XXXXXX.dump")
trap 'rm -f "$source_passfile" "$target_passfile" "$dump"' EXIT

read_connection "$SOURCE_DATABASE_URL"
write_passfile "$DB_HOST" "$DB_PORT" "$DB_USER" "$DB_PASSWORD" "$source_passfile"
source_host=$DB_HOST; source_port=$DB_PORT; source_user=$DB_USER; source_name=$DB_NAME
read_connection "$TARGET_DATABASE_URL"
write_passfile "$DB_HOST" "$DB_PORT" "$DB_USER" "$DB_PASSWORD" "$target_passfile"

printf 'Exporting schema/data to a temporary backup outside the repository...\n'
PGPASSFILE="$source_passfile" pg_dump --host="$source_host" --port="$source_port" --username="$source_user" \
  --dbname="$source_name" --format=custom --no-owner --no-acl --file="$dump"
printf 'Restoring into target %s/%s; this is destructive.\n' "$DB_HOST" "$DB_NAME"
PGPASSFILE="$target_passfile" pg_restore --clean --if-exists --no-owner --no-acl \
  --host="$DB_HOST" --port="$DB_PORT" --username="$DB_USER" --dbname="$DB_NAME" "$dump"
printf 'Migration complete. Run application smoke tests before switching DATABASE_URL.\n'
