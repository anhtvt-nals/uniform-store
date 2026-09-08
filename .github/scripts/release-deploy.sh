#!/usr/bin/env bash
# Atomic release deployment shared by deploy.sh and rebuild.sh.
# Builds never touch the currently served release. Once all builds and
# migrations succeed, the `current` symlink is switched in one filesystem
# operation and PM2 is started from that immutable release directory.
set -euo pipefail

MODE="${1:?Usage: release-deploy.sh <full|fast>}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(git -C "${SCRIPT_DIR}/../.." rev-parse --show-toplevel)"
RELEASES_DIR="${APP_DIR}/releases"
CURRENT_LINK="${APP_DIR}/current"
KEEP_RELEASES=5

load_node() {
    if command -v npm >/dev/null 2>&1; then
        return
    fi

    export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
    if [ -s "${NVM_DIR}/nvm.sh" ]; then
        # shellcheck disable=SC1090
        . "${NVM_DIR}/nvm.sh"
    fi

    if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
        echo "Node.js 22 and npm are required but were not found in PATH."
        exit 1
    fi
}

wait_for_http() {
    local url="$1"
    local label="$2"
    for _ in {1..30}; do
        if curl --fail --silent --show-error "${url}" >/dev/null; then
            echo "✓ ${label} is healthy"
            return 0
        fi
        sleep 2
    done
    echo "${label} did not become healthy: ${url}"
    return 1
}

fetch_origin_main() {
    local attempt
    local wait_seconds

    for attempt in 1 2 3; do
        # Some VPS providers/firewalls block outbound port 22. GitHub exposes
        # its SSH service on ssh.github.com:443 specifically for that case.
        # HostKeyAlias keeps an existing github.com entry in known_hosts valid,
        # while the user's Host github.com settings still supply the deploy key.
        if origin_uses_github_ssh; then
            echo "Fetching GitHub origin through SSH port 443..."
            if timeout 45s git -c core.sshCommand='ssh -o HostName=ssh.github.com -o Port=443 -o HostKeyAlias=github.com -o BatchMode=yes' fetch --prune origin main; then
                return 0
            fi
            echo "GitHub SSH over port 443 failed; trying the configured origin connection..." >&2
        fi

        if timeout 45s git fetch --prune origin main; then
            return 0
        fi

        if [ "${attempt}" -lt 3 ]; then
            wait_seconds=$((attempt * 10))
            echo "GitHub is temporarily unreachable. Retrying in ${wait_seconds}s (${attempt}/3)..." >&2
            sleep "${wait_seconds}"
        fi
    done

    echo "Cannot fetch origin/main after 3 attempts. Check VPS outbound access to ssh.github.com:443 (or the configured GitHub remote), DNS, and the deploy key, then rerun the deployment." >&2
    return 1
}

origin_uses_github_ssh() {
    local origin_url
    origin_url="$(git remote get-url origin 2>/dev/null || true)"
    [[ "${origin_url}" =~ ^git@github\.com: ]] || [[ "${origin_url}" =~ ^ssh://git@github\.com([:/]|$) ]]
}

link_persistent_env() {
    local release_dir="$1"
    local env_file

    for env_file in .env storefront/.env.local admin/.env.local; do
        if [ ! -s "${APP_DIR}/${env_file}" ]; then
            echo "Missing required deployment configuration: ${APP_DIR}/${env_file}"
            exit 1
        fi
        ln -sfn "${APP_DIR}/${env_file}" "${release_dir}/${env_file}"
    done
}

switch_current_release() {
    local target="$1"
    local next_link="${CURRENT_LINK}.next"
    ln -sfn "${target}" "${next_link}"
    mv -Tf "${next_link}" "${CURRENT_LINK}"
}

start_service() {
    local name="$1"
    local kind="$2"
    local path="$3"
    local cwd="$4"
    local port="${5:-}"

    pm2 delete "${name}" >/dev/null 2>&1 || true
    if [ "${kind}" = "node" ]; then
        pm2 start "${path}" --name "${name}" --cwd "${cwd}" --time
    else
        pm2 start npm --name "${name}" --cwd "${cwd}" --time -- start -- -p "${port}"
    fi
}

start_release() {
    local release_dir="$1"
    start_service uniform-storefront-api node "${release_dir}/backend/dist/apps/storefront-api/main.js" "${release_dir}/backend"
    start_service uniform-admin-api node "${release_dir}/backend/dist/apps/admin-api/main.js" "${release_dir}/backend"
    start_service uniform-storefront next "" "${release_dir}/storefront" 3001
    start_service uniform-admin next "" "${release_dir}/admin" 5002
}

verify_release() {
    wait_for_http http://127.0.0.1:3000/health "Storefront API"
    wait_for_http http://127.0.0.1:3002/api/v1/admin/health "Admin API"
    wait_for_http http://127.0.0.1:3001 "Storefront"
    wait_for_http http://127.0.0.1:5002 "Admin UI"
    # Exercises a dynamic Admin App Router route, where stale Next chunks were
    # previously observed, without requiring an authenticated API request.
    wait_for_http http://127.0.0.1:5002/categories/release-healthcheck "Admin dynamic route"
}

prune_releases() {
    local -a release_dirs=()
    local release

    mapfile -t release_dirs < <(find "${RELEASES_DIR}" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -nr | cut -d' ' -f2-)
    if [ "${#release_dirs[@]}" -le "${KEEP_RELEASES}" ]; then
        return
    fi

    for release in "${release_dirs[@]:${KEEP_RELEASES}}"; do
        rm -rf -- "${release}"
    done
}

load_node
cd "${APP_DIR}"

if [ "${MODE}" != "full" ] && [ "${MODE}" != "fast" ]; then
    echo "Unknown deployment mode: ${MODE}"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Preparing atomic ${MODE} release"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

previous_ref="$(git rev-parse HEAD)"
fetch_origin_main
target_ref="origin/main"

if [ "${MODE}" = "fast" ] && ! git diff --quiet "${previous_ref}" "${target_ref}" -- package-lock.json backend/migrations; then
    echo "Dependencies or migrations changed. Run .github/scripts/deploy.sh instead."
    exit 1
fi

git reset --hard "${target_ref}"

current_dir="${APP_DIR}"
had_current_link=false
if [ -L "${CURRENT_LINK}" ]; then
    current_dir="$(readlink -f "${CURRENT_LINK}")"
    had_current_link=true
fi

release_id="$(git rev-parse --short=12 "${target_ref}")-$(date -u +%Y%m%d%H%M%S)"
release_dir="${RELEASES_DIR}/${release_id}"
mkdir -p "${RELEASES_DIR}"
git worktree add --detach "${release_dir}" "${target_ref}"

release_activated=false
cleanup_failed_release() {
    local exit_code=$?
    trap - EXIT
    if [ "${exit_code}" -ne 0 ]; then
        if [ "${release_activated}" = true ]; then
            echo "Release activation failed; restoring the previous release..." >&2
            if [ "${had_current_link}" = true ]; then
                switch_current_release "${current_dir}"
                start_release "${CURRENT_LINK}" || true
            else
                rm -f "${CURRENT_LINK}"
                start_release "${APP_DIR}" || true
            fi
        fi
        if [ -d "${release_dir}" ]; then
            git worktree remove --force "${release_dir}" >/dev/null 2>&1 || rm -rf -- "${release_dir}"
        fi
    fi
    exit "${exit_code}"
}
trap cleanup_failed_release EXIT

link_persistent_env "${release_dir}"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"

if [ "${MODE}" = "full" ]; then
    echo "📦 Installing dependencies in release..."
    (cd "${release_dir}" && npm ci --workspaces --prefer-offline --no-audit --no-fund)
else
    if [ ! -d "${current_dir}/node_modules" ]; then
        echo "No node_modules found in the active release. Run .github/scripts/deploy.sh once."
        exit 1
    fi
    echo "📦 Reusing dependencies from the active release..."
    cp -a "${current_dir}/node_modules" "${release_dir}/node_modules"
fi

echo "🔨 Building backend..."
(cd "${release_dir}/backend" && npx nest build storefront-api && npx nest build admin-api)
echo "🔨 Building storefront..."
(cd "${release_dir}/storefront" && npm run build)
echo "🔨 Building admin..."
(cd "${release_dir}/admin" && npm run build)

if [ "${MODE}" = "full" ]; then
    echo "🗄️  Running migrations..."
    (cd "${release_dir}/backend" && npm run migration:run)
fi

echo "🔄 Activating release ${release_id}..."
switch_current_release "${release_dir}"
release_activated=true
start_release "${CURRENT_LINK}"
verify_release
pm2 save
prune_releases

trap - EXIT
echo "✅ Atomic release ${release_id} is active."
