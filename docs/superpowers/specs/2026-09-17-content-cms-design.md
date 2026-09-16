# Content CMS Enhancements Design

## Scope

Extend the existing Article, Product, and Asset flows with editable SEO data,
rich-content semantics, share links, and manually selected related articles.
The existing NestJS admin/storefront APIs, Next.js admin, and Next.js storefront
remain the only integration points; no CMS, social SDK, or editor dependency is added.

## Existing flow

- Articles are `ArticleEntity` records with localized JSONB HTML in `content`.
  The admin uses CKEditor Classic in `admin/src/app/(dashboard)/articles/article-form.tsx`.
- Product descriptions use the same CKEditor in `product-form.tsx`.
- The storefront's `ShopApiService` maps entities into the GraphQL-compatible
  contract consumed by `storefront/src/lib/graphql/*`; article HTML is rendered
  directly in both `/news/[slug]` and `/tin-tuc/[slug]`.
- `AssetEntity` is persisted by the active `uploads` module. It currently stores
  only URL/key/file information and localized `alt` text.
- Product already has localized `metaTitle` and `metaDesc`; Article has no stored
  SEO fields. Existing article SEO output is an implicit title/excerpt fallback.

## 1. Per-record SEO

Keep Product's existing `metaTitle` and `metaDesc` as the canonical meta title
and description. Add the missing SEO values as localized JSONB where text is
locale-specific: focus keyword, Open Graph title, Open Graph description, and
Open Graph image URL. Add the complete equivalent SEO shape to Article.

Admin article and product forms expose these optional fields. Existing CRUD
endpoints accept and return them through their current DTOs; there is no SEO
endpoint. The storefront GraphQL mapping returns stored values, falling back to
the title, excerpt/description, and primary image only when an optional value is
empty. Detail-page `generateMetadata` uses those returned values for metadata,
Open Graph, and Twitter cards.

## 2. Article rich-content semantics

Article and product HTML remains the canonical rich-content payload. Configure
the already-installed CKEditor Classic build to expose image captions and a
manual link decorator for "open in a new tab". The decorator writes
`target="_blank"` and `rel="noopener noreferrer"`; without it, links stay in
the current tab. No content schema or rendering transform is required because
the current renderer preserves stored HTML attributes.

The known heading report has no static code path converting `h2` to `h3`:
stored HTML is rendered verbatim and CSS contains separate selectors for both.
Add regression coverage that proves an `h2` remains `h2` through the article
mapping/rendering flow. Investigate an actual stored HTML sample if that test
does not reproduce the report; do not change heading CSS as a substitute for a
semantic conversion.

The caption report is addressed by exposing CKEditor's caption command. The
storefront already styles `figure` and `figcaption`; regression coverage checks
that an emitted `<figcaption>` reaches both public article routes.

## 3. Asset metadata: library-only with insertion snapshot

Asset metadata is library-only. `AssetEntity` gains localized `caption` and
`title`, plus a `linkUrl`; existing localized `alt` is retained. The uploads
module gains an authenticated asset metadata update endpoint and the admin
library exposes editing for these fields.

When an editor selects/inserts an asset, the current asset metadata is copied
into the generated HTML (`alt`, `title`, optional enclosing link, and
figure/caption). Later edits to the asset library do not modify prior article
or product HTML. This avoids global content rewrites and makes each published
document stable.

## 4. Social sharing

Article detail pages provide Facebook Share and X Intent anchor links using the
canonical article URL and title. They open a new tab with `noopener noreferrer`.
No OAuth, tracking, SDK, or share-count service is included.

## 5. Manually related articles on Product

Create `product_article_map` as a simple many-to-many join table between
Product and Article. It only records selection, so it has no ordering column
or join entity. It does not change article listing/category membership or
publication state.

The product create/update DTOs accept `relatedArticleIds`; the admin product
form reuses the existing article list API for a native multi-select picker.
The service replaces the relation atomically. Storefront product detail returns
only the selected, published, non-deleted articles as article cards and renders
them below the product detail. It does not use the existing same-category
related-product algorithm.

## Data and migration rules

- Add one forward SQL migration after `047_*`; do not alter old migrations.
- Use JSONB defaults of `{}` for localized fields and safe empty defaults for
  strings so existing data remains readable.
- Add foreign keys from `product_article_map` with cascade deletion and a
  composite primary key to prevent duplicate selections.
- Add entities to TypeORM exports and `DatabaseModule` registration.

## Validation and security

- DTOs validate localized SEO/asset text objects and UUID arrays.
- The new asset update endpoint remains behind the existing admin auth/roles
  guards.
- New-tab links always carry `rel="noopener noreferrer"`.
- The change preserves the existing rich HTML rendering model; it does not add
  a new sanitizer or change existing stored content outside explicit edits.

## Verification

- Extend existing Nest Jest service tests for SEO persistence/mapping, asset
  metadata updates, and selected-article relation replacement/filtering.
- Add focused tests for preserved `h2`, `figcaption`, and link attributes in the
  content contract.
- Run relevant backend Jest suites, backend TypeScript build, and storefront/
  admin type or production builds available in the repository.

## Deliberate exclusions

- No external CMS, social SDK, new editor package, or share analytics.
- No automatic propagation of media metadata into documents already saved.
- No automatic related-article recommendation, ranking, or ordering UI.
