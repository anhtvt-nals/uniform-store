# Frontend Analysis — Complete Backend Requirements

## Overview

The storefront is a Next.js 16 App Router app consuming a Vendure headless commerce GraphQL API. It uses `gql.tada` for typed GraphQL, `next-intl` for i18n (vi, en, de), and `next/cache` for data caching.

**Target**: Replace Vendure GraphQL with a NestJS REST API at `/api/v1/*`.

---

## 1. Pages → Required APIs

| Page | Route | Data Fetching | APIs Required |
|------|-------|--------------|---------------|
| Home | `/` | `FeaturedCategoryTabs`, `NewsSection` children | Top collections, products by collection (search), articles |
| Search | `/search?q=&facets=&sort=&page=` | `search-results.tsx` | `search` with filters, sort, pagination, facet values |
| Product Detail | `/product/[slug]` | `GetProductDetailQuery` | Product by slug (+ variants, assets, option groups, collections) |
| Collection | `/collection/[slug]?facets=&sort=&page=` | `GetCollectionProductsQuery` | Collection meta + search filtered by collectionSlug |
| Cart | `/cart` | `GetActiveOrderQuery` | Active order (cart lines, totals, discounts, coupons) |
| Checkout | `/checkout` | `GetActiveOrderForCheckoutQuery`, `GetCustomerAddressesQuery`, `GetEligibleShippingMethodsQuery`, `GetEligiblePaymentMethodsQuery`, `GetAvailableCountriesQuery` | Order with customer/address/shipping, customer addresses, shipping methods, payment methods, countries |
| Order Confirmation | `/order-confirmation/[code]` | Custom `GetOrderByCodeQuery` | Order by code (lines, totals, shipping address) |
| News List | `/news?page=&search=&category=&tag=` | `GetArticlesDocument`, `GetArticleCategoriesDocument` | Articles (list), article categories |
| News Detail | `/news/[slug]` | `GetArticleBySlugDocument` | Article by slug (full detail + content) |
| Sign In | `/sign-in?redirectTo=` | — | Login, form action |
| Register | `/register?redirectTo=` | — | Register, form action |
| Forgot Password | `/forgot-password` | — | Request reset, form action |
| Reset Password | `/reset-password` | — | Reset password, form action |
| Verify | `/verify?token=` | — | Verify account, form action |
| Account Profile | `/account/profile` | `getActiveCustomer()` | Customer profile (first/last name, email) |
| Account Addresses | `/account/addresses` | `GetCustomerAddressesQuery`, `GetAvailableCountriesQuery` | Customer addresses + countries list |
| Account Orders | `/account/orders?page=` | `GetCustomerOrdersQuery` | Customer orders with pagination |
| Account Order Detail | `/account/orders/[code]` | `GetOrderDetailQuery` | Order by code (full detail) |
| Legacy News | `/tin-tuc`, `/tin-tuc/[slug]` | Delegated to new articles API | Same as news routes |
| Static Pages | `/dich-vu`, `/ve-chung-toi`, `/verify-pending` | None | N/A |

---

## 2. All GraphQL Operations → Required REST Endpoints

### 2.1 Search / Catalog

#### `SearchProductsQuery` — `search(input: SearchInput!)`
- **Used by**: `/search`, `/collection/[slug]`, `FeaturedCategoryTabs`, `FeaturedProducts`, `RelatedProducts`
- **Required endpoint**: `GET /api/v1/products`
- **Query params**: `q`, `collectionSlug`, `page` (→skip), `sort` (name-asc/name-desc/price-asc/price-desc), `facets` (comma-separated facetValueIds)
- **Response**:
```typescript
{
  items: Array<{
    productId: string;
    productName: string;
    slug: string;
    productAsset: { id: string; preview: string } | null;
    priceWithTax: { min: number; max: number } | { value: number };
    currencyCode: string;
  }>;
  totalItems: number;
  facetValues: Array<{
    count: number;
    facetValue: { id: string; name: string; facet: { id: string; name: string } };
  }>;
}
```

#### `GetProductDetailQuery` — `product(slug:)`
- **Used by**: `/product/[slug]`, `getProductForQuickView` (server action)
- **Required endpoint**: `GET /api/v1/products/:slug`
- **Response**:
```typescript
{
  id: string;
  name: string;
  description: string;  // HTML
  slug: string;
  assets: Array<{ id: string; preview: string; source: string }>;
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    priceWithTax: number;
    stockLevel: 'IN_STOCK' | 'OUT_OF_STOCK';
    options: Array<{
      id: string;
      code: string;
      name: string;
      groupId: string;
      group: { id: string; code: string; name: string };
    }>;
  }>;
  optionGroups: Array<{
    id: string;
    code: string;
    name: string;
    options: Array<{ id: string; code: string; name: string }>;
  }>;
  collections: Array<{
    id: string;
    name: string;
    slug: string;
    parent: { id: string } | null;
  }>;
}
```

#### `GetCollectionProductsQuery` — `collection(slug:)` + `search(input:)`
- **Used by**: Collection page SEO, FeaturedProducts, RelatedProducts
- **Required endpoint**: `GET /api/v1/collections/:slug` (for meta) + `GET /api/v1/products?collectionSlug=...`
- **Collection response**:
```typescript
{
  id: string;
  name: string;
  slug: string;
  description: string;
  featuredAsset: { id: string; preview: string } | null;
}
```

#### `GetTopCollectionsQuery` — `collections()`
- **Used by**: Navbar, FeaturedCategoryTabs
- **Required endpoint**: `GET /api/v1/collections`
- **Response**: `Array<{ id: string; name: string; slug: string }>`

---

### 2.2 Cart

#### `GetActiveOrderQuery` / `GetActiveOrderForCheckoutQuery` — `activeOrder`
- **Used by**: `/cart`, `/checkout`, NavbarCart
- **Required endpoint**: `GET /api/v1/cart`
- **Cart response**:
```typescript
{
  id: string;
  code: string;
  state: string;  // 'AddingItems' | 'ArrangingPayment' | ...
  totalQuantity: number;
  subTotal: number;
  subTotalWithTax: number;
  shipping: number;
  shippingWithTax: number;
  total: number;
  totalWithTax: number;
  currencyCode: string;
  couponCodes: string[];
  discounts: Array<{ description: string; amountWithTax: number }>;
  lines: Array<{
    id: string;
    productVariant: {
      id: string;
      name: string;
      sku: string;
      product: {
        id: string;
        name: string;
        slug: string;
        featuredAsset: { id: string; preview: string } | null;
      };
    };
    unitPriceWithTax: number;
    quantity: number;
    linePriceWithTax: number;
  }>;
  // checkout-only fields:
  customer?: { id: string; firstName: string; lastName: string; emailAddress: string; phoneNumber: string };
  shippingAddress?: { fullName: string; company: string; streetLine1: string; streetLine2: string; city: string; province: string; postalCode: string; country: string; phoneNumber: string };
  billingAddress?: { ... same ... };
  shippingLines?: Array<{ shippingMethod: { id: string; name: string; description: string }; priceWithTax: number }>;
}
```

#### `AddToCartMutation` — `addItemToOrder(variantId:, quantity:)`
- **Required endpoint**: `POST /api/v1/cart/items`
- **Request body**: `{ variantId: string; quantity: number }`
- **Response**: Cart order fragment

#### `RemoveFromCartMutation` — `removeOrderLine(orderLineId:)`
- **Required endpoint**: `DELETE /api/v1/cart/items/:lineId`

#### `AdjustCartItemMutation` — `adjustOrderLine(orderLineId:, quantity:)`
- **Required endpoint**: `PATCH /api/v1/cart/items/:lineId`
- **Request body**: `{ quantity: number }`

#### `ApplyPromotionCodeMutation` — `applyCouponCode(couponCode:)`
- **Required endpoint**: `POST /api/v1/cart/coupons` (or `POST /api/v1/cart/coupons/:code`)

#### `RemovePromotionCodeMutation` — `removeCouponCode(couponCode:)`
- **Required endpoint**: `DELETE /api/v1/cart/coupons/:code`

---

### 2.3 Auth / Account

#### `LoginMutation` — `login(username:, password:)`
- **Required endpoint**: `POST /api/v1/auth/login`
- **Request body**: `{ username: string; password: string }`
- **Response**: `{ __typename: 'CurrentUser', id: string, identifier: string } | ErrorResult`
- **Auth token**: Returned in response header `vendure-auth-token`

#### `LogoutMutation` — `logout`
- **Required endpoint**: `POST /api/v1/auth/logout`

#### `RegisterCustomerAccountMutation` — `registerCustomerAccount(input: { emailAddress, firstName?, lastName?, phoneNumber?, password })`
- **Required endpoint**: `POST /api/v1/auth/register`
- **Request body**: `{ emailAddress, firstName?, lastName?, phoneNumber?, password }`

#### `VerifyCustomerAccountMutation` — `verifyCustomerAccount(token:, password?:)`
- **Required endpoint**: `POST /api/v1/auth/verify`
- **Request body**: `{ token: string; password?: string }`

#### `RequestPasswordResetMutation` — `requestPasswordReset(emailAddress:)`
- **Required endpoint**: `POST /api/v1/auth/forgot-password`
- **Request body**: `{ emailAddress: string }`

#### `ResetPasswordMutation` — `resetPassword(token:, password:)`
- **Required endpoint**: `POST /api/v1/auth/reset-password`
- **Request body**: `{ token: string; password: string }`

#### `UpdateCustomerPasswordMutation` — `updateCustomerPassword(currentPassword:, newPassword:)`
- **Required endpoint**: `POST /api/v1/auth/change-password`
- **Request body**: `{ currentPassword: string; newPassword: string }`

#### `UpdateCustomerMutation` — `updateCustomer(input: { firstName, lastName })`
- **Required endpoint**: `PATCH /api/v1/account/profile`
- **Request body**: `{ firstName: string; lastName: string }`

#### `RequestUpdateCustomerEmailAddressMutation` — `requestUpdateCustomerEmailAddress(password:, newEmailAddress:)`
- **Required endpoint**: `POST /api/v1/auth/change-email`
- **Request body**: `{ password: string; newEmailAddress: string }`

#### `UpdateCustomerEmailAddressMutation` — `updateCustomerEmailAddress(token:)`
- **Required endpoint**: `POST /api/v1/auth/verify-email`
- **Request body**: `{ token: string }`

#### `GetActiveCustomerQuery` — `activeCustomer`
- **Required endpoint**: `GET /api/v1/auth/me`
- **Response**: `{ id: string; firstName: string; lastName: string; emailAddress: string } | null`

---

### 2.4 Customer Addresses

#### `GetCustomerAddressesQuery` — `activeCustomer { addresses }`
- **Required endpoint**: `GET /api/v1/account/addresses`
- **Response**:
```typescript
Array<{
  id: string;
  fullName: string;
  company: string;
  streetLine1: string;
  streetLine2: string;
  city: string;
  province: string;
  postalCode: string;
  country: { id: string; code: string; name: string };
  phoneNumber: string;
  defaultShippingAddress: boolean;
  defaultBillingAddress: boolean;
}>
```

#### `CreateCustomerAddressMutation` — `createCustomerAddress(input: CreateAddressInput)`
- **Required endpoint**: `POST /api/v1/account/addresses`
- **Request body**:
```typescript
{
  fullName: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  countryCode: string;
  phoneNumber: string;
  company?: string;
}
```

#### `UpdateCustomerAddressMutation` — `updateCustomerAddress(input: UpdateAddressInput)`
- **Required endpoint**: `PATCH /api/v1/account/addresses/:id`
- **Request body**: Same as create, with `defaultShippingAddress?`, `defaultBillingAddress?`

#### `DeleteCustomerAddressMutation` — `deleteCustomerAddress(id:)`
- **Required endpoint**: `DELETE /api/v1/account/addresses/:id`

---

### 2.5 Checkout

#### `GetEligibleShippingMethodsQuery` — `eligibleShippingMethods`
- **Required endpoint**: `GET /api/v1/checkout/shipping-methods`
- **Response**: `Array<{ id: string; name: string; code: string; description: string; priceWithTax: number }>`

#### `GetEligiblePaymentMethodsQuery` — `eligiblePaymentMethods`
- **Required endpoint**: `GET /api/v1/checkout/payment-methods`
- **Response**: `Array<{ id: string; name: string; code: string; description: string; isEligible: boolean; eligibilityMessage: string }>`

#### `SetOrderShippingAddressMutation` — `setOrderShippingAddress(input: CreateAddressInput)`
- **Required endpoint**: `POST /api/v1/checkout/shipping-address`
- **Request body**: Same as address input (fullName, company, streetLine1, etc.)

#### `SetOrderBillingAddressMutation` — `setOrderBillingAddress(input: CreateAddressInput)`
- **Required endpoint**: `POST /api/v1/checkout/billing-address`
- **Request body**: Same as address input

#### `SetOrderShippingMethodMutation` — `setOrderShippingMethod(shippingMethodId: [ID!])`
- **Required endpoint**: `POST /api/v1/checkout/shipping-method`
- **Request body**: `{ shippingMethodId: string }`

#### `TransitionOrderToStateMutation` — `transitionOrderToState(state:)`
- **Required endpoint**: `POST /api/v1/checkout/transition`
- **Request body**: `{ state: string }`
- **States**: `AddingItems` → `ArrangingPayment` → `PaymentSettled` → ...

#### `AddPaymentToOrderMutation` — `addPaymentToOrder(input: { method, metadata })`
- **Required endpoint**: `POST /api/v1/checkout/payment`
- **Request body**: `{ method: string; metadata: Record<string, unknown> }`

#### `SetCustomerForOrderMutation` — `setCustomerForOrder(input: { emailAddress, firstName, lastName, phoneNumber? })`
- **Used by**: Guest checkout contact step
- **Required endpoint**: `POST /api/v1/checkout/customer`
- **Request body**: `{ emailAddress: string; firstName: string; lastName: string; phoneNumber?: string }`

---

### 2.6 Orders

#### `GetCustomerOrdersQuery` — `activeCustomer { orders(options:) }`
- **Required endpoint**: `GET /api/v1/account/orders?page=&take=`
- **Response**:
```typescript
{
  items: Array<{
    id: string;
    code: string;
    state: string;
    totalWithTax: number;
    currencyCode: string;
    createdAt: string;
    updatedAt: string;
    lines: Array<{
      id: string;
      productVariant: {
        id: string;
        name: string;
        product: { id: string; name: string; featuredAsset: { id: string; preview: string } | null };
      };
    }>;
  }>;
  totalItems: number;
}
```

#### `GetOrderDetailQuery` / `GetOrderByCodeQuery` — `orderByCode(code:)`
- **Used by**: `/account/orders/[code]`, `/order-confirmation/[code]`
- **Required endpoint**: `GET /api/v1/orders/:code`
- **Response**:
```typescript
{
  id: string;
  code: string;
  state: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  totalQuantity: number;
  subTotal: number;
  subTotalWithTax: number;
  shipping: number;
  shippingWithTax: number;
  total: number;
  totalWithTax: number;
  currencyCode: string;
  customer: { id: string; firstName: string; lastName: string; emailAddress: string };
  shippingAddress: { fullName: string; company: string; streetLine1: string; streetLine2: string; city: string; province: string; postalCode: string; country: string; phoneNumber: string };
  billingAddress: { ... same ... };
  shippingLines: Array<{ shippingMethod: { id: string; name: string; description: string }; priceWithTax: number }>;
  payments: Array<{ id: string; method: string; amount: number; state: string; transactionId: string; createdAt: string }>;
  lines: Array<{ id: string; productVariant: { id: string; name: string; sku: string; product: { id: string; name: string; slug: string; featuredAsset: { id: string; preview: string } | null } }; unitPriceWithTax: number; quantity: number; linePriceWithTax: number }>;
  discounts: Array<{ description: string; amountWithTax: number }>;
}
```

---

### 2.7 Articles

#### `GetArticlesDocument` — `articles(skip:, take:, search?, category?, tag?)`
- **Required endpoint**: `GET /api/v1/articles?page=&search=&category=&tag=`
- **Response**:
```typescript
{
  items: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    author: string | null;
    publishedAt: string | null;
    viewCount: number;
    featuredAsset: { id: string; preview: string; source: string; width: number; height: number; name: string } | null;
    category: { id: string; name: string; slug: string } | null;
    tags: Array<{ id: string; name: string; slug: string }>;
  }>;
  totalItems: number;
}
```

#### `GetArticleBySlugDocument` — `article(slug:)`
- **Required endpoint**: `GET /api/v1/articles/:slug`
- **Response**: Same as article list + `content: string (HTML)`, `createdAt`, `updatedAt`, `seoTitle`, `seoDescription`, `seoKeywords`, `assets[]`

#### `GetArticleCategoriesDocument` — `articleCategories`
- **Required endpoint**: `GET /api/v1/article-categories`
- **Response**: `Array<{ id: string; name: string; slug: string }>`

#### `GetArticleTagsDocument` — `articleTags`
- **Required endpoint**: `GET /api/v1/article-tags`
- **Response**: `Array<{ id: string; name: string; slug: string }>` (not currently used in frontend but query exists)

---

### 2.8 Misc

#### `GetAvailableCountriesQuery` — `availableCountries`
- **Used by**: Checkout, Account Addresses
- **Required endpoint**: `GET /api/v1/countries`
- **Response**: `Array<{ id: string; code: string; name: string }>`

#### `GetActiveChannelQuery` — `activeChannel`
- **Used by**: Currency switching, cache revalidation
- **Required endpoint**: `GET /api/v1/channel`
- **Response**:
```typescript
{
  id: string;
  code: string;
  defaultLanguageCode: string;
  availableLanguageCodes: string[];
  defaultCurrencyCode: string;
  availableCurrencyCodes: string[];
}
```
- **Used for**: Validating selected currency against `availableCurrencyCodes`

---

## 3. Server Actions (Form Submissions)

All server actions use `'use server'` and call `mutate()` on the Vendure API. They need equivalent REST implementations:

| Action | File | Calls | Equivalent REST |
|--------|------|-------|-----------------|
| `loginAction` | `sign-in/actions.ts` | `LoginMutation` | `POST /api/v1/auth/login` |
| `logoutAction` | `sign-in/actions.ts` | `LogoutMutation` | `POST /api/v1/auth/logout` |
| `registerAction` | `register/actions.ts` | `RegisterCustomerAccountMutation` | `POST /api/v1/auth/register` |
| `verifyAccountAction` | `verify/actions.ts` | `VerifyCustomerAccountMutation` | `POST /api/v1/auth/verify` |
| `requestPasswordResetAction` | `forgot-password/actions.ts` | `RequestPasswordResetMutation` | `POST /api/v1/auth/forgot-password` |
| `resetPasswordAction` | `reset-password/actions.ts` | `ResetPasswordMutation` | `POST /api/v1/auth/reset-password` |
| `updatePasswordAction` | `account/profile/actions.ts` | `UpdateCustomerPasswordMutation` | `POST /api/v1/auth/change-password` |
| `updateCustomerAction` | `account/profile/actions.ts` | `UpdateCustomerMutation` | `PATCH /api/v1/account/profile` |
| `requestEmailUpdateAction` | `account/profile/actions.ts` | `RequestUpdateCustomerEmailAddressMutation` | `POST /api/v1/auth/change-email` |
| `addToCart` | `product/[slug]/actions.ts` | `AddToCartMutation` | `POST /api/v1/cart/items` |
| `removeFromCart` | `cart/actions.ts` | `RemoveFromCartMutation` | `DELETE /api/v1/cart/items/:lineId` |
| `adjustQuantity` | `cart/actions.ts` | `AdjustCartItemMutation` | `PATCH /api/v1/cart/items/:lineId` |
| `applyPromotionCode` | `cart/actions.ts` | `ApplyPromotionCodeMutation` | `POST /api/v1/cart/coupons` |
| `removePromotionCode` | `cart/actions.ts` | `RemovePromotionCodeMutation` | `DELETE /api/v1/cart/coupons/:code` |
| `setShippingAddress` | `checkout/actions.ts` | `SetOrderShippingAddressMutation` | `POST /api/v1/checkout/shipping-address` |
| `setShippingMethod` | `checkout/actions.ts` | `SetOrderShippingMethodMutation` | `POST /api/v1/checkout/shipping-method` |
| `createCustomerAddress` | `checkout/actions.ts` | `CreateCustomerAddressMutation` | `POST /api/v1/account/addresses` |
| `transitionToArrangingPayment` | `checkout/actions.ts` | `TransitionOrderToStateMutation` | `POST /api/v1/checkout/transition` |
| `placeOrder` | `checkout/actions.ts` | `AddPaymentToOrderMutation` | `POST /api/v1/checkout/payment` |
| `setCustomerForOrder` | `checkout/actions.ts` | `SetCustomerForOrderMutation` | `POST /api/v1/checkout/customer` |
| `createAddress` | `account/addresses/actions.ts` | `CreateCustomerAddressMutation` | `POST /api/v1/account/addresses` |
| `updateAddress` | `account/addresses/actions.ts` | `UpdateCustomerAddressMutation` | `PATCH /api/v1/account/addresses/:id` |
| `deleteAddress` | `account/addresses/actions.ts` | `DeleteCustomerAddressMutation` | `DELETE /api/v1/account/addresses/:id` |
| `setDefaultShippingAddress` | `account/addresses/actions.ts` | `UpdateCustomerAddressMutation` (with `defaultShippingAddress: true`) | `PATCH /api/v1/account/addresses/:id` |
| `setDefaultBillingAddress` | `account/addresses/actions.ts` | `UpdateCustomerAddressMutation` (with `defaultBillingAddress: true`) | `PATCH /api/v1/account/addresses/:id` |
| `switchCurrency` | `lib/actions/switch-currency.ts` | Sets cookie + calls `updateTag` | No API needed (client-side) |
| `getProductForQuickView` | `components/aura/quick-view-actions.ts` | `GetProductDetailQuery` | `GET /api/v1/products/:slug` |

---

## 4. Auth Flow

### Token Management
- **Cookie name**: `vendure-auth-token` (configurable via `VENDURE_AUTH_TOKEN_COOKIE`)
- **Header name**: `vendure-auth-token` (configurable via `VENDURE_AUTH_TOKEN_HEADER`)
- **How it works**: Server reads token from cookie, sends as `Authorization: Bearer <token>` header
- **Token source**: Returned from `login`, `resetPassword`, `verifyAccount`, and `addToCart` mutations via HTTP response header

### Auth Cookie Lifecycle
```
Login → Server Action → API returns `vendure-auth-token` response header
  → `setAuthToken(token)` stores in cookie
  → Subsequent requests: cookie → `getAuthToken()` → `Authorization: Bearer <token>`
  → Logout → `removeAuthToken()` deletes cookie
```

### Two Auth Modes (from frontend perspective)
1. **No auth**: Guest cart uses `session_id` cookie (already implemented in backend)
2. **Bearer token**: All authenticated requests send token from cookie

---

## 5. Checkout Flow (Complete)

The checkout is a 5-step accordion for guests (contact → shipping → delivery → payment → review) or 4-step for logged-in (shipping → delivery → payment → review).

### Step-by-step

1. **Contact (guest only)**: `setCustomerForOrder({ emailAddress, firstName, lastName })` → `POST /api/v1/checkout/customer`
2. **Shipping Address**: 
   - Logged-in: Select from saved addresses → `setShippingAddress()` 
   - Guests: Fill form → `setShippingAddress()`
   - Optionally create new saved address via `createCustomerAddress()`
   - Same-address-for-billing checkbox → `setOrderBillingAddress()`
3. **Delivery**: `setShippingMethod(methodId)` → `POST /api/v1/checkout/shipping-method`
4. **Payment**: User selects from eligible payment methods (no API call, just UI state)
5. **Review**: `placeOrder(paymentMethodCode)` → calls `transitionToArrangingPayment()` then `addPaymentToOrder()`

### Order State Machine Required
```
AddingItems → ArrangingPayment → PaymentSettled → Shipped → Delivered → Cancelled
```

---

## 6. Caching Strategy (Must Preserve)

The frontend uses `next/cache` with these patterns:

| Cache Tag Pattern | TTL | Scope |
|------------------|-----|-------|
| `product-{slug}-{locale}-{currency}` | hours | Single product |
| `products` | hours | Product lists |
| `collection-{slug}-{locale}-{currency}` | hours | Collection products |
| `collection-meta-{slug}-{locale}` | hours | Collection metadata |
| `collection` | hours | All collection data |
| `featured-{locale}-{currency}` | days | Featured products |
| `featured-cat-{slug}-{locale}-{currency}` | hours | Category tab products |
| `related-products-{slug}-{locale}-{currency}` | hours | Related products |
| `navbar-collections-{locale}` | days | Navigation collections |
| `cart` (private) | minutes | User cart |
| `active-order` (private) | minutes | Active order |
| app-wide article cache | 1 hour | Articles |

**Revalidation**: `POST /api/revalidate` with Bearer token + tags array. The endpoint expands tags per locale/currency and calls `revalidateTag()`.

**Tag rules**:
- `locale-only`: collections, countries, footer, navbar-collections, blogs, mobile-nav
- `currency-dependent`: products, featured, collection-*, related-products-*, product-*

---

## 7. Complete API Endpoint Inventory

### Storefront APIs Required

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/products` | Optional | Search with q, collectionSlug, facets, sort, page, groupByProduct |
| GET | `/api/v1/products/featured` | No | Featured products (limit) |
| GET | `/api/v1/products/:slug` | No | Product detail |
| GET | `/api/v1/products/:slug/variants` | No | Variant list for product |
| GET | `/api/v1/products/:slug/related` | No | Related products |
| GET | `/api/v1/collections` | No | Top collections (root, active) |
| GET | `/api/v1/collections/:slug` | No | Collection detail |
| GET | `/api/v1/categories` | (same as collections) | Alias for collections |
| GET | `/api/v1/brands` | No | Brand listing |
| GET | `/api/v1/brands/:slug` | No | Brand detail |
| GET | `/api/v1/brands/:slug/products` | No | Products by brand |
| GET | `/api/v1/cart` | Optional / Bearer | Get active order (or session) |
| POST | `/api/v1/cart/items` | Optional | Add item (variantId, quantity) |
| PATCH | `/api/v1/cart/items/:lineId` | Optional | Update quantity |
| DELETE | `/api/v1/cart/items/:lineId` | Optional | Remove item |
| POST | `/api/v1/cart/coupons` | Optional | Apply coupon code |
| DELETE | `/api/v1/cart/coupons/:code` | Optional | Remove coupon |
| POST | `/api/v1/cart/merge` | Bearer | Merge guest cart into user cart |
| GET | `/api/v1/checkout/shipping-methods` | Bearer | Eligible shipping methods |
| GET | `/api/v1/checkout/payment-methods` | Bearer | Eligible payment methods |
| POST | `/api/v1/checkout/shipping-address` | Bearer / Guest | Set shipping address |
| POST | `/api/v1/checkout/billing-address` | Bearer / Guest | Set billing address |
| POST | `/api/v1/checkout/shipping-method` | Bearer | Set shipping method |
| POST | `/api/v1/checkout/customer` | Guest | Set customer info (guest) |
| POST | `/api/v1/checkout/transition` | Bearer | Transition order state |
| POST | `/api/v1/checkout/payment` | Bearer | Add payment |
| GET | `/api/v1/orders/:code` | Bearer | Get order by code |
| GET | `/api/v1/countries` | No | Available countries |
| GET | `/api/v1/channel` | No | Active channel (currencies, langs) |
| GET | `/api/v1/articles` | No | Article list (skip, take, search, category, tag) |
| GET | `/api/v1/articles/:slug` | No | Article detail |
| GET | `/api/v1/article-categories` | No | Article categories |
| GET | `/api/v1/article-tags` | No | Article tags |
| POST | `/api/v1/auth/login` | No | Login |
| POST | `/api/v1/auth/logout` | Bearer | Logout |
| GET | `/api/v1/auth/me` | Bearer | Get active customer |
| POST | `/api/v1/auth/register` | No | Register |
| POST | `/api/v1/auth/verify` | No | Verify email |
| POST | `/api/v1/auth/forgot-password` | No | Request reset |
| POST | `/api/v1/auth/reset-password` | No | Reset password |
| POST | `/api/v1/auth/change-password` | Bearer | Update password |
| POST | `/api/v1/auth/change-email` | Bearer | Request email change |
| POST | `/api/v1/auth/verify-email` | No | Confirm email change |
| GET | `/api/v1/account/orders` | Bearer | Customer orders (paginated) |
| GET | `/api/v1/account/addresses` | Bearer | Customer addresses |
| POST | `/api/v1/account/addresses` | Bearer | Create address |
| PATCH | `/api/v1/account/addresses/:id` | Bearer | Update address |
| DELETE | `/api/v1/account/addresses/:id` | Bearer | Delete address |
| PATCH | `/api/v1/account/profile` | Bearer | Update name |

---

## 8. Missing Backend Features

These backend features are NOT yet implemented and must be built:

### Not Started
- **Checkout flow**: All checkout endpoints (shipping/billing address, shipping method, payment, transition, guest customer)
- **Order management**: Order creation from cart, status transitions, payment recording
- **Article/categories/tags CRUD**: Read endpoints for articles, categories, tags
- **Countries endpoint**: Country list for address forms
- **Channel endpoint**: Channel config with available currencies/languages
- **Featured products**: `GET /api/v1/products/featured`
- **Related products**: `GET /api/v1/products/:slug/related`
- **Brand endpoints**: Storefront brand list, detail, products
- **Product variants endpoint**: `GET /api/v1/products/:slug/variants`

### Partially Implemented
- **Search with facets/filters/sort/pagination**: Backend has `GET /api/v1/products` but Facet values aggregation (for filter sidebar) is missing. The frontend's `SearchProductsQuery` expects `facetValues` with `count` and `facetValue.facet` grouping.
- **Cart with coupons**: Backend has cart CRUD but no coupon code apply/remove
- **Cart merge**: Backend has merge endpoint but checkout flow needs integration
- **Guest carts**: Backend has session_id support but need checkout integration
- **Auth token in response headers**: Backend currently stores tokens in DB; frontend expects them in response headers for cookie storage. Need to send token back in custom header.

### Key Data Gaps
- **Price format**: Frontend expects `priceWithTax` (integers in cents). Backend stores `base_price` in products and `price` in variants. Need to ensure prices are returned as integers (cents).
- **Stock levels**: Frontend expects `stockLevel: 'IN_STOCK' | 'OUT_OF_STOCK'` on each variant. Backend has inventory with `quantity` and `reserved`. Need computed stock level.
- **Product assets/variants/images**: Backend uses `ProductImageEntity`; frontend expects `assets` with `preview` and `source`. Need to map.
- **Option groups with `code`**: Frontend expects `optionGroups[].code` and `options[].code` for URL parameter matching. Backend entities don't have `code` fields.

---

## 9. Duplicated Requests

**`getActiveCustomer`**: Called on every page with NavbarUser (layout) and `use cache: private` avoids re-fetch for same user. This is fine.

**`GetActiveOrderQuery` (cart)**: Called in both `cart.tsx` (page) and `navbar-cart.tsx` (layout) but with different cache tags (`'cart'` vs `['cart', 'active-order']`). The `'use cache: private'` deduplicates within the same request.

**`GetTopCollectionsQuery`**: Called once in `NavbarCollections` and once in `FeaturedCategoryTabs`. Both use `'use cache'` with `cacheLife('days')` — fine.

**Potential duplicate**: `GetAvailableCountriesQuery` is called in both `/checkout` and `/account/addresses` pages. No cross-page cache sharing without dedicated cache store.

---

## 10. Optimization Opportunities

### Backend
1. **Search endpoint returns facet aggregations**: The frontend's `SearchProductsQuery` expects `facetValues[]` with `count` per facet value. This requires a separate aggregation query (GROUP BY). Add this to the search response.
2. **Product detail includes everything**: Single endpoint returns variants, assets, optionGroups, collections. Avoids N+1 queries.
3. **Cart response is the "order" object**: Same data model for cart, checkout, and order detail. Use a single `OrderDto` that works for all three (with optional fields).
4. **Prices in cents, integers**: Frontend displays via `<Price value={n} currencyCode={c} />` which formats as `n/100`. Keep prices as integers.
5. **Country code in address**: Frontend expects `country` as string name AND `country.code`. Must provide both.

### Frontend (no changes, but worth noting for backend design)
1. **`formatArticleDate` on client**: Can be moved to server to reduce bundle.
2. **Quick view calls product detail API**: Same as the product page. Cached by `'use cache'` but could be aggressive.
3. **News section uses deprecated `getAllBlogs` wrapper**: Calls `getArticles({ take: 100 })` instead of `{ take: 3 }`. Unnecessary over-fetching.
4. **Address form `defaultValues` uses customer name**: Uses `order.customer.firstName` ` lastName` concatenation. No separate field for full name — ensure backend returns customer name fields.
5. **Order confirmation fetches custom query**: Instead of reusing `GetOrderDetailQuery`, it defines its own `GetOrderByCodeQuery` inline. Different field set (no payments, no billing, no shipping lines). Backend can serve both from the same endpoint.

---

## 11. Auth Token Contract

Critical detail: The frontend extracts auth tokens from **response headers**, not response body.

```typescript
// In api.ts:
const VENDURE_AUTH_TOKEN_HEADER = process.env.VENDURE_AUTH_TOKEN_HEADER || 'vendure-auth-token';

function extractAuthToken(headers: Headers): string | null {
    return headers.get(VENDURE_AUTH_TOKEN_HEADER);
}
```

Mutations that expect a token response:
- `login` → returns `vendure-auth-token` header
- `resetPassword` → returns `vendure-auth-token` header
- `verifyCustomerAccount` → returns `vendure-auth-token` header
- `addToCart` (surprisingly) → returns `vendure-auth-token` header (for guest→auth token creation?)

**Implementation required**: The backend must set a custom response header `vendure-auth-token` on login/reset/verify/addToCart responses.

---

## 12. Channel/Currency Contract

The frontend sends `languageCode` and `currencyCode` as URL query params to the API:

```
POST /graphql
  ?languageCode=en
  &currencyCode=USD
```

For REST, the equivalent could be:
- `Accept-Language` header (or query param)
- `X-Currency-Code` header (or query param)

Every product price, cart total, and order total must respect the requested currency.
