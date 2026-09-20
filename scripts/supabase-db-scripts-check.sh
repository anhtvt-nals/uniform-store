#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

bash -n \
  "$ROOT_DIR/scripts/install-supabase-self-host.sh" \
  "$ROOT_DIR/scripts/migrate-supabase-cloud-db.sh"
grep -F 'containerd.io is installed' "$ROOT_DIR/scripts/install-supabase-self-host.sh" >/dev/null

output=$(INSTALL_DIR=/tmp/supabase-self-host-check \
  "$ROOT_DIR/scripts/install-supabase-self-host.sh")
grep -F 'Dry run:' <<<"$output" >/dev/null
grep -F -- '--apply' <<<"$output" >/dev/null
grep -F 'dashboard' <<<"$output" >/dev/null

if SOURCE_DATABASE_URL='postgres://user:pass@cloud.example/db' \
  TARGET_DATABASE_URL='postgres://user:pass@self.example/db' \
  "$ROOT_DIR/scripts/migrate-supabase-cloud-db.sh" >/tmp/supabase-migrate-check.out 2>&1; then
  echo 'migration must require --confirm' >&2
  exit 1
fi
grep -F -- '--confirm is required' /tmp/supabase-migrate-check.out >/dev/null
rm -f /tmp/supabase-migrate-check.out

echo 'supabase script checks passed'
