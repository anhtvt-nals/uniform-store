# Status and roadmap

State as of 2026-07-26, HEAD `dc2faa6`. Derived from reading the source, not from the
older trackers — `.ai/progress.md` and `.ai/tasks.md` are frozen at ~2026-07-14 and
substantially understate what exists (see bugs.md B-009).

---

## Where the project actually is

Deployed and running on a VPS behind nginx with SSL, four PM2 processes, CI type-checking
and CD auto-deploying on merge to `main`. The bulk of the platform is built. The open
work is concentrated in three places: the GraphQL compatibility layer, deploy/migration
reliability, and test coverage.

### Backend — built

| Area | State |
|---|---|
| NestJS monorepo, 2 apps + 3 libs | Done |
| 37 TypeORM entities, 37 SQL migrations | Done — `036`/`037` repaired 2026-07-26, not yet applied on the VPS |
| Auth: customer JWT + admin JWT, both bcrypt | Done |
| Guards / interceptors / filters / DTO validation | Done |
| Storefront: products, collections, brands, search, cart, checkout, orders, account, articles, pages | Done |
| Storefront: inquiries, quote-requests, customer-contracts | Done |
| Admin: products (+ variants, options, images), collections, brands, facets | Done |
| Admin: inventory with stock history + transactional writes | Done |
| Admin: orders, customers, dashboard, activity-logs, permissions | Done |
| Admin: articles, promotions, shipping, payment, settings, uploads | Done |
| GraphQL compat proxy (`POST /shop-api`, ~44 operations) | Done |
| S3 storage + presigned uploads + asset gallery | Done |
| In-memory LRU cache | Done |
| Redis cache | Written (`redis-cache.service.ts`), not wired |
| Swagger / OpenAPI | Done |

### Frontends — built

| Area | State |
|---|---|
| Storefront: full catalog, cart, checkout, account, news, static pages | Done |
| Storefront: B2B landing page (hero, trust bar, capability, case studies, pricing, CTAs) | Done, 2026-07-25 |
| Storefront: i18n vi/en/de via next-intl | Done |
| Storefront: quote-request form (responsive) | Done, `98c7ed2` |
| Admin: 20 dashboard sections incl. quotes, contracts, inquiries | Done |
| Admin: CKEditor rich text, react-query data layer, auth + token refresh | Done |

### Infrastructure — built

Docker Postgres + MinIO, nginx reverse proxy with the `storage.` subdomain, GitHub
Actions CI (typecheck ×3 workspaces) and CD (SSH → `deploy.sh`), PM2 process management,
migration runner with a `schema_migrations` table, VPS provisioning script.

---

## In flight

**Storage keys instead of URLs.** Started 2026-07-26 (`084f8e9`).

Code side complete: `StorageUrlInterceptor` is registered in `SharedModule` and applied
globally in both apps.

Migration chain repaired 2026-07-26. `036` and `037` had never applied — they referenced
`customer_contracts.image_url` and `assets.preview_url`, neither of which exists. Fixed
in place (they had never run anywhere, so the append-only rule did not apply) and
verified against a live database inside a rolled-back transaction: both files execute
clean, and the converted `product_images.url` / `assets.url` values match the
independently-stored `assets.key` column exactly. `037` additionally had to strip the
**bucket** segment, not just `scheme://host/` — see decisions D-010. `contractImageUrl`
was added to the interceptor's field whitelist so contract images survive the conversion.

Still open before this can be called done:

1. Run `npm run migration:run` on the VPS and confirm `migration:status` shows 0 pending.
2. **First** confirm `STORAGE_PUBLIC_URL` in the live `backend/.env` ends with the bucket
   (`/uniform-store`). On a host provisioned by `setup-vps.sh` it does not, and the
   conversion will 404 every image — bugs.md B-011.
3. Fix `uploadFile()` so direct uploads stop writing absolute URLs back into the database
   — bugs.md B-012. Until then the data drifts back to mixed state.

---

## Next

Ordered by what unblocks the most.

### 1. Make deploys tell the truth
Remove the `|| echo "continuing"` swallowing on the frontend builds and the migration step
in `.github/scripts/deploy.sh` (bugs.md B-002), so a broken build or a failed migration
fails the deploy instead of silently serving the previous version.

### 2. Restore the test gate
Fix the failing suites (missing mock providers, at least one empty spec file), then
uncomment the `test-backend` job in `.github/workflows/ci.yml`. Right now nothing but
`tsc --noEmit` stands between a bad merge and production.

### 3. Tighten CORS
Settle on one variable name, wire `app.corsOrigins` through both `main.ts` files, and set
real origins per environment (bugs.md B-003).

### 4. Retire the GraphQL compatibility proxy
The big one, and the one that pays down the most complexity. Replace
`storefront/src/lib/vendure/*` with a REST client against `/api/v1/*`, migrate the server
actions, then delete `apps/storefront-api/src/shop-api/` and the `vendure-*` naming
(cookie, env vars, directory). Do it endpoint-group by endpoint-group — the proxy and a
REST client can coexist during the transition. Follow the frontend-first rule in
`AGENTS.md`: match the shape the component already expects before changing any contract.

### 5. Fix image host configuration
Add the real storage host to `remotePatterns` in both `next.config.ts` files and drop the
dead `supabase.co` / `storage.example.com` / Vendure demo entries (bugs.md B-004).

### 6. Correct the onboarding docs
Root `README.md` still describes a Vendure layout that no longer exists (bugs.md B-008).

---

## Backlog — not started, no committed date

- Redis cache: swap `MemoryCacheService` for the already-written `RedisCacheService`.
- Request-ID tracing through the logging interceptor.
- Real payment gateway integration — `payment_methods` is seeded with COD, bank transfer,
  MoMo and VNPay, but only as selectable records; there is no gateway wiring.
- Email delivery: `MailService` exists and reads `SMTP_*`, but SMTP is unconfigured on the
  VPS, so password-reset and quote-notification mail does not currently send.
- `reviews`, `wishlists` and `banners` tables (migrations `010`–`012`) have no entities and
  no code. Either build them or drop the tables.
- Rate-limit tiers: `AUTH_THROTTLE_LIMIT` / `SEARCH_THROTTLE_LIMIT` / `CART_THROTTLE_LIMIT`
  are documented in `.env.example` but unused; the real policy is a flat 60 req/min.
- E2E tests for the checkout and quote-request funnels.
- Performance and security audits (never started).

---

## Keeping this file honest

Update it when a phase moves, not per commit. If you finish something on the "Next" list,
move it into the status tables above and delete it here; if you discover new work, add it
with enough context that the next session knows why it matters. When status here and in
`.ai/progress.md` disagree, **this file wins** — that one is not maintained.
