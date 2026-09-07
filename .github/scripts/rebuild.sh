#!/usr/bin/env bash
# Fast atomic deployment: reuses dependencies from the active release and
# refuses commits that modify dependencies or migrations.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "${SCRIPT_DIR}/release-deploy.sh" fast
