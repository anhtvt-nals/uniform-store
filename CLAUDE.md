# CLAUDE.md — uniform-store

Guidance for Claude Code sessions working in this repository.

**Project**: Minh An Uniform — a Vietnamese B2B corporate-uniform ecommerce platform
(áo thun, áo sơ mi, đồng phục công sở). Storefront sells to businesses; the primary
conversion is a **quote request**, not a card checkout.

---

## 1. Repository layout

npm workspaces monorepo. Three workspaces, four running services.

```
uniform-store/
├── backend/          # NestJS monorepo — 2 API apps + 3 shared libs
│   ├── apps/storefront-api/    # public API, port 3000
│   ├── apps/admin-api/         # admin API,  port 3002
│   ├── libs/common/            # guards, interceptors, filters, decorators, DTOs
│   ├── libs/database/          # TypeORM entities + data source
│   ├── libs/shared/            # storage (S3), cache, config, mail
│   ├── migrations/             # 37 raw .sql files, run by a custom runner
│   └── scripts/run-migrations.ts
├── storefront/       # Next.js 16 public site, port 3001 (next-intl: vi/en/de)
├── admin/            # Next.js 16 admin dashboard, port 5002 (no i18n routing)
└── .github/          # CI (typecheck) + CD (SSH → VPS → deploy.sh)
```

`backend/` is *both* an npm workspace root (`libs/*`, `apps/*`) and a NestJS monorepo
(`nest-cli.json`, 5 projects). Building is done with `nest build <project>`, not `tsc`.

## 2. Detailed memory files

Read the one relevant to your task before making changes:

| File | Contents |
|---|---|
| `.claude/memory/architecture.md` | Services, ports, request flows, module map, data model, auth, storage |
| `.claude/memory/decisions.md` | Why things are the way they are — including decisions that were **reversed** |
| `.claude/memory/bugs.md` | Known broken/fragile things. **Check here before debugging anything.** |
| `.claude/memory/roadmap.md` | What is done, what is in flight, what is next |

These files are maintained, not archival — read them before coding and update them when
you are done. The workflow is in §7.

There is also a pre-existing `.ai/` directory (written by a different tooling setup)
with deep reference material: `.ai/database.md` (full schema + ERD), `.ai/api.md` and
`.ai/openapi.yaml` (endpoint reference), `.ai/memory.md` (long-form changelog).
Those are **useful but partly stale** — see §6. `AGENTS.md` points at `.ai/memory.md`.

## 3. Commands

Run from the repo root unless noted.

```bash
npm run dev              # all three workspaces concurrently
npm run dev:backend      # both NestJS apps in watch mode
npm run dev:storefront   # Next.js storefront on :3001
npm run dev:admin        # Next.js admin on :5002

npm run build            # backend → storefront → admin
```

Inside `backend/`:

```bash
npm run lint             # eslint --fix over apps/ and libs/
npx tsc --noEmit         # what CI actually gates on
npm test                 # jest — several suites currently fail, see bugs.md
npm run migration:status # applied vs pending .sql files
npm run migration:run    # apply pending only
```

Type-check in `storefront/` is `npm run check-types`; `admin/` has no such script —
use `npx tsc --noEmit`.

## 4. Conventions

**TypeScript / backend (NestJS)**
- Prettier: single quotes, trailing commas, 100 cols, 2-space indent, semicolons.
- Module per feature: `x.module.ts`, `x.controller.ts`, `x.service.ts`, `dto/`.
- Controllers stay thin — no business logic, no repository access.
- DTOs are classes with `class-validator` decorators; never return TypeORM entities
  straight out of a controller. Global `ValidationPipe` uses
  `whitelist + forbidNonWhitelisted + transform`, so an undeclared body field is a 400.
- Constructor injection only. No module-level mutable state.
- `@typescript-eslint/no-explicit-any` is off in config, but new code should avoid `any`.
- Path aliases: `@app/common`, `@app/database`, `@app/shared`. Use them; relative
  imports across app/lib boundaries break the webpack build.

**Database**
- Every entity column needs an explicit `{ name: 'snake_case' }`. The DB is snake_case,
  the entities are camelCase, and TypeORM will *not* infer it. Omitting it has already
  caused two production bugs (see bugs.md).
- In QueryBuilder `orderBy`/`where`, use the **entity property path** (`a.publishedAt`),
  not the raw column (`a.published_at`). Mixing them breaks paginated queries.
- `synchronize: false` everywhere. Schema changes are hand-written `.sql` files in
  `backend/migrations/`, numbered `NNN_description.sql`, applied by
  `scripts/run-migrations.ts` (tracked in the `schema_migrations` table).
- Money is stored as **integers in cents**. Never floats.
- User-facing text is **JSONB keyed by locale**: `{ en, vi, de }`. Read it with a
  fallback chain — `name?.[locale] ?? name?.en ?? ''`.
- Soft delete via `@DeleteDateColumn({ name: 'deleted_at' })` on most entities.

**API shape**
- Success: `{ success: true, data, meta? }` (via `TransformInterceptor`).
- Error: `{ success: false, error: { code, message, details } }` (via `HttpExceptionFilter`).
- Storefront API sets **no global prefix** — each controller hardcodes
  `@Controller('api/v1/...')`. `/health`, `/ready` and `POST /shop-api` sit at the root.
- Admin API sets a global prefix of `api/v1/admin`, so its controllers are bare
  (`@Controller('products')` → `/api/v1/admin/products`).

**Frontend**
- Storefront: App Router, server components + server actions, `next-intl` with
  `/[locale]` prefix always present (`vi`, `en`, `de`; default `en`).
- Storefront talks to the backend over **GraphQL** at `POST /shop-api` (see §5), plus a
  handful of thin Next route handlers under `src/app/api/v1/*` that proxy REST calls
  for quote-requests, inquiries, customer-contracts and public settings.
- Admin: client components + `@tanstack/react-query`, plain REST through
  `admin/src/lib/api.ts` (`apiClient<T>`), bearer token in localStorage with a
  refresh-on-401 path.
- Both use Tailwind v4 + shadcn-style components in `src/components/ui`.

## 5. The single most important thing to understand

**The storefront was built against Vendure and still speaks Vendure GraphQL.**

The Vendure server is gone. In its place, `backend/apps/storefront-api/src/shop-api/`
is a 1700-line compatibility proxy: it accepts `{ query, variables }` at
`POST /shop-api`, parses the *operation name* out of the query string, dispatches to the
ordinary internal NestJS services, and reshapes the result into the exact Vendure
response shape the frontend expects. ~44 operations are mapped.

Consequences you must respect:
- Naming across the storefront still says "vendure" (`VENDURE_SHOP_API_URL`,
  `vendure-auth-token` cookie, `src/lib/vendure/*`). This is legacy naming over a
  custom backend — not an actual Vendure dependency.
- Changing a storefront-facing response shape means changing it in **two** places: the
  REST service *and* the shop-api shaping code.
- Auth token is returned in the `vendure-auth-token` response header and sent back as
  `Authorization: Bearer <token>`.
- Replacing this proxy with a real REST client is the largest outstanding piece of work.

`AGENTS.md` states a **frontend-first rule** that still applies: find the component
consuming the data first, match its expected shape, and only change the contract with a
documented reason.

## 6. Working rules for this repo

1. **Read `.claude/memory/bugs.md` before debugging.** Several failure modes here look
   like new bugs but are known and documented (storage URLs, failing migrations,
   silently-swallowed build failures in CI).
2. **Managed infrastructure:** database access requires Supabase `DATABASE_URL`; uploads
   require Cloudflare R2 `R2_*` credentials. No local Docker services are available.
3. `.ai/progress.md`, `.ai/tasks.md` and `.ai/roadmap.md` are frozen around 2026-07-14
   and understate what is built (they list cart/checkout/orders/dashboard as pending;
   all exist). `.ai/memory.md` is current to ~2026-07-25 and is reliable.
   `.claude/memory/roadmap.md` reflects the state as of 2026-07-26.
4. **Never commit `.env` files.** Only `.env.example` files are tracked. Backend and
   migration tooling load the shared root `.env`; frontend-local `.env.local` files are
   limited to Next.js build-time configuration.
5. Two independent JWT systems (customer / admin) with separate secrets and separate
   user tables. Do not unify them without a decision record.
6. Keep the memory files current as you work — see §7 for the workflow.
7. Migrations are forward-only and append-only. Never edit an already-applied `.sql`
   file — add a new numbered one. Next free number is **038**.
8. Do not modify source files when the task is documentation only.

## 7. Memory maintenance workflow

The `.claude/memory/` files are the working memory for this repo. They are only worth
what the last session put into them, so maintaining them is part of the task, not a
courtesy afterwards.

### Before you write code

Read the memory files that touch what you are about to change. At minimum:

| You are about to… | Read first |
|---|---|
| Debug anything | `bugs.md` — then `architecture.md` for the subsystem |
| Change a subsystem | `architecture.md` §for that area |
| Change a pattern, dependency or contract | `decisions.md` — the choice may already have been made *and reversed* |
| Pick up or finish a piece of work | `roadmap.md` |

Do this even when the request looks small. A large share of the traps here — the `app.`
config prefix, the snake_case column names, `forbidNonWhitelisted` rejecting new fields,
the two-places-to-change shop-api contract — are documented and cost hours if rediscovered.

If a memory file contradicts the source, **the source wins**. Fix the memory file in the
same session and note what changed.

### After you finish

Update the memory in the same session, before you report the work as done. Four triggers,
four destinations:

**1. Architecture changed → `architecture.md`**
New module, new entity, changed request flow, new service boundary, changed route
prefixing, new env var that matters. Edit the relevant section in place rather than
appending a changelog entry — this file describes the system as it is *now*, not how it
got here. Bump the "Last verified against source" date at the top when you touch it.

**2. A decision was made → `decisions.md`**
Anything a future session might otherwise undo by accident: a library choice, a pattern,
a trade-off, a deliberate non-obvious workaround. Append a new `D-0NN` entry with the
next free number. State the decision, then the *why*, then the cost — the why is the part
that stops someone reverting it.

If you **reverse** an existing decision, do not delete the old entry. Mark it
`— **REVERSED** <date>`, say what replaced it, and list the leftovers the reversal did
not clean up (dead env vars, stale naming, unused config). Every reversal in this repo
so far has left artifacts, and the list is what makes them findable.

If you adopt a convention *because* something broke, add it under "Conventions adopted
after debugging incidents" with the symptom that led to it — D-019 through D-024 exist
because the symptom pointed nowhere near the cause.

**3. A bug was found → `bugs.md`**
Record it whether or not you fix it. Append a `B-0NN` entry under Critical / Significant /
Documentation drift, and label how you established it:

- **Verified** — you read the code or reproduced it this session.
- **Reported** — it is documented elsewhere in the repo; cite the file and date the claim.

Include the concrete symptom, the mechanism, and the downstream effects. "Migration 036
fails" is not useful; "036 aborts, so 037 never runs, so the URL backfill never happened,
so rows still point at localhost" is. Never mark something fixed here without having
verified the fix — the file's value depends on that.

When a bug **is** fixed, remove the entry rather than annotating it as resolved, and put
the outcome in `roadmap.md` instead. This file is a list of live problems, not a history.

**4. A milestone completed → `roadmap.md`**
Move the item from "Next" or "In flight" into the status tables above, with the date and
the commit if there is a clean one. Delete it from the list below — an item in two places
is worse than an item in neither. If finishing it revealed new work, add that to "Next"
with enough context that the next session knows why it matters.

Update per phase, not per commit. A single bug fix is not a milestone; the migration
chain being unblocked is.

### Rules that apply to all four

- Prefer editing an existing entry over adding a near-duplicate. Two entries describing
  the same thing differently is how these files rot.
- Write for a session that has never seen this codebase. Name the file, the symptom, the
  command.
- Do not record what the code already says plainly. Record the *why*, the trap, and the
  thing that took you three tries to figure out.
- `.ai/` is a separate, partly-frozen doc set from other tooling (see rule 3). Do not
  mirror updates into it; `.claude/memory/` is the maintained copy.
