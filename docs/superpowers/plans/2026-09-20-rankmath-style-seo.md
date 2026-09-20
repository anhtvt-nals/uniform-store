# RankMath-style SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the practical Rank Math-like SEO workflow to the existing admin/storefront without installing a WordPress plugin or adding a new dependency.

**Architecture:** Keep the existing localized SEO fields and metadata flow. Add a small pure admin analyzer and live previews, then extend storefront metadata with article schema and technical SEO routes. The analyzer is advisory only; it never blocks saving content.

**Tech Stack:** Next.js App Router, React, TypeScript, NestJS storefront API, existing JSONB SEO fields, Next Metadata API, JSON-LD.

**Spec:** `docs/superpowers/specs/2026-09-17-content-cms-design.md` plus the approved Rank Math-style SEO scope: analyzer, Google/social previews, article/breadcrumb/organization schema, sitemap, and robots.txt.

## Global Constraints

- Reuse the existing `metaTitle`, `metaDesc`, `focusKeyword`, `ogTitle`, `ogDescription`, and `ogImageUrl` fields; do not add a second SEO contract.
- Do not add Rank Math, an SEO SDK, a scoring dependency, or a CMS dependency.
- SEO analysis is guidance only and must not prevent article/product save.
- Preserve locale fallbacks, canonical URLs, existing product JSON-LD, and `noopener noreferrer` on external links.
- Add noindex behavior only to already-private/search/transaction routes; public products and articles remain indexable.
- Run storefront type-check/build and the relevant backend tests before completion.

## Review Focus

- Empty localized SEO fields must use the current title/description/image fallbacks rather than rendering empty metadata.
- Analyzer input containing HTML, punctuation, accents, or repeated whitespace must produce stable results without throwing.
- A keyword longer than one word and a keyword absent from content must produce an actionable warning, not a false pass.
- JSON-LD values must be JSON-escaped and must not inject raw HTML or script terminators.
- Sitemap generation must tolerate an empty API result and must not emit duplicate locale/route URLs.

### Task 1: Add the reusable SEO analyzer

**Files:**
- Create: `admin/src/lib/seo/analyzer.ts`
- Create: `admin/scripts/seo-analyzer-check.mjs`
- Modify: `admin/src/app/(dashboard)/articles/article-form.tsx`
- Modify: `admin/src/app/(dashboard)/products/product-form.tsx`

**Interfaces:**
- Produces `analyzeSeo(input: SeoAnalyzerInput): SeoAnalysis`.
- `SeoAnalyzerInput` contains `title`, `description`, `focusKeyword`, `slug`, and `content` strings.
- `SeoAnalysis` contains `score: number`, `checks: Array<{ key: string; label: string; passed: boolean; message: string }>`, and `plainText: string`.

- [ ] **Step 1: Write the failing analyzer checks**

  Add a small executable check beside the analyzer using the repository's existing TypeScript toolchain. Cover: ideal title/description lengths, missing focus keyword, keyword found in title/content, HTML stripping, and score clamping to `0..100`.

- [ ] **Step 2: Run the TypeScript check and confirm it fails for the missing analyzer**

  Run: `npx tsc --noEmit -p admin/tsconfig.json`

  Expected: FAIL because `admin/src/lib/seo/analyzer.ts` and `analyzeSeo` do not exist yet.

- [ ] **Step 3: Implement the minimum pure analyzer**

  Strip tags with a small local regex, normalize case/whitespace, and implement only these checks: title 30–60 characters, description 120–160 characters, non-empty focus keyword, keyword in title, keyword in description, keyword in content, and non-empty slug. Clamp the score to `0..100`; do not add keyword-density heuristics or external libraries.

- [ ] **Step 4: Run the analyzer check and admin type-check**

  Run: `node admin/scripts/seo-analyzer-check.mjs` and `npx tsc --noEmit -p admin/tsconfig.json`.

  Expected: PASS with no new dependency.

- [ ] **Step 5: Commit the analyzer**

  ```bash
  git add admin/src/lib/seo/analyzer.ts
  git commit -m "feat: add seo content analyzer"
  ```

### Task 2: Show live SEO score and previews in admin forms

**Files:**
- Create: `admin/src/components/shared/seo-preview.tsx`
- Modify: `admin/src/app/(dashboard)/articles/article-form.tsx`
- Modify: `admin/src/app/(dashboard)/products/product-form.tsx`

**Interfaces:**
- Consumes `SeoAnalysis` from Task 1 and the form's current localized title, description, slug, and SEO fields.
- `SeoPreview` accepts `{ title: string; description: string; url: string; imageUrl?: string }` and renders the Google result preview plus a compact social card preview.

- [ ] **Step 1: Add the failing UI contract check**

  Confirm the forms currently render SEO inputs but no score or preview by searching for `SeoPreview` and `analyzeSeo`; the check must fail until the new component/imports are present.

- [ ] **Step 2: Implement the shared preview component**

  Render a Google-style title, truncated URL, description, and an optional social image/title block. Use plain Tailwind markup and no browser-only API so it remains compatible with the existing client forms.

- [ ] **Step 3: Wire the analyzer into the article form**

  Analyze the active Vietnamese values on every render, show score/check rows below the existing SEO inputs, and render `SeoPreview` using the current slug and SEO fallbacks. Keep all existing submit fields unchanged.

- [ ] **Step 4: Wire the analyzer into the product form**

  Reuse the same analyzer and preview with the product's active locale. Do not duplicate analyzer rules or introduce a new form abstraction.

- [ ] **Step 5: Verify admin production build and manual interactions**

  Run: `npm run build -w admin -- --webpack`.

  Manually verify: changing title/description updates score and preview, empty optional fields fall back to the existing product/article values, and Save still submits the same payload.

- [ ] **Step 6: Commit the admin SEO experience**

  ```bash
  git add admin/src/lib/seo admin/src/components/shared/seo-preview.tsx admin/src/app/'(dashboard)'/articles/article-form.tsx admin/src/app/'(dashboard)'/products/product-form.tsx
  git commit -m "feat: add seo score and previews"
  ```

### Task 3: Complete structured data for public content

**Files:**
- Modify: `storefront/src/lib/metadata.ts`
- Modify: `storefront/src/app/[locale]/news/[slug]/page.tsx`
- Modify: `storefront/src/app/[locale]/tin-tuc/[slug]/page.tsx`
- Modify: `storefront/src/app/[locale]/product/[slug]/page.tsx`
- Test: `backend/apps/storefront-api/src/articles/articles.service.spec.ts`
- Test: `backend/apps/storefront-api/src/products/products.service.spec.ts`

**Interfaces:**
- Produces JSON-LD objects for `Article`, `BreadcrumbList`, and `Organization` using existing mapped SEO/content data.
- Keeps the current product `Product` JSON-LD and adds breadcrumbs without changing REST/GraphQL response shapes.

- [ ] **Step 1: Add mapping regression assertions**

  Extend existing storefront service tests to assert SEO fallback values remain stable when localized fields are empty and populated. Add a test input containing quotes and `</script>` to ensure the page serializer receives data rather than raw HTML.

- [ ] **Step 2: Implement shared JSON-LD builders**

  Add small typed builders in `storefront/src/lib/metadata.ts` for organization and breadcrumbs. Return plain objects; let Next's `<script type="application/ld+json">` serialization handle escaping.

- [ ] **Step 3: Add Article JSON-LD and breadcrumbs to both article routes**

  Use the current article title, excerpt, canonical URL, publication date, author, and image. Keep the existing HTML rendering and metadata untouched.

- [ ] **Step 4: Add breadcrumbs to the product route and preserve Product JSON-LD**

  Include Home → collection (when available) → product. Do not duplicate the existing Product schema or change its price/availability contract.

- [ ] **Step 5: Run focused tests and storefront type-check**

  Run: `DATABASE_URL='postgresql://test:test@localhost:5432/test' npm test -w backend -- --runInBand apps/storefront-api/src/articles/articles.service.spec.ts apps/storefront-api/src/products/products.service.spec.ts` and `npm run check-types -w storefront`.

- [ ] **Step 6: Commit structured data**

  ```bash
  git add storefront/src/lib/metadata.ts storefront/src/app/'[locale]'/news storefront/src/app/'[locale]'/tin-tuc storefront/src/app/'[locale]'/product backend/apps/storefront-api/src/articles/articles.service.spec.ts backend/apps/storefront-api/src/products/products.service.spec.ts
  git commit -m "feat: add article and breadcrumb structured data"
  ```

### Task 4: Add sitemap and robots routes

**Files:**
- Create: `storefront/src/app/sitemap.ts`
- Create: `storefront/src/app/robots.ts`
- Modify: `storefront/src/lib/actions/articles.ts`
- Modify: `storefront/src/lib/vendure/queries.ts` to add the paginated public product slug query used by the sitemap

**Interfaces:**
- `sitemap(): Promise<MetadataRoute.Sitemap>` emits locale-prefixed static, article, and product URLs with no duplicates.
- `robots(): MetadataRoute.Robots` allows public content and disallows `/account`, `/cart`, `/checkout`, `/search`, and order lookup routes; it points to `${SITE_URL}/sitemap.xml`.

- [ ] **Step 1: Add the failing route contract check**

  Run `npm run check-types -w storefront` after creating route stubs with incorrect/empty return types; confirm TypeScript catches the missing `MetadataRoute` contract before implementation.

- [ ] **Step 2: Implement static and localized sitemap entries**

  Use `SITE_URL`, `routing.locales`, and the existing canonical route helpers. Include the public home, news, tin-tuc, service/about, collection, article, and product paths; deduplicate aliases so the canonical route is emitted once per locale.

- [ ] **Step 3: Implement robots rules**

  Return `rules: { userAgent: '*', allow: '/', disallow: [...] }` and `sitemap: `${SITE_URL}/sitemap.xml``. Do not block public product/article routes.

- [ ] **Step 4: Verify empty API and duplicate handling**

  Run `npm run check-types -w storefront` and manually call `/sitemap.xml` and `/robots.txt` with the API unavailable; the routes must still return static entries rather than throwing.

- [ ] **Step 5: Commit technical SEO routes**

  ```bash
  git add storefront/src/app/sitemap.ts storefront/src/app/robots.ts storefront/src/lib/actions/articles.ts storefront/src/lib/vendure/queries.ts
  git commit -m "feat: add sitemap and robots metadata routes"
  ```

## Final Verification

- [ ] Run `DATABASE_URL='postgresql://test:test@localhost:5432/test' npm test -w backend -- --runInBand`.
- [ ] Run `npm run check-types -w storefront`.
- [ ] Run `npm run build -w admin -- --webpack`.
- [ ] Run `npm run build -w storefront -- --webpack` with the existing storefront API URL environment variables.
- [ ] Manually verify one article and one product in Vietnamese: analyzer score, Google/social previews, page source JSON-LD, canonical URL, `/sitemap.xml`, and `/robots.txt`.
