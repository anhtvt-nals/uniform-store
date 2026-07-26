# Known issues

Audited 2026-07-26 against HEAD `dc2faa6`. Each entry says how it was established:
**Verified** = read directly in the source this session.
**Reported** = documented elsewhere in the repo, not independently re-run.

Nothing here has been fixed by writing this file — it is a map, not a changelog.

---

## Critical

### B-011 · `setup-vps.sh` writes a `STORAGE_PUBLIC_URL` with no bucket segment — **Verified**

`.github/scripts/setup-vps.sh` generates `STORAGE_PUBLIC_URL=https://storage.${DOMAIN}`,
and the nginx block it writes proxies `storage.${DOMAIN}/` straight to
`http://127.0.0.1:9000` — MinIO's root. MinIO at root resolves the **first path segment
as the bucket name**, so a working object URL must be
`https://storage.domain/uniform-store/<key>`.

S3 keys produced by `uploads.service.ts` are bucket-less (`products/<id>/<uuid>-<name>.jpg`,
`uploads/<uuid>-<name>.jpg`). So `buildPublicUrl()` yields
`https://storage.domain/products/...`, and MinIO looks for a bucket called `products` →
404 `NoSuchBucket`.

This was **masked** until now: every row held an absolute URL that already contained the
bucket, and `StorageUrlInterceptor` passes absolute URLs through untouched. Once migration
`037` converts those rows to bare keys, the interceptor starts building URLs from
`STORAGE_PUBLIC_URL`, and on any host provisioned by `setup-vps.sh` every image 404s.

Fix: `STORAGE_PUBLIC_URL` must end with the bucket — `https://storage.${DOMAIN}/uniform-store`
— or the nginx block must rewrite the bucket into the upstream path. Check the value in
the live `backend/.env` on the VPS **before** running `037` there; `backend/.env` in this
checkout has the correct form (`http://102.129.168.20:9000/uniform-store`), but a host
provisioned by the script will not.

### B-012 · Direct multipart upload still stores absolute URLs — **Verified**

`uploads.service.ts` has two upload paths that disagree:

- `confirmUpload()` (presigned flow) stores `url: key` — a bare key, as D-010 intends.
- `uploadFile()` (direct multipart, `POST /uploads/upload`) stores
  `url: publicUrl` — a fully-qualified URL — into `AssetEntity`, and the same into
  `ProductImageEntity.url`, `category.imageUrl` and `brand.logoUrl`, despite the
  `// Store only key in DB` comment directly above it.

So every direct upload re-introduces a domain-pinned row, and the database drifts back
toward mixed state after `037` cleans it up. The interceptor's pass-through keeps these
rendering, so it fails silently. Note `AssetEntity` already stores the correct value in
its separate `key` column — only `url` is wrong.

Fix: store `key` rather than `publicUrl` in all four writes in `uploadFile()`, and keep
returning `publicUrl` in the HTTP response (callers expect a usable URL).

### B-002 · The deploy script hides its own failures — **Verified**

`.github/scripts/deploy.sh` wraps three steps in `|| echo "⚠️ ... continuing"`:

```
storefront build →  || echo "⚠️  Storefront build failed, continuing..."
admin build      →  || echo "⚠️  Admin build failed, continuing..."
migrations       →  || echo "⚠️  Migration skipped"
```

`set -e` is in effect for everything else, so the script exits 0 and GitHub Actions
reports a green deploy while PM2 restarts a **stale `.next` build** and the schema is
whatever it was before. This is why `036`/`037` sat failing for a week without anyone
noticing — a failed migration produces a green deploy. The frontends are also served from `.next` directories that survive
`git clean -fd` (they are gitignored), so a failed build leaves the previous version
running with no signal that anything went wrong.

### B-003 · CORS is effectively wide open on both APIs — **Verified**

Both `main.ts` files do:

```ts
app.enableCors({ origin: process.env.CORS_ORIGIN || '*', credentials: true })
```

`CORS_ORIGIN` (singular) appears in no `.env.example`, no compose file and no deploy
script. Every template and `libs/shared/src/config/app.config.ts` use `CORS_ORIGINS`
(plural) — and `app.corsOrigins` is **never read by anything**. So in practice both APIs
serve `Access-Control-Allow-Origin: *`, including the admin API on port 3002 which the
admin UI calls directly from the browser.

Mitigating: auth is bearer-token, not cookie-based, so `*` + `credentials: true` doesn't
open a session-riding path (browsers reject credentialed requests against `*` anyway).
Still, the admin API accepts cross-origin reads from any site, and the configured
allowlist silently does nothing. Fixing it means picking one variable name and wiring
`app.corsOrigins` through, in both apps and all env templates.

---

## Significant

### B-004 · Storefront `next/image` has no remote pattern for the production storage host — **Verified (config); effect not observed in a running app**

`storefront/next.config.ts` allows `readonlydemo.vendure.io`, `demo.vendure.io`,
`localhost`, `*.s3.amazonaws.com`, `*.s3.*.amazonaws.com`, `s3.amazonaws.com` and
`images.unsplash.com`. Production assets are served from `storage.electroai.shop`
(the host hard-coded in migration `036`) or whatever `STORAGE_PUBLIC_URL` is set to.
Neither is listed, and `next/image` hard-errors on an unconfigured hostname rather than
falling back. `product-card.tsx`, `product-image-carousel.tsx`, `navbar.tsx` and
`footer.tsx` all use `next/image`.

The admin app has the mirror-image problem: it allows `**.supabase.co` and
`storage.example.com` — a placeholder — but not the real storage host either.

Worth checking against a live page before assuming it's broken; if product images render
in production, something else is resolving them.

### B-005 · Backend test suite is failing and no longer gated — **Reported** (`setup.md`, `.github/workflows/ci.yml`)

`setup.md` records 5 failing suites (33 of 169 tests) caused by missing mock providers and
at least one empty test file. The CI job was commented out in `4d60311` so deploys
wouldn't block. There are 21 spec files on disk. `npx tsc --noEmit` is the only thing CI
actually enforces.

Not re-run this session — treat the 5/33 numbers as of ~2026-07-20, not as current.

### B-006 · `backend/.env.example` sets `DB_SSL` twice, with conflicting values — **Verified**

The file contains `DB_SSL=false` in the Database block and `DB_SSL=true` a few lines
later under an "Enable SSL (required for Supabase)" comment. dotenv takes the last
assignment, so anyone copying the template to `.env` gets `DB_SSL=true` — which fails
against the local Docker Postgres, since it has no TLS configured. Same file still
documents the removed Supabase auth variables (see decisions D-014).

### B-007 · Migration numbering has a collision and gaps — **Verified**

Two files share `009`: `009_create_admin_users.sql` and `009_create_coupons_discounts.sql`.
`019` and `024` don't exist. The runner sorts by filename and tracks by filename, so both
`009`s do run, in alphabetical order (`admin_users` before `coupons`) — it works today.
The hazard is that the number no longer identifies a migration, so "run everything after
009" is not a well-defined instruction, and a third `009_*` would silently interleave.

---

## Documentation drift

### B-008 · Root `README.md` describes a system that no longer exists — **Verified**

It documents an `apps/server` + `apps/storefront` Vendure layout, tells you to run
`npm run dev:server` (no such script), points at a Vendure Dashboard on
`localhost:3000/dashboard` and gives `superadmin/superadmin` credentials for it. The
actual layout is `backend/` + `storefront/` + `admin/`, and there is no Vendure server.
Anyone onboarding from the README will be wrong about everything.

### B-009 · `.ai/progress.md` and `.ai/tasks.md` are frozen at ~2026-07-14 — **Verified**

They mark cart, checkout, orders, account, articles, admin orders, admin customers,
admin dashboard and CI/CD as *pending*. All of those exist in the source today. Overall
completion is stated as "~50%", which is well under the truth.

`.ai/memory.md` (through 2026-07-25) and `.ai/database.md` are the reliable files in that
directory. `.ai/roadmap.md` is an unticked original plan, not a status report.

### B-010 · A VPS IP address is committed in several places — **Verified**

`102.129.168.20` appears in `admin/.env.example` (as a `NEXT_PUBLIC_ADMIN_API_URL` that is
then immediately overridden by a second `localhost` line in the same file) and in
`allowedDevOrigins` in both `storefront/next.config.ts` and `admin/next.config.ts`.
`storage.electroai.shop` is hard-coded into migrations `036` and `037`. None of these are
secrets, but they pin environment-specific values into tracked source.

---

## Fragile by design — not bugs, but read before you touch

- **`shop-api.service.ts` is 1700 lines of operation-name dispatch.** Every storefront
  contract lives there *and* in the underlying REST service. Change one, change both.
- **`DatabaseModule` lists entities explicitly** — no `autoLoadEntities`. A new entity not
  added to that array fails at runtime with a confusing "no metadata" error, not at build.
- **Every entity column needs `{ name: 'snake_case' }`.** Omitting it surfaces as
  `Cannot read properties of undefined (reading 'databaseName')` from inside TypeORM's
  paginated query builder, nowhere near the entity at fault (decisions D-019).
- **`configService.get()` needs the `app.` prefix.** Without it you get `undefined`
  silently, not an error (decisions D-022).
- **`deploy.sh` runs `git reset --hard origin/main && git clean -fd` on the VPS.**
  Uncommitted work there is destroyed. Gitignored files (`.env`, `.next/`, `node_modules/`)
  survive, since `git clean` without `-x` leaves ignored paths alone.
- **`ValidationPipe` uses `forbidNonWhitelisted`**, so sending a field the DTO doesn't
  declare is a 400 — a common cause of "my new form field breaks the request".
