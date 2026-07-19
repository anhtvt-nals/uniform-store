# Tasks

## Active Task

**T-008 + T-016** — Product module implementation. TypeORM entities (product, variant, image, option groups/options, inventory), storefront product endpoints (list, detail, variants, related, featured), admin full CRUD (variants, images, option groups, restore).

## Task List

### P0 — Must Have (Launch Blockers)

| ID | Task | Phase | Priority | Status |
|---|---|---|---|---|
| T-001 | Initialize NestJS monorepo + apps + libs | 1 | P0 | ✅ Done |
| T-002 | Set up TypeORM + entity files + migrations | 1 | P0 | ✅ Done |
| T-003 | Implement core infra (validation, errors, logging, CORS, rate limiting) | 1 | P0 | ✅ Done |
| T-004 | Implement Supabase Auth guards + admin JWT guards | 1 | P0 | ✅ Done |
| T-005 | Implement cache abstraction + in-memory cache | 1 | P0 | ✅ Done |
| T-006 | Implement S3 storage service | 1 | P0 | ✅ Done |
| T-007 | Implement auth endpoints (register, login, verify, password reset) | 2 | P0 | ✅ Done |
| T-007b | Implement category endpoints (tree, detail, products) | 2 | P0 | ✅ Done |
| T-007c | Implement brand endpoints (list, detail, products) | 2 | P0 | ✅ Done |
| T-008 | Implement product listing, detail, variants, related, featured endpoints | 2 | P0 | ✅ Done |
| T-009 | Implement cart endpoints | 2 | P0 | Pending |
| T-010 | Implement checkout flow endpoints | 2 | P0 | Pending |
| T-011 | Implement order endpoints | 2 | P0 | Pending |
| T-012 | Implement account endpoints | 2 | P0 | Pending |
| T-013 | Implement article endpoints | 2 | P0 | Pending |
| T-014 | Docker setup | 4 | P0 | ✅ Done |

### P1 — Important

| ID | Task | Phase | Status |
|---|---|---|---|
| T-015 | Admin auth endpoints | 3 | ✅ Done |
| T-015b | Admin category management (CRUD, reorder, restore, product assignment) | 3 | ✅ Done |
| T-015c | Admin brand management (CRUD, restore, logo) | 3 | ✅ Done |
| T-016 | Admin product CRUD (variants, images, option groups, restore) | 3 | ✅ Done |
| T-017 | Admin order management | 3 | Pending |
| T-018 | Admin customer management | 3 | Pending |
| T-019 | Admin content management | 3 | Pending |
| T-020 | Admin dashboard | 3 | Pending |
| T-021 | CI/CD pipeline | 4 | Pending |
| T-022 | Frontend REST client | 5 | Pending |

### P2 — Nice to Have

| ID | Task | Phase | Status |
|---|---|---|---|
| T-023 | Admin panel (React SPA) | 3 | Pending |
| T-024 | Redis cache implementation | 4 | Pending |
| T-025 | Request ID tracing | 4 | Pending |
| T-026 | Performance audit | 5 | Pending |
| T-027 | Security audit | 5 | Pending |
