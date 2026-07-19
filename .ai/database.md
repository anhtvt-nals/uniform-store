# Database Schema

## Overview

- **Database**: Supabase Postgres (PostgreSQL 15+)
- **Auth**: Supabase Auth (`auth.users` for customers); custom bcrypt+JWT for admins (`admin_users`)
- **Migrations**: SQL files in `backend/migrations/` (001–027)
- **Conventions**:
  - Names: `snake_case`, plural table names
  - IDs: `UUID v4` with `gen_random_uuid()`
  - Timestamps: `TIMESTAMPTZ`, auto via `now()`
  - Prices: `INTEGER` in cents (VND)
  - Multi-locale: `JSONB` with `{en, vi, de}` keys
  - Soft delete: `deleted_at TIMESTAMPTZ NULL`
  - Updated-at: automatic via trigger `trg_<table>_updated_at`

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                CATALOG DOMAIN                               │
│                                                                             │
│  categories ──┐                                                            │
│    ↑ parent_id│                                                            │
│    └──────────┘                                                            │
│         │                                                                   │
│         │ category_id                                                       │
│         ↓                                                                   │
│  products ────────────────── brands                                        │
│    │                        (brand_id)                                      │
│    │ product_id                                                             │
│    ├──────────────────────────── product_images                             │
│    │                              (product_id, variant_id?)                 │
│    ├──────────────────────────── product_option_groups                      │
│    │                              (product_id)                              │
│    │                                 │ group_id                             │
│    │                                 ↓                                      │
│    │                              product_options                           │
│    │                              (group_id)                                │
│    │            ┌──────────────────┘                                        │
│    │            │ option_id                                                 │
│    │            ↓                                                           │
│    ├──────────────────────────── product_variant_options                    │
│    │    product_variants ──────┘  (variant_id, option_id)                  │
│    │    (product_id)                                                        │
│    │         │ variant_id                                                   │
│    │         ├───────── inventory (1:1)                                     │
│    │         └───────── stock_history                                       │
│    │                                                                        │
│    ├──────────────────────────── product_facet_values (new)                 │
│    │    facet_values ───────────┘  (product_id, facet_value_id)             │
│    │    (group_id → facet_groups)                                           │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                CART DOMAIN                                  │
│                                                                             │
│  carts ─────────── cart_items (variant_id → product_variants)              │
│    └────────────── cart_coupons                                             │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                               ORDER DOMAIN                                  │
│                                                                             │
│  orders ────────── order_items (variant_id → product_variants)             │
│    ├────────────── order_addresses (type: shipping|billing)                 │
│    ├────────────── order_payments                                           │
│    ├────────────── order_discounts                                          │
│    └────────────── order_status_history                                     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                               USER DOMAIN                                   │
│                                                                             │
│  auth.users (Supabase)                                                      │
│    │                                                                        │
│    └── users ────── user_roles ────── roles                                 │
│           ├──────── addresses                                               │
│           ├──────── reviews (product_id)                                    │
│           └──────── wishlists (product_id)                                  │
│                                                                             │
│  admin_users (separate, bcrypt + JWT)                                       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                           PROMOTION DOMAIN                                  │
│                                                                             │
│  discounts ─────── coupons ─────── coupon_usages                            │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                           CONTENT DOMAIN (NEW)                              │
│                                                                             │
│  articles ──────── article_category_map ──────── article_categories         │
│    └────────────── article_tag_map ─────────────── article_tags             │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                            SHARED / MISC                                    │
│                                                                             │
│  banners ───────── settings ──────── activity_logs                          │
│  countries (new) ── shipping_methods (new) ── payment_methods (new)         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Existing Tables (22 tables)

### 1. `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | References `auth.users(id)` ON DELETE CASCADE |
| email | TEXT UNIQUE | |
| first_name | TEXT | |
| last_name | TEXT | |
| phone | TEXT | |
| avatar_url | TEXT | |
| is_active | BOOLEAN | Default true |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### 2. `roles`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | TEXT UNIQUE | `super_admin`, `admin`, `editor`, `customer` |
| description | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### 3. `user_roles`
| Column | Type | Notes |
|---|---|---|
| user_id | UUID FK→users | Composite PK |
| role_id | UUID FK→roles | Composite PK |

### 4. `admin_users`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| email | TEXT UNIQUE | |
| password_hash | TEXT | bcrypt |
| role | TEXT | `super_admin`, `admin`, `editor` |
| created_at | TIMESTAMPTZ | |

### 5. `addresses`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK→users | |
| full_name | TEXT | |
| company | TEXT | |
| street_line1 | TEXT | |
| street_line2 | TEXT | |
| city | TEXT | |
| province | TEXT | |
| postal_code | TEXT | |
| country_code | TEXT | Default 'VN' |
| phone | TEXT | |
| is_default_shipping | BOOLEAN | |
| is_default_billing | BOOLEAN | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | Soft delete |

Unique partial indexes: one default shipping/billing per user.

### 6. `brands`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | JSONB | `{en, vi, de}` |
| slug | TEXT UNIQUE | |
| description | JSONB | |
| logo_url | TEXT | |
| website_url | TEXT | |
| is_active | BOOLEAN | |
| sort_order | INTEGER | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

### 7. `categories`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| parent_id | UUID FK→categories | Self-referencing |
| name | JSONB | |
| slug | TEXT UNIQUE | |
| description | JSONB | |
| image_url | TEXT | |
| is_active | BOOLEAN | |
| sort_order | INTEGER | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

### 8. `products`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| category_id | UUID FK→categories | |
| brand_id | UUID FK→brands | Nullable |
| name | JSONB | |
| slug | TEXT UNIQUE | |
| description | JSONB | |
| sku | TEXT | Product-level SKU |
| base_price | INTEGER | Lowest variant price (cents) |
| tax_rate | DECIMAL | |
| is_active | BOOLEAN | |
| is_featured | BOOLEAN | |
| weight | INTEGER | Grams |
| meta_title | JSONB | SEO |
| meta_desc | JSONB | SEO |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

### 9. `product_variants`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| product_id | UUID FK→products | |
| name | JSONB | |
| sku | TEXT UNIQUE | |
| barcode | TEXT | Default '' |
| price | INTEGER | Cents |
| compare_price | INTEGER | Nullable, original price |
| tax_rate | DECIMAL | |
| weight | INTEGER | Grams |
| is_active | BOOLEAN | |
| sort_order | INTEGER | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

### 10. `product_option_groups` ⚡ needs `code`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| product_id | UUID FK→products | |
| name | JSONB | |
| sort_order | INTEGER | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### 11. `product_options` ⚡ needs `code`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| group_id | UUID FK→product_option_groups | |
| name | JSONB | |
| value | JSONB | |
| sort_order | INTEGER | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### 12. `product_variant_options`
| Column | Type | Notes |
|---|---|---|
| variant_id | UUID FK→product_variants | Composite PK |
| option_id | UUID FK→product_options | Composite PK |

### 13. `product_images`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| product_id | UUID FK→products | |
| variant_id | UUID FK→product_variants | Nullable |
| url | TEXT | |
| alt | JSONB | |
| sort_order | INTEGER | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

### 14. `inventory`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| variant_id | UUID UNIQUE FK→product_variants | |
| quantity | INTEGER | |
| reserved | INTEGER | Items in active carts |
| low_stock_level | INTEGER | Default 5 |
| track_inventory | BOOLEAN | Default true |
| allow_backorder | BOOLEAN | Default false |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

View: `inventory_available` computed as `(quantity - reserved) AS available`.

### 15. `stock_history`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| variant_id | UUID FK→product_variants | |
| type | VARCHAR(50) | |
| reason_code | VARCHAR(50) | Nullable |
| reason | TEXT | Nullable |
| quantity_change | INTEGER | |
| quantity_before | INTEGER | |
| quantity_after | INTEGER | |
| reserved_before | INTEGER | |
| reserved_after | INTEGER | |
| reference | TEXT | Nullable |
| created_by | VARCHAR(100) | Nullable |
| metadata | JSONB | Nullable |
| created_at | TIMESTAMPTZ | |

### 16. `carts`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK→users | Nullable |
| session_id | TEXT | Nullable, for guests |
| status | TEXT | `active`, `converted`, `abandoned` |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

Constraint: `cart_owner_check` ensures at least one of user_id/session_id is set.

### 17. `cart_items`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| cart_id | UUID FK→carts | |
| variant_id | UUID FK→product_variants | |
| quantity | INTEGER | > 0 |
| unit_price | INTEGER | Locked at add time |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### 18. `cart_coupons`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| cart_id | UUID FK→carts | |
| coupon_code | TEXT | |
| discount_amount | INTEGER | |
| created_at | TIMESTAMPTZ | |

Unique: `(cart_id, coupon_code)`.

### 19. `orders`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| code | TEXT UNIQUE | Auto-generated: `MA-YYYYMMDD-NNNN` |
| user_id | UUID FK→users | Nullable |
| email | TEXT | |
| status | TEXT | `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded` |
| currency_code | TEXT | Default 'VND' |
| subtotal | INTEGER | Cents |
| discount_total | INTEGER | |
| shipping_total | INTEGER | |
| tax_total | INTEGER | |
| grand_total | INTEGER | |
| shipping_method | TEXT | |
| payment_method | TEXT | |
| notes | TEXT | |
| ip_address | INET | |
| user_agent | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

### 20. `order_items`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| order_id | UUID FK→orders | |
| variant_id | UUID FK→product_variants | |
| product_name | JSONB | Snapshot |
| variant_name | JSONB | Snapshot |
| sku | TEXT | |
| quantity | INTEGER | |
| unit_price | INTEGER | Cents |
| line_price | INTEGER | `qty * unit_price` |
| created_at | TIMESTAMPTZ | |

### 21. `order_addresses`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| order_id | UUID FK→orders | |
| type | TEXT | `shipping`, `billing` |
| full_name | TEXT | |
| company | TEXT | |
| street_line1 | TEXT | |
| street_line2 | TEXT | |
| city | TEXT | |
| province | TEXT | |
| postal_code | TEXT | |
| country_code | TEXT | |
| phone | TEXT | |
| created_at | TIMESTAMPTZ | |

### 22. `order_payments`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| order_id | UUID FK→orders | |
| method | TEXT | |
| amount | INTEGER | |
| status | TEXT | `pending`, `authorized`, `captured`, `failed`, `refunded` |
| transaction_id | TEXT | |
| gateway_response | JSONB | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### 23. `order_discounts`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| order_id | UUID FK→orders | |
| coupon_code | TEXT | |
| description | TEXT | |
| amount | INTEGER | |
| created_at | TIMESTAMPTZ | |

### 24. `order_status_history`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| order_id | UUID FK→orders | |
| from_status | TEXT | Nullable |
| to_status | TEXT | |
| note | TEXT | |
| performed_by | UUID FK→users | Nullable |
| created_at | TIMESTAMPTZ | |

### 25. `discounts`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | JSONB | |
| type | TEXT | `percentage`, `fixed` |
| value | INTEGER | Cents or percentage * 100 |
| min_order_amount | INTEGER | |
| max_discount | INTEGER | 0 = no cap |
| target | TEXT | `order`, `product`, `category` |
| target_ids | UUID[] | |
| max_uses | INTEGER | |
| current_uses | INTEGER | |
| starts_at | TIMESTAMPTZ | |
| ends_at | TIMESTAMPTZ | |
| is_active | BOOLEAN | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

### 26. `coupons`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| discount_id | UUID FK→discounts | |
| code | TEXT UNIQUE | |
| max_uses | INTEGER | |
| current_uses | INTEGER | |
| per_user_limit | INTEGER | |
| starts_at | TIMESTAMPTZ | |
| ends_at | TIMESTAMPTZ | |
| is_active | BOOLEAN | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

### 27. `coupon_usages`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| coupon_id | UUID FK→coupons | |
| user_id | UUID FK→users | Nullable |
| order_id | UUID FK→orders | Nullable |
| used_at | TIMESTAMPTZ | |

### 28. `reviews`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| product_id | UUID FK→products | |
| user_id | UUID FK→users | |
| rating | INTEGER | 1–5 |
| title | TEXT | |
| content | TEXT | |
| is_verified | BOOLEAN | Purchased product |
| is_approved | BOOLEAN | Admin approved |
| helpful_count | INTEGER | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

Unique: `(product_id, user_id)` — one review per user per product.

### 29. `wishlists`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK→users | |
| product_id | UUID FK→products | |
| created_at | TIMESTAMPTZ | |

Unique: `(user_id, product_id)`.

### 30. `banners`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| title | JSONB | |
| subtitle | JSONB | |
| image_url | TEXT | |
| link_url | TEXT | |
| position | TEXT | `hero`, `promo`, `sidebar`, `footer` |
| is_active | BOOLEAN | |
| sort_order | INTEGER | |
| starts_at | TIMESTAMPTZ | |
| ends_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

### 31. `settings`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| key | TEXT UNIQUE | |
| value | JSONB | |
| group_name | TEXT | Default 'general' |
| is_public | BOOLEAN | Visible to storefront |
| description | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### 32. `activity_logs`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK→users | Nullable |
| action | TEXT | e.g. 'order.created' |
| entity_type | TEXT | e.g. 'order', 'product' |
| entity_id | UUID | Nullable |
| old_values | JSONB | |
| new_values | JSONB | |
| ip_address | INET | |
| user_agent | TEXT | |
| metadata | JSONB | |
| created_at | TIMESTAMPTZ | |

---

## New Tables (Migration 022–026)

### `countries` (022)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| code | TEXT UNIQUE | ISO 3166-1 alpha-2: VN, US, DE |
| name | JSONB | `{en, vi, de}` |
| phone_code | TEXT | +84, +1, +49 |
| is_active | BOOLEAN | Default true |
| sort_order | INTEGER | |
| created_at | TIMESTAMPTZ | |

Seeded with VN, US, DE.

### `shipping_methods` (023)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| code | TEXT UNIQUE | e.g. 'standard', 'express' |
| name | JSONB | |
| description | JSONB | |
| price | INTEGER | Cents |
| tax_rate | DECIMAL | |
| min_order_amount | INTEGER | Free shipping threshold |
| is_active | BOOLEAN | Default true |
| sort_order | INTEGER | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `payment_methods` (023)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| code | TEXT UNIQUE | e.g. 'cod', 'bank_transfer' |
| name | JSONB | |
| description | JSONB | |
| is_active | BOOLEAN | Default true |
| sort_order | INTEGER | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `facet_groups` (025)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| code | TEXT UNIQUE | e.g. 'size', 'material' |
| name | JSONB | |
| is_active | BOOLEAN | |
| sort_order | INTEGER | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `facet_values` (025)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| group_id | UUID FK→facet_groups | |
| code | TEXT UNIQUE | e.g. 's', 'm', 'cotton' |
| name | JSONB | |
| is_active | BOOLEAN | |
| sort_order | INTEGER | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `product_facet_values` (025)
| Column | Type | Notes |
|---|---|---|
| product_id | UUID FK→products | Composite PK |
| facet_value_id | UUID FK→facet_values | Composite PK |

### `articles` (026)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| slug | TEXT UNIQUE | |
| title | JSONB | |
| content | JSONB | Rich text |
| excerpt | JSONB | Short summary |
| image_url | TEXT | |
| author | TEXT | |
| is_featured | BOOLEAN | |
| is_published | BOOLEAN | |
| published_at | TIMESTAMPTZ | Nullable |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

### `article_categories` (026)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| slug | TEXT UNIQUE | |
| name | JSONB | |
| description | JSONB | |
| is_active | BOOLEAN | |
| sort_order | INTEGER | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

### `article_tags` (026)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| slug | TEXT UNIQUE | |
| name | JSONB | |
| created_at | TIMESTAMPTZ | |

### `article_category_map` (026)
| Column | Type | Notes |
|---|---|---|
| article_id | UUID FK→articles | Composite PK |
| category_id | UUID FK→article_categories | Composite PK |

### `article_tag_map` (026)
| Column | Type | Notes |
|---|---|---|
| article_id | UUID FK→articles | Composite PK |
| tag_id | UUID FK→article_tags | Composite PK |

---

## Schema Alterations (Migration 027)

### `product_option_groups` — add `code`
```sql
ALTER TABLE product_option_groups ADD COLUMN code TEXT NOT NULL DEFAULT '';
CREATE INDEX idx_option_groups_code ON product_option_groups(code);
```

### `product_options` — add `code`
```sql
ALTER TABLE product_options ADD COLUMN code TEXT NOT NULL DEFAULT '';
CREATE INDEX idx_options_code ON product_options(code);
```

The `code` field enables URL-based variant selection (e.g., `?options=size:xl,color:red`).

---

## Key Design Decisions

1. **Prices as integers (cents)**: All monetary values stored as integer cents. `*WithTax` fields computed in API layer as `price * (1 + tax_rate/100)`.

2. **No `coupon_codes` array on orders**: Derived via JOIN `order_discounts`. Avoids data duplication.

3. **No `order_item_options`**: Selected options are read from `product_variant_options` → `product_options` at query time. Order items store `variant_id`, which is sufficient for reconstruction.

4. **Facets separate from options**: Facets are for search filtering/aggregation (size, material, color). Options are for variant configuration (size, color). They serve different purposes and may overlap.

5. **Articles with M:N categories and tags**: Supports multiple categorization (e.g., same article in "News" + "Uniform Tips"). Simpler than nested categories for content.

6. **Countries as seeded reference data**: Not editable via admin UI in v1. ISO codes ensure consistency with address forms and shipping calculations.

7. **Shipping/payment methods as DB tables**: Enables admin CRUD in future. Simple enough to be configured without a complex rules engine.

8. **Soft delete pattern**: All major entities use `deleted_at` for recoverability. Carts, settings, and stock history omit it (never deleted).

9. **JSONB for multi-locale**: All user-facing text stored as `{en, vi, de}`. Single query, no JOINs for translations.

10. **RLS policies**: Applied to user-facing tables only (users, addresses, carts, orders, reviews, wishlists). Admin tables (products, brands, etc.) protected by API-layer auth.

---

## Index Strategy

Full-text search (GIN) on `products` for multi-locale name + description. Trigram index (GIN) for fuzzy matching. All foreign keys indexed. Partial indexes on `WHERE deleted_at IS NULL` for soft-delete tables. See `015_create_indexes.sql` for complete list.

## Migration Files Summary

| # | File | Purpose |
|---|---|---|
| 001 | `create_extensions.sql` | pgcrypto, pg_trgm |
| 002 | `create_users_roles.sql` | users, roles, user_roles + auth trigger |
| 003 | `create_addresses.sql` | addresses |
| 004 | `create_brands_categories.sql` | brands, categories |
| 005 | `create_products.sql` | products, variants, options, images |
| 006 | `create_inventory.sql` | inventory + view |
| 007 | `create_cart.sql` | carts, cart_items, cart_coupons |
| 008 | `create_orders.sql` | orders + items + addresses + payments + discounts + history + code sequence |
| 009 | `create_admin_users.sql` | admin_users |
| 009 | `create_coupons_discounts.sql` | discounts, coupons, coupon_usages |
| 010 | `create_reviews.sql` | reviews |
| 011 | `create_wishlists.sql` | wishlists |
| 012 | `create_banners.sql` | banners |
| 013 | `create_settings.sql` | settings |
| 014 | `create_activity_logs.sql` | activity_logs |
| 015 | `create_indexes.sql` | Performance indexes + FTS |
| 016 | `create_updated_at_trigger.sql` | Auto-update trigger |
| 017 | `create_rls_policies.sql` | RLS for user-facing tables |
| 018 | `seed_data.sql` | Dev seed: admin, roles, brands, categories, settings |
| 020 | `add_barcode_to_variants.sql` | Add barcode to product_variants |
| 021 | `create_stock_history.sql` | stock_history |
| **022** | `create_countries.sql` | countries + seed |
| **023** | `create_shipping_payment_methods.sql` | shipping_methods, payment_methods |
| **025** | `create_facets.sql` | facet_groups, facet_values, product_facet_values |
| **026** | `create_articles.sql` | articles + categories + tags |
| **027** | `alter_options_add_code.sql` | Add code to option groups/options |
