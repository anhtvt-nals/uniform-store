#!/usr/bin/env bash
# Full atomic deployment: installs dependencies and runs migrations in a new
# release directory before making it live.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "${SCRIPT_DIR}/release-deploy.sh" full
