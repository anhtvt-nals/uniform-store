#!/usr/bin/env bash
set -Eeuo pipefail

INSTALL_DIR="${INSTALL_DIR:-/opt/supabase}"
SUPABASE_REF="${SUPABASE_REF:-master}"
APPLY=false
START=false
MODE=dashboard

die() { printf '[supabase-install] ERROR: %s\n' "$*" >&2; exit 1; }
usage() { printf 'Usage: sudo INSTALL_DIR=/opt/supabase SUPABASE_REF=master %s [--apply] [--start] [--database-only] [--full]\n' "$0"; }

while (($#)); do
  case "$1" in
    --apply) APPLY=true; shift ;;
    --start) START=true; shift ;;
    --database-only) MODE=database; shift ;;
    --full) MODE=full; shift ;;
    -h|--help) usage; exit 0 ;;
    *) usage >&2; die "unknown option: $1" ;;
  esac
done

[[ "$INSTALL_DIR" == /* && "$INSTALL_DIR" != / ]] || die 'INSTALL_DIR must be an absolute directory'
if ! $APPLY; then
  printf 'Dry run: install official Supabase Compose ref %s into %s (%s)\n' \
    "$SUPABASE_REF" "$INSTALL_DIR" "$MODE"
  printf 'Re-run with --apply to install files; add --start to start after review.\n'
  exit 0
fi

[[ "$EUID" -eq 0 ]] || die 'run --apply with sudo/root'
command -v apt-get >/dev/null || die 'Ubuntu/Debian apt-get is required'
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y ca-certificates git docker.io
if ! docker compose version >/dev/null 2>&1; then
  DEBIAN_FRONTEND=noninteractive apt-get install -y docker-compose-plugin || die 'Docker Compose v2 is required'
fi

parent=$(dirname "$INSTALL_DIR")
mkdir -p "$parent"
if [[ -d "$INSTALL_DIR" ]] && find "$INSTALL_DIR" -mindepth 1 -print -quit | grep -q .; then
  die "INSTALL_DIR is not empty: $INSTALL_DIR"
fi
tmp=$(mktemp -d "${parent}/.supabase-source.XXXXXX")
trap 'rm -rf "$tmp"' EXIT
git clone --depth 1 --branch "$SUPABASE_REF" --filter=blob:none --sparse \
  https://github.com/supabase/supabase.git "$tmp/source"
git -C "$tmp/source" sparse-checkout set docker
mkdir -p "$INSTALL_DIR"
cp -a "$tmp/source/docker/." "$INSTALL_DIR/"
cd "$INSTALL_DIR"
[[ -f .env.example ]] || die 'official repository has no docker/.env.example'
[[ -f .env ]] || { cp .env.example .env; chmod 600 .env; }
printf 'ref=%s\n' "$SUPABASE_REF" > .supabase-version

if $START; then
  if [[ "$MODE" == database ]]; then
    docker compose up -d --wait db
  elif [[ "$MODE" == dashboard ]]; then
    docker compose up -d --wait db meta studio
  else
    docker compose up -d --wait
  fi
  docker compose ps
else
  if [[ "$MODE" == database ]]; then
    printf 'Installed files at %s; review .env, then run: cd %s && docker compose up -d --wait db\n' "$INSTALL_DIR" "$INSTALL_DIR"
  elif [[ "$MODE" == dashboard ]]; then
    printf 'Installed files at %s; review .env, then run: cd %s && docker compose up -d --wait db meta studio\n' "$INSTALL_DIR" "$INSTALL_DIR"
  else
    printf 'Installed files at %s; review .env, then run: cd %s && docker compose up -d --wait\n' "$INSTALL_DIR" "$INSTALL_DIR"
  fi
fi
