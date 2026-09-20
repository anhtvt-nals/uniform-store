# Supabase Self-host Switch Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

Goal: Add safe, opt-in tools and documentation to export PostgreSQL from Supabase Cloud, prepare a Supabase self-host stack on the current VPS, restore the dump, and switch or rollback the PM2 applications without running production actions automatically.

Architecture: Keep application deployment unchanged. Add three standalone Bash scripts under scripts/ that communicate through an operator-selected backup directory and environment variables; setup prepares the official Supabase Compose files, export creates a pg_dump custom archive, and restore requires explicit confirmation. Document switching by changing the existing root .env and DB_SSL, then using the existing release deploy commands.

Tech Stack: Bash, Docker Compose, PostgreSQL pg_dump/pg_restore, sha256sum (or shasum -a 256 on macOS), existing PM2/release scripts, Markdown.

Spec: docs/superpowers/specs/2026-09-20-supabase-selfhost-switch-design.md

## Global Constraints

- Do not SSH, run Docker, export data, restore data, or edit production .env during implementation.
- Setup defaults to dry-run and requires --apply for filesystem/Compose changes.
- Restore requires --confirm; no destructive database command runs without that flag.
- Secrets come from environment or an operator-owned file outside Git, never from command-line arguments or hard-coded values.
- PostgreSQL application data only; do not migrate Supabase Auth or Supabase Storage.
- Scripts use set -Eeuo pipefail and fail on missing commands, variables, files, checksum mismatches, and occupied ports.

## Review Focus

- Missing or malformed source/target database URL: scripts fail before creating files or opening connections (Task 2/3 tests).
- Backup corruption or wrong checksum: restore refuses to call pg_restore (Task 3 test).
- Missing --apply/--confirm: setup and restore print the required flag and exit non-zero (Task 1/3 tests).
- Existing ports or missing Docker/Compose: setup reports the exact prerequisite and exits without changing the VPS (Task 1 test).
- Switch smoke test failure: operator can restore the previous Cloud URL and restart the existing release (Task 4 rollback checklist).

---

### Task 1: Self-host setup and operator configuration

Files:
- Create: scripts/supabase-selfhost-setup.sh
- Create: scripts/supabase-selfhost.env.example
- Test: scripts/supabase-selfhost-setup-check.sh

Interfaces:
- Consumes: SUPABASE_DIR (default /opt/supabase), SUPABASE_COMPOSE_REF, SUPABASE_DOMAIN, SUPABASE_DB_PASSWORD, and --apply.
- Produces: a dry-run/apply setup command that clones the official Supabase self-host Compose repository at the selected ref, writes an operator-owned env file with mode 600, and reports required ports without starting containers.

- [ ] Step 1: Write failing shell checks. Assert that no --apply exits non-zero, output contains --apply, and a fake-command PATH proves dry-run never calls docker compose up.
- [ ] Step 2: Run bash scripts/supabase-selfhost-setup-check.sh. Expected: FAIL because the setup script does not exist.
- [ ] Step 3: Implement usage, require_command, check_ports, and render_env. Parse only --apply and --dir DIR; reject unknown options. Dry-run prints clone path, Compose ref, env path, and ports. Apply creates the directory, clones or updates the official repository at SUPABASE_COMPOSE_REF, writes the env file with umask 077, and stops before docker compose up.
- [ ] Step 4: Run bash scripts/supabase-selfhost-setup-check.sh and bash -n scripts/supabase-selfhost-setup.sh. Expected: PASS.
- [ ] Step 5: Commit with git add scripts/supabase-selfhost-setup.sh scripts/supabase-selfhost.env.example scripts/supabase-selfhost-setup-check.sh && git commit -m "ops: add guarded Supabase self-host setup".

### Task 2: Cloud PostgreSQL export

Files:
- Create: scripts/supabase-cloud-export.sh
- Test: scripts/supabase-cloud-export-check.sh

Interfaces:
- Consumes: SOURCE_DATABASE_URL, optional BACKUP_DIR, optional BACKUP_LABEL, and --source-file FILE for an operator-owned env file; never accepts a URL argument.
- Produces: BACKUP_DIR/BACKUP_LABEL.dump, its .sha256 checksum, and metadata containing UTC timestamp, pg_dump version, and source host without the password.

- [ ] Step 1: Write failing shell checks asserting unset URL rejection, repository-path rejection, pg_dump --format=custom --no-owner --no-acl invocation, and checksum creation after a fake pg_dump.
- [ ] Step 2: Run bash scripts/supabase-cloud-export-check.sh. Expected: FAIL because the export script does not exist.
- [ ] Step 3: Implement with umask 077 and a temporary file in BACKUP_DIR; run pg_dump --dbname="$SOURCE_DATABASE_URL" --format=custom --no-owner --no-acl, atomically rename the dump, and write sha256sum. Refuse paths below the repository root and print only label/path.
- [ ] Step 4: Run bash scripts/supabase-cloud-export-check.sh and bash -n scripts/supabase-cloud-export.sh. Expected: PASS.
- [ ] Step 5: Commit with git add scripts/supabase-cloud-export.sh scripts/supabase-cloud-export-check.sh && git commit -m "ops: add Supabase Cloud database export".

### Task 3: Self-host restore with confirmation and integrity checks

Files:
- Create: scripts/supabase-selfhost-restore.sh
- Test: scripts/supabase-selfhost-restore-check.sh

Interfaces:
- Consumes: TARGET_DATABASE_URL, BACKUP_DIR, a dump label, and --confirm; accepts --target-file FILE for an operator-owned env file.
- Produces: a verified restore using pg_restore --clean --if-exists --no-owner --no-acl --dbname="$TARGET_DATABASE_URL"; no restore occurs without --confirm.

- [ ] Step 1: Write failing checks asserting missing --confirm, missing dump, and checksum mismatch all exit non-zero without invoking pg_restore; a valid fake dump invokes it exactly once.
- [ ] Step 2: Run bash scripts/supabase-selfhost-restore-check.sh. Expected: FAIL because the restore script does not exist.
- [ ] Step 3: Validate label/path, run sha256sum --check or shasum -a 256 -c, require --confirm, then invoke pg_restore. Add --dry-run output showing target host/database and dump path without connecting.
- [ ] Step 4: Run bash scripts/supabase-selfhost-restore-check.sh and bash -n scripts/supabase-selfhost-restore.sh. Expected: PASS.
- [ ] Step 5: Commit with git add scripts/supabase-selfhost-restore.sh scripts/supabase-selfhost-restore-check.sh && git commit -m "ops: add confirmed Supabase self-host restore".

### Task 4: Switch and rollback documentation

Files:
- Create: docs/SUPABASE_SELF_HOST_SWITCH.md
- Create: scripts/supabase-selfhost-switch-doc-check.sh
- Modify: DEPLOY.md (link only; do not retain credentials or add secrets)

Interfaces:
- Consumes: the three scripts, .github/scripts/deploy.sh, .github/scripts/rebuild.sh, backend migration commands, and PM2 service names.
- Produces: an operator checklist for Cloud to self-host and self-host to Cloud rollback.

- [ ] Step 1: Write failing documentation checks for export, restore, DB_SSL=false, pm2 stop, smoke-test, rollback, npm run migration:status, and absence of real credentials.
- [ ] Step 2: Run bash scripts/supabase-selfhost-switch-doc-check.sh. Expected: FAIL because the document and check do not exist.
- [ ] Step 3: Document preflight backup/disk checks, setup dry-run/apply, manual Compose review/start, restore with --confirm, maintenance window, backup of the Cloud URL outside Git, root .env update to self-host URL and DB_SSL=false, migration status, health checks, rebuild, product/article/admin/cart/order/asset smoke tests, and rollback by restoring Cloud URL plus DB_SSL=true. State that scripts do not edit production files automatically and credentials must be rotated if exposed.
- [ ] Step 4: Link the document under the database section of DEPLOY.md; run the doc check and git diff --check; inspect the diff for secrets.
- [ ] Step 5: Commit with git add docs/SUPABASE_SELF_HOST_SWITCH.md DEPLOY.md scripts/supabase-selfhost-switch-doc-check.sh && git commit -m "docs: document Supabase self-host switch and rollback".

### Task 5: Final verification and handoff

Files:
- Modify: .ai/memory.md (append deployment decision and script locations)

- [ ] Step 1: Run bash -n on all three scripts, all four check scripts, and git diff --check. Expected: every check passes; no Docker, database connection, SSH, or production .env mutation occurs.
- [ ] Step 2: Record in project memory that tooling is opt-in, PostgreSQL-only, and Cloud remains the rollback source until smoke tests pass.
- [ ] Step 3: Commit with git add .ai/memory.md && git commit -m "docs: record Supabase self-host tooling policy".

