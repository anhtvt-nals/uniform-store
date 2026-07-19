# API Mapping — Frontend to Backend

## Architecture

The backend serves two interfaces:

1. **REST API** at `/api/v1/*` — native endpoints for the admin panel and future consumers.
2. **GraphQL Compatibility Proxy** at `/shop-api` — a single `POST /shop-api` endpoint that accepts the exact GraphQL queries/mutations the frontend sends and translates them to REST internally. This requires **zero frontend changes**.

```
Frontend (Next.js)
  │
  │ POST /shop-api  (VENDURE_SHOP_API_URL)
  │ Body: { query, variables }
  │ Headers: { Authorization, vendure-token }
  │ Query: ?languageCode=en&currencyCode=USD
  ▼
GraphQL Proxy (NestJS)
  │
  ├── Parses query string → identifies operation name
  ├── Maps to internal REST/service call
  ├── Transforms response to exact GraphQL shape
  └── Returns { data: { ... } } with auth header passthrough
```

---

## 1. GraphQL Proxy — Design

### Endpoint

```
POST /shop-api
```

### Request

```typescript
Headers: {
  "Authorization"?: "Bearer <token>",          // auth token from cookie
  "vendure-token"?: string,                     // channel token (default: __default_channel__)
}
Query: {
  languageCode?: "en" | "vi" | "de",
  currencyCode?: "USD" | "VND",
}
Body: {
  query: string,    // GraphQL operation string
  variables?: Record<string, unknown>,
}
```

### Response

```typescript
Headers: {
  "vendure-auth-token"?: string,  // set on login/reset/verify/addToCart
}
Body: {
  data: Record<string, unknown>,   // operation-specific response
  errors?: Array<{ message: string; [key: string]: unknown }>,
}
```

### Operation Detection

The proxy parses the incoming `query` string to extract the first operation definition name. A lightweight regex-based parser matches the operation name and routes to the correct handler:

```
Regex: /^\s*(?:query|mutation)\s+(\w+)/m
```

Operation name → handler mapping is defined in a registry:

```typescript
const OPERATION_REGISTRY = {
  // Queries
  GetTopCollections: handleGetTopCollections,
  GetActiveCustomer: handleGetActiveCustomer,
  SearchProducts: handleSearchProducts,
  GetProductDetail: handleGetProductDetail,
  GetActiveOrder: handleGetActiveOrder,
  GetActiveOrderForCheckout: handleGetActiveOrderForCheckout,
  GetCustomerAddresses: handleGetCustomerAddresses,
  GetEligibleShippingMethods: handleGetEligibleShippingMethods,
  GetEligiblePaymentMethods: handleGetEligiblePaymentMethods,
  GetAvailableCountries: handleGetAvailableCountries,
  GetCustomerOrders: handleGetCustomerOrders,
  GetOrderDetail: handleGetOrderDetail,
  GetOrderByCode: handleGetOrderByCode,
  GetActiveChannel: handleGetActiveChannel,
  GetCollectionProducts: handleGetCollectionProducts,
  GetArticles: handleGetArticles,
  GetArticleBySlug: handleGetArticleBySlug,
  GetArticleCategories: handleGetArticleCategories,
  GetArticleTags: handleGetArticleTags,

  // Mutations
  Login: handleLogin,
  Logout: handleLogout,
  AddToCart: handleAddToCart,
  RemoveFromCart: handleRemoveFromCart,
  AdjustCartItem: handleAdjustCartItem,
  ApplyPromotionCode: handleApplyPromotionCode,
  RemovePromotionCode: handleRemovePromotionCode,
  CreateCustomerAddress: handleCreateCustomerAddress,
  UpdateCustomerAddress: handleUpdateCustomerAddress,
  DeleteCustomerAddress: handleDeleteCustomerAddress,
  SetOrderShippingAddress: handleSetOrderShippingAddress,
  SetOrderBillingAddress: handleSetOrderBillingAddress,
  SetOrderShippingMethod: handleSetOrderShippingMethod,
  TransitionOrderToState: handleTransitionOrderToState,
  AddPaymentToOrder: handleAddPaymentToOrder,
  SetCustomerForOrder: handleSetCustomerForOrder,
  RegisterCustomerAccount: handleRegisterCustomerAccount,
  VerifyCustomerAccount: handleVerifyCustomerAccount,
  RequestPasswordReset: handleRequestPasswordReset,
  ResetPassword: handleResetPassword,
  UpdateCustomerPassword: handleUpdateCustomerPassword,
  UpdateCustomer: handleUpdateCustomer,
  RequestUpdateCustomerEmailAddress: handleRequestUpdateCustomerEmailAddress,
  UpdateCustomerEmailAddress: handleUpdateCustomerEmailAddress,
};
```

Each handler:
1. Reads `variables` from the incoming body
2. Reads `languageCode`, `currencyCode` from query params
3. Reads auth token from `Authorization` header
4. Calls the appropriate REST API endpoint internally (or calls services/DB directly)
5. Transforms the response into the exact GraphQL response shape
6. Sets `vendure-auth-token` response header if applicable

---

## 2. Complete Operation-to-Endpoint Mapping

### 2.1 Queries

---

#### Q01: `GetTopCollections`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `GET /api/v1/collections` |
| **Method** | GET |
| **Auth** | None |
| **GraphQL** | `query GetTopCollections { collections(options: { filter: { parentId: { eq: "1" } } }) { items { id name slug } } }` |
| **Variables** | None (parentId filter is hardcoded in query) |
| **Query Params** | `languageCode`, `parentId=1` |
| **Status** | 200 |

**Response shape**:
```typescript
{
  data: {
    collections: {
      items: Array<{
        id: string;
        name: string;
        slug: string;
      }>;
    };
  };
}
```

---

#### Q02: `GetActiveCustomer`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `GET /api/v1/auth/me` |
| **Method** | GET |
| **Auth** | Bearer token |
| **GraphQL** | `query GetActiveCustomer { activeCustomer { ...ActiveCustomer } }` |
| **Response (`ActiveCustomerFragment`)** | `{ id, firstName, lastName, emailAddress }` |
| **Status** | 200 (null body when unauthenticated) |

**Proxy behavior**: Calls REST endpoint. Returns `{ data: { activeCustomer: null } }` when 401 or user not found. Returns `{ data: { activeCustomer: { id, firstName, lastName, emailAddress } } }` when authenticated.

---

#### Q03: `SearchProducts`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `GET /api/v1/products` |
| **Method** | GET |
| **Auth** | None |
| **GraphQL** | `query SearchProducts($input: SearchInput!) { search(input: $input) { totalItems items { ...ProductCard } facetValues { count facetValue { id name facet { id name } } } } }` |
| **Variables** | `input: SearchInputParams` |

**SearchInputParams mapping**:
```typescript
// Frontend sends (via buildSearchInput):
{
  term?: string;          // → q query param
  collectionSlug?: string; // → collectionSlug query param
  take: number;           // → take query param (default 12)
  skip: number;           // → skip query param (page based)
  groupByProduct: boolean;// → groupByProduct query param (default true)
  sort: { name?: 'ASC'|'DESC'; price?: 'ASC'|'DESC' };  // → sort query param
  facetValueFilters?: Array<{ and: string }>;  // → facets query param (comma-separated IDs)
}
```

**REST mapping**: `GET /api/v1/products?q=&collectionSlug=&page=&sort=&facets=&take=&skip=`

**Response shape**:
```typescript
{
  data: {
    search: {
      totalItems: number;
      items: Array<ProductCard>;
      facetValues: Array<{
        count: number;
        facetValue: {
          id: string;
          name: string;
          facet: { id: string; name: string };
        };
      }>;
    };
  };
}
```

**Where `ProductCard` is**:
```typescript
{
  productId: string;
  productName: string;
  slug: string;
  productAsset: { id: string; preview: string } | null;
  priceWithTax: { __typename: 'PriceRange', min: number, max: number } | { __typename: 'SinglePrice', value: number };
  currencyCode: string;
}
```

**Compatibility note — priceWithTax**: The frontend expects a discriminated union `PriceRange | SinglePrice`. For products with a single variant, return `{ __typename: 'SinglePrice', value: price }`. For products with multiple variants with different prices, return `{ __typename: 'PriceRange', min, max }`. The proxy must compute this from variant prices.

**Compatibility note — productAsset**: The proxy maps `ProductEntity` images to the `productAsset` field. Use the first active image sorted by `sortOrder`. Map `id` and `preview` (use the image URL for both).

**Compatibility note — facetValues**: The REST endpoint must return a `facetValues` array with aggregated counts. This is a GROUP BY query on the `product_facet_values` / `facet_values` / `facet_groups` tables.

**Status**: 200

---

#### Q04: `GetProductDetail`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `GET /api/v1/products/:slug` |
| **Method** | GET |
| **Auth** | None |
| **GraphQL** | `query GetProductDetail($slug: String!) { product(slug: $slug) { id name description slug assets { id preview source } variants { id name sku priceWithTax stockLevel options { id code name groupId group { id code name } } } optionGroups { id code name options { id code name } } collections { id name slug parent { id } } } }` |
| **Variables** | `{ slug: string }` |
| **Query Params** | `languageCode` |
| **Status** | 200 |

**Response shape**:
```typescript
{
  data: {
    product: {
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
    };
  };
}
```

**Status (not found)**: 200 with `{ data: { product: null } }` — NOT 404. The frontend checks `if (!product) notFound()`.

**Compatibility notes**:
- **assets** map from `ProductImageEntity`. `preview` and `source` use the same image URL.
- **variants[].stockLevel**: Compute from `InventoryEntity`. If `inventory.quantity - inventory.reserved > 0` → `'IN_STOCK'`, else → `'OUT_OF_STOCK'`.
- **variants[].options[].code**: The backend `ProductOptionEntity` doesn't have a `code` field. Add `code` to the entity, or derive it from the option name (slugified). The frontend uses `option.code` in URL params for variant selection.
- **options[].group**: The proxy must populate `groupId` (the group's id) and `group` (the full group object) on each variant option. The frontend access `variant.options[].groupId` and `variant.options[].group.code/name/id`.
- **optionGroups[].code**: Same — `ProductOptionGroupEntity` needs a `code` field.

---

#### Q05: `GetActiveOrder` / `GetActiveOrderForCheckout`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `GET /api/v1/cart` |
| **Method** | GET |
| **Auth** | Bearer token (or session_id cookie for guest) |
| **GraphQL** | Two queries returning the same order shape with different fields |
| **Variables** | None |
| **Query Params** | `languageCode`, `currencyCode` |
| **Status** | 200 |

Two distinct response shapes used by the frontend:

**Cart-only (`GetActiveOrderQuery`)**:
```typescript
{
  data: {
    activeOrder: {
      id: string;
      code: string;
      state: string;
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
    };
  };
}
```

**Checkout (`GetActiveOrderForCheckoutQuery`)** — same as above plus:
```typescript
{
  // ... all cart fields +
  customer: { id, firstName, lastName, emailAddress, phoneNumber } | null;
  shippingAddress: { fullName, company, streetLine1, streetLine2, city, province, postalCode, country, phoneNumber } | null;
  billingAddress: { ... same ... } | null;
  shippingLines: Array<{ shippingMethod: { id, name, description }; priceWithTax: number }>;
}
```

**Compatibility layer**: The proxy detects which query version is being called (by checking for `customer` or `shippingAddress` fields in the query string) and returns the appropriate subset. The REST endpoint returns the full checkout-level order object.

---

#### Q06: `GetCustomerAddresses`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `GET /api/v1/account/addresses` |
| **Method** | GET |
| **Auth** | Bearer token |
| **GraphQL** | `query GetCustomerAddresses { activeCustomer { id addresses { id fullName company streetLine1 streetLine2 city province postalCode country { id code name } phoneNumber defaultShippingAddress defaultBillingAddress } } }` |
| **Response** | Wrapped in `activeCustomer` container |
| **Status** | 200 |

**Proxy response shape**:
```typescript
{
  data: {
    activeCustomer: {
      id: string;
      addresses: Array<{
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
      }>;
    } | null;
  };
}
```

**Note**: `country` is an object with `{ id, code, name }` (not a string). The proxy must fetch country data.

---

#### Q07: `GetEligibleShippingMethods`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `GET /api/v1/checkout/shipping-methods` |
| **Method** | GET |
| **Auth** | Bearer token |
| **Response** | `{ data: { eligibleShippingMethods: Array<{ id, name, code, description, priceWithTax }> } }` |
| **Status** | 200 |

---

#### Q08: `GetEligiblePaymentMethods`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `GET /api/v1/checkout/payment-methods` |
| **Method** | GET |
| **Auth** | Bearer token |
| **Response** | `{ data: { eligiblePaymentMethods: Array<{ id, name, code, description, isEligible, eligibilityMessage }> } }` |
| **Status** | 200 |

---

#### Q09: `GetAvailableCountries`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `GET /api/v1/countries` |
| **Method** | GET |
| **Auth** | None |
| **Response** | `{ data: { availableCountries: Array<{ id, code, name }> } }` |
| **Status** | 200 |

---

#### Q10: `GetCustomerOrders`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `GET /api/v1/account/orders` |
| **Method** | GET |
| **Auth** | Bearer token |
| **GraphQL** | `query GetCustomerOrders($options: OrderListOptions) { activeCustomer { id orders(options: $options) { totalItems items { id code state totalWithTax currencyCode createdAt updatedAt lines { id productVariant { id name product { id name featuredAsset { id preview } } } } } } } }` |
| **Variables** | `{ options: { take, skip, filter: { state: { notEq: "AddingItems" } } } }` |
| **Query Params** | `page`, `take` |
| **Response** | Wrapped in `activeCustomer` container |
| **Status** | 200 |

**Proxy response**:
```typescript
{
  data: {
    activeCustomer: {
      id: string;
      orders: {
        totalItems: number;
        items: Array<OrderSummary>;
      };
    };
  };
}
```

**Empty state**: When no customer is authenticated, the frontend checks `if (!data.activeCustomer) redirect('/sign-in')`. Proxy must return `{ data: { activeCustomer: null } }` for unauthenticated requests.

---

#### Q11: `GetOrderDetail`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `GET /api/v1/orders/:code` |
| **Method** | GET |
| **Auth** | Bearer token |
| **GraphQL** | `query GetOrderDetail($code: String!) { orderByCode(code: $code) { ... full order fields } }` |
| **Variables** | `{ code: string }` |
| **Status** | 200 |

Full response shape (the most complete order object):
```typescript
{
  data: {
    orderByCode: {
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
      billingAddress: { fullName: string; company: string; streetLine1: string; streetLine2: string; city: string; province: string; postalCode: string; country: string; phoneNumber: string };
      shippingLines: Array<{ shippingMethod: { id: string; name: string; description: string }; priceWithTax: number }>;
      payments: Array<{ id: string; method: string; amount: number; state: string; transactionId: string; createdAt: string }>;
      lines: Array<{
        id: string;
        productVariant: { id: string; name: string; sku: string; product: { id: string; name: string; slug: string; featuredAsset: { id: string; preview: string } | null } };
        unitPriceWithTax: number;
        quantity: number;
        linePriceWithTax: number;
      }>;
      discounts: Array<{ description: string; amountWithTax: number }>;
    };
  };
}
```

---

#### Q12: `GetOrderByCode` (inline in order-confirmation)

| Field | Value |
|-------|-------|
| **REST Endpoint** | `GET /api/v1/orders/:code` (same as Q11) |
| **Method** | GET |
| **Auth** | Bearer token |
| **GraphQL** | Defined inline in `order-confirmation.tsx` with fewer fields than Q11 |
| **Fields requested** | `id, code, state, totalWithTax, currencyCode, lines[].id, productVariant.id/name/product.{id,name,slug,featuredAsset}, quantity, linePriceWithTax, shippingAddress.{fullName,streetLine1,streetLine2,city,province,postalCode,country}` |
| **Status** | 200 |

**Compatibility**: Both Q11 and Q12 map to the same REST endpoint. The proxy returns all fields; GraphQL field selection is the client's responsibility. The frontend's `gql.tada` already handles field selection at the client level — the proxy just needs to return the full order object.

---

#### Q13: `GetActiveChannel`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `GET /api/v1/channel` |
| **Method** | GET |
| **Auth** | None |
| **Response** | `{ data: { activeChannel: { id, code, defaultLanguageCode, availableLanguageCodes, defaultCurrencyCode, availableCurrencyCodes } } }` |
| **Status** | 200 |

---

#### Q14: `GetCollectionProducts`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `GET /api/v1/collections/:slug` (collection meta) + `GET /api/v1/products?collectionSlug=` (products) |
| **Method** | GET |
| **Auth** | None |
| **GraphQL** | `query GetCollectionProducts($slug: String!, $input: SearchInput!) { collection(slug: $slug) { id name slug description featuredAsset { id preview } } search(input: $input) { totalItems items { ...ProductCard } } }` |
| **Variables** | `{ slug, input }` |
| **Query Params** | `languageCode`, `currencyCode` |
| **Status** | 200 |

**Response shape**:
```typescript
{
  data: {
    collection: {
      id: string;
      name: string;
      slug: string;
      description: string;
      featuredAsset: { id: string; preview: string } | null;
    };
    search: {
      totalItems: number;
      items: Array<ProductCard>;
    };
  };
}
```

**Note**: This is a composite query — the proxy calls two REST endpoints and merges the results.

---

#### Q15-Q17: Articles

##### `GetArticles`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `GET /api/v1/articles` |
| **Method** | GET |
| **Query Params** | `skip`, `take`, `search`, `category`, `tag` |
| **Response** | `{ data: { articles: { items: ArticleCard[], totalItems: number } } }` |
| **Status** | 200 |

**`ArticleCard` shape**:
```typescript
{
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
}
```

##### `GetArticleBySlug`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `GET /api/v1/articles/:slug` |
| **Response** | `{ data: { article: ArticleDetail | null } }` |
| **Status** | 200 |

**ArticleDetail** = ArticleCard + `content`, `createdAt`, `updatedAt`, `seoTitle`, `seoDescription`, `seoKeywords`, `assets[]`.

##### `GetArticleCategories`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `GET /api/v1/article-categories` |
| **Response** | `{ data: { articleCategories: { items: Array<{id, name, slug}> } } }` |
| **Status** | 200 |

##### `GetArticleTags`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `GET /api/v1/article-tags` |
| **Response** | `{ data: { articleTags: { items: Array<{id, name, slug}> } } }` |
| **Status** | 200 |

---

### 2.2 Mutations

---

#### M01: `Login`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `POST /api/v1/auth/login` |
| **Request** | `{ username: string; password: string }` |
| **Headers Sent** | None (no auth yet) |
| **Proxy Response (success)** | `{ data: { login: { __typename: 'CurrentUser', id: string, identifier: string } } }` |
| **Proxy Response (error)** | `{ data: { login: { __typename: 'NotVerifiedError' | 'InvalidCredentialsError', errorCode: string, message: string } } }` |
| **Header Set** | `vendure-auth-token: <jwt>` |
| **Status** | 200 (errors are returned in body, not HTTP status) |

**Critical**: The REST login endpoint must return the JWT token in a custom response header `vendure-auth-token`. The proxy reads this header and passes it through to the frontend response. The frontend's `extractAuthToken()` function reads this header.

**Error result types** the frontend checks:
- `NotVerifiedError` → shows "verify email first" message
- `InvalidCredentialsError` (or any other error) → shows "invalid credentials" message
- `CurrentUser` → success (stores token, redirects)

---

#### M02: `Logout`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `POST /api/v1/auth/logout` |
| **Auth** | Bearer token |
| **Proxy Response** | `{ data: { logout: { __typename: 'Success', success: true } } }` |
| **Status** | 200 |

---

#### M03: `RegisterCustomerAccount`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `POST /api/v1/auth/register` |
| **Request** | `{ input: { emailAddress: string; firstName?: string; lastName?: string; phoneNumber?: string; password: string } }` |
| **Proxy Response (success)** | `{ data: { registerCustomerAccount: { __typename: 'Success', success: true } } }` |
| **Proxy Response (error)** | `{ data: { registerCustomerAccount: { __typename: 'ErrorResult', errorCode: string, message: string } } }` |
| **Status** | 200 |

**Note**: The frontend passes `input` as a nested object `{ input: { ... } }`. Variables from frontend: `{ input: { emailAddress, firstName: firstName || undefined, lastName: lastName || undefined, phoneNumber: phoneNumber || undefined, password } }`.

---

#### M04: `VerifyCustomerAccount`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `POST /api/v1/auth/verify` |
| **Request** | `{ token: string; password?: string }` |
| **Proxy Response (success)** | `{ data: { verifyCustomerAccount: { __typename: 'CurrentUser', id: string, identifier: string } } }` |
| **Header Set** | `vendure-auth-token: <jwt>` |
| **Status** | 200 |

---

#### M05: `RequestPasswordReset`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `POST /api/v1/auth/forgot-password` |
| **Request** | `{ emailAddress: string }` |
| **Proxy Response (success)** | `{ data: { requestPasswordReset: { __typename: 'Success', success: true } } }` |
| **Status** | 200 |

---

#### M06: `ResetPassword`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `POST /api/v1/auth/reset-password` |
| **Request** | `{ token: string; password: string }` |
| **Proxy Response (success)** | `{ data: { resetPassword: { __typename: 'CurrentUser', id: string, identifier: string } } }` |
| **Header Set** | `vendure-auth-token: <jwt>` |
| **Status** | 200 |

---

#### M07: `UpdateCustomerPassword`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `POST /api/v1/auth/change-password` |
| **Request** | `{ currentPassword: string; newPassword: string }` |
| **Auth** | Bearer token |
| **Proxy Response (success)** | `{ data: { updateCustomerPassword: { __typename: 'Success', success: true } } }` |
| **Status** | 200 |

---

#### M08: `UpdateCustomer`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `PATCH /api/v1/account/profile` |
| **Request** | `{ input: { firstName: string; lastName: string } }` |
| **Auth** | Bearer token |
| **Proxy Response** | `{ data: { updateCustomer: { __typename: 'Customer', id: string, firstName: string, lastName: string, emailAddress: string } } }` |
| **Status** | 200 |

**Note**: Frontend checks `if (!updateResult || !updateResult.id)` for error detection. The proxy must always return an object with `id` on success.

---

#### M09: `RequestUpdateCustomerEmailAddress`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `POST /api/v1/auth/change-email` |
| **Request** | `{ password: string; newEmailAddress: string }` |
| **Auth** | Bearer token |
| **Proxy Response (success)** | `{ data: { requestUpdateCustomerEmailAddress: { __typename: 'Success', success: true } } }` |
| **Status** | 200 |

---

#### M10: `UpdateCustomerEmailAddress`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `POST /api/v1/auth/verify-email` |
| **Request** | `{ token: string }` |
| **Proxy Response (success)** | `{ data: { updateCustomerEmailAddress: { __typename: 'Success', success: true } } }` |
| **Status** | 200 |

---

#### M11: `AddToCart`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `POST /api/v1/cart/items` |
| **Request** | `{ variantId: string; quantity: number }` |
| **Auth** | Bearer token (or session_id cookie for guest) |
| **Query Params** | `currencyCode` |
| **Header Set** | `vendure-auth-token: <jwt>` (for guest→auth token creation) |
| **Proxy Response (success)** | `{ data: { addItemToOrder: { __typename: 'Order', id: string, code: string, totalQuantity: number, lines: Array<{ id: string, productVariant: { id, name }, quantity }> } } }` |
| **Proxy Response (error)** | `{ data: { addItemToOrder: { __typename: 'InsufficientStockError' | 'ErrorResult', errorCode: string, message: string } } }` |
| **Status** | 200 |

**Compatibility note — auth token on addToCart**: The frontend's `addToCart` server action extracts token from response headers on every call: `if (result.token) { await setAuthToken(result.token); }`. For guest carts, this creates/updates the auth token. The backend must ensure that every `POST /api/v1/cart/items` response sets the `vendure-auth-token` header, even if the token hasn't changed (the frontend's `setAuthToken` is idempotent).

---

#### M12: `RemoveFromCart`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `DELETE /api/v1/cart/items/:lineId` |
| **Auth** | Bearer token (or session_id cookie) |
| **Proxy Response** | `{ data: { removeOrderLine: { __typename: 'Order', id: string, code: string, totalQuantity: number } } }` |
| **Status** | 200 |

---

#### M13: `AdjustCartItem`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `PATCH /api/v1/cart/items/:lineId` |
| **Request** | `{ quantity: number }` |
| **Auth** | Bearer token (or session_id cookie) |
| **Query Params** | `currencyCode` |
| **Proxy Response** | `{ data: { adjustOrderLine: { __typename: 'Order', id: string, code: string, totalQuantity: number } } }` |
| **Status** | 200 |

---

#### M14: `ApplyPromotionCode`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `POST /api/v1/cart/coupons` |
| **Request** | `{ couponCode: string }` |
| **Auth** | Bearer token (or session_id cookie) |
| **Query Params** | `currencyCode` |
| **Proxy Response** | `{ data: { applyCouponCode: { __typename: 'Order', id: string, code: string, totalWithTax: number, couponCodes: string[], discounts: Array<{ description: string, amountWithTax: number }> } } }` |
| **Proxy Response (error)** | `{ data: { applyCouponCode: { __typename: 'CouponCodeInvalidError' | 'CouponCodeLimitError', errorCode: string, message: string } } }` |
| **Status** | 200 |

---

#### M15: `RemovePromotionCode`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `DELETE /api/v1/cart/coupons/:code` |
| **Auth** | Bearer token (or session_id cookie) |
| **Proxy Response** | `{ data: { removeCouponCode: { id: string, code: string, totalWithTax: number, couponCodes: string[], discounts: Array<{ description, amountWithTax }> } } }` |
| **Status** | 200 |

---

#### M16-M19: Address Mutations

##### `CreateCustomerAddress`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `POST /api/v1/account/addresses` |
| **Request** | `{ input: CreateAddressInput }` where CreateAddressInput = `{ fullName, streetLine1, streetLine2?, city, province, postalCode, countryCode, phoneNumber, company? }` |
| **Auth** | Bearer token |
| **Proxy Response** | `{ data: { createCustomerAddress: { id, fullName, company, streetLine1, streetLine2, city, province, postalCode, country: { id, code, name }, phoneNumber, defaultShippingAddress, defaultBillingAddress } } }` |
| **Status** | 200 |

##### `UpdateCustomerAddress`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `PATCH /api/v1/account/addresses/:id` |
| **Request** | `{ input: UpdateAddressInput }` where UpdateAddressInput = CreateAddressInput + `id` + `defaultShippingAddress?`, `defaultBillingAddress?` |
| **Auth** | Bearer token |
| **Proxy Response** | Same as Create |
| **Status** | 200 |

##### `DeleteCustomerAddress`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `DELETE /api/v1/account/addresses/:id` |
| **Auth** | Bearer token |
| **Proxy Response** | `{ data: { deleteCustomerAddress: { success: true } } }` |
| **Status** | 200 |

---

#### M20-M26: Checkout Mutations

##### `SetOrderShippingAddress`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `POST /api/v1/checkout/shipping-address` |
| **Request** | `{ input: CreateAddressInput }` |
| **Auth** | Bearer token (or session_id for guest) |
| **Proxy Response (success)** | `{ data: { setOrderShippingAddress: { __typename: 'Order', id: string, code: string, shippingAddress: { fullName, company, streetLine1, streetLine2, city, province, postalCode, country, phoneNumber } } } }` |
| **Proxy Response (error)** | `{ data: { setOrderShippingAddress: { __typename: 'ErrorResult', errorCode: string, message: string } } }` |
| **Status** | 200 |

##### `SetOrderBillingAddress`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `POST /api/v1/checkout/billing-address` |
| **Request** | `{ input: CreateAddressInput }` |
| **Auth** | Bearer token (or session_id for guest) |
| **Proxy Response (success)** | `{ data: { setOrderBillingAddress: { __typename: 'Order', id: string, code: string, billingAddress: { ... } } } }` |
| **Status** | 200 |

##### `SetOrderShippingMethod`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `POST /api/v1/checkout/shipping-method` |
| **Request** | `{ shippingMethodId: string }` |
| **Auth** | Bearer token |
| **Proxy Response (success)** | `{ data: { setOrderShippingMethod: { __typename: 'Order', id: string, code: string, shippingWithTax: number, totalWithTax: number, shippingLines: Array<{ shippingMethod: { id, name, description }, priceWithTax }> } } }` |
| **Status** | 200 |

##### `SetCustomerForOrder` (guest checkout)

| Field | Value |
|-------|-------|
| **REST Endpoint** | `POST /api/v1/checkout/customer` |
| **Request** | `{ input: { emailAddress: string; firstName: string; lastName: string; phoneNumber?: string } }` |
| **Auth** | None (guest endpoint) |
| **Proxy Response (success)** | `{ data: { setCustomerForOrder: { __typename: 'Order', id: string, code: string, customer: { id, firstName, lastName, emailAddress, phoneNumber } } } }` |
| **Proxy Response (errors)** | `{ data: { setCustomerForOrder: { __typename: 'AlreadyLoggedInError' | 'EmailAddressConflictError' | 'GuestCheckoutError' | 'NoActiveOrderError', errorCode: string, message: string } } }` |
| **Status** | 200 |

##### `TransitionOrderToState`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `POST /api/v1/checkout/transition` |
| **Request** | `{ state: string }` |
| **Auth** | Bearer token |
| **Proxy Response (success)** | `{ data: { transitionOrderToState: { __typename: 'Order', id: string, code: string, state: string } } }` |
| **Proxy Response (error)** | `{ data: { transitionOrderToState: { __typename: 'OrderStateTransitionError', errorCode: string, message: string, transitionError: string, fromState: string, toState: string } } }` |
| **Status** | 200 |

##### `AddPaymentToOrder`

| Field | Value |
|-------|-------|
| **REST Endpoint** | `POST /api/v1/checkout/payment` |
| **Request** | `{ input: { method: string; metadata: Record<string, unknown> } }` |
| **Auth** | Bearer token |
| **Proxy Response (success)** | `{ data: { addPaymentToOrder: { __typename: 'Order', id: string, code: string, state: string, payments: Array<{ id, method, amount, state }> } } }` |
| **Proxy Response (error)** | `{ data: { addPaymentToOrder: { __typename: 'ErrorResult', errorCode: string, message: string } } }` |
| **Status** | 200 |

---

## 3. REST API Endpoints (Native)

Below is the definitive list of REST endpoints the backend must implement. Each endpoint corresponds to one or more frontend operations.

### 3.1 Auth

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/v1/auth/login` | No | Login. Returns JWT in `vendure-auth-token` header. |
| POST | `/api/v1/auth/logout` | Bearer | Logout. |
| POST | `/api/v1/auth/register` | No | Register customer account. |
| POST | `/api/v1/auth/verify` | No | Verify email with token. Returns JWT in header. |
| POST | `/api/v1/auth/forgot-password` | No | Request password reset email. |
| POST | `/api/v1/auth/reset-password` | No | Reset password with token. Returns JWT in header. |
| POST | `/api/v1/auth/change-password` | Bearer | Update password (needs current password). |
| POST | `/api/v1/auth/change-email` | Bearer | Request email change (needs password). |
| POST | `/api/v1/auth/verify-email` | No | Confirm email change with token. |
| GET | `/api/v1/auth/me` | Bearer/Opt | Get current user profile. Returns null if not authenticated. |

### 3.2 Products & Catalog

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/products` | No | Search with filters, facet aggregations. |
| GET | `/api/v1/products/featured` | No | Featured products by collection. |
| GET | `/api/v1/products/:slug` | No | Product detail with all relations. |
| GET | `/api/v1/products/:slug/related` | No | Related products (same collection, exclude current). |
| GET | `/api/v1/collections` | No | Top-level collections. |
| GET | `/api/v1/collections/:slug` | No | Single collection with meta. |
| GET | `/api/v1/brands` | No | Brand list. |
| GET | `/api/v1/brands/:slug` | No | Brand detail. |
| GET | `/api/v1/brands/:slug/products` | No | Products by brand. |

### 3.3 Cart

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/cart` | Bearer/Session | Get active cart/order. |
| POST | `/api/v1/cart/items` | Bearer/Session | Add item. Sets `vendure-auth-token` header. |
| PATCH | `/api/v1/cart/items/:lineId` | Bearer/Session | Update item quantity. |
| DELETE | `/api/v1/cart/items/:lineId` | Bearer/Session | Remove item. |
| POST | `/api/v1/cart/coupons` | Bearer/Session | Apply coupon code. |
| DELETE | `/api/v1/cart/coupons/:code` | Bearer/Session | Remove coupon code. |
| POST | `/api/v1/cart/merge` | Bearer | Merge guest cart into user cart after login. |

### 3.4 Checkout

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/checkout/shipping-methods` | Bearer | Eligible shipping methods for current order. |
| GET | `/api/v1/checkout/payment-methods` | Bearer | Eligible payment methods for current order. |
| POST | `/api/v1/checkout/shipping-address` | Bearer/Session | Set shipping address on active order. |
| POST | `/api/v1/checkout/billing-address` | Bearer/Session | Set billing address on active order. |
| POST | `/api/v1/checkout/shipping-method` | Bearer | Set shipping method on active order. |
| POST | `/api/v1/checkout/customer` | Session | Set customer info for guest checkout. |
| POST | `/api/v1/checkout/transition` | Bearer | Transition order state. |
| POST | `/api/v1/checkout/payment` | Bearer | Add payment to order. |

### 3.5 Orders

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/account/orders` | Bearer | Get authenticated user's orders (paginated). |
| GET | `/api/v1/orders/:code` | Bearer | Get any order by code. |

### 3.6 Account

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/account/addresses` | Bearer | Get customer addresses. |
| POST | `/api/v1/account/addresses` | Bearer | Create address. |
| PATCH | `/api/v1/account/addresses/:id` | Bearer | Update address. |
| DELETE | `/api/v1/account/addresses/:id` | Bearer | Delete address. |
| PATCH | `/api/v1/account/profile` | Bearer | Update customer name. |

### 3.7 Content

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/articles` | No | Article list (skip, take, search, category, tag). |
| GET | `/api/v1/articles/:slug` | No | Article detail. |
| GET | `/api/v1/article-categories` | No | Article categories. |
| GET | `/api/v1/article-tags` | No | Article tags (reserved, not used in frontend yet). |

### 3.8 Reference Data

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/countries` | No | Available countries. |
| GET | `/api/v1/channel` | No | Channel config (currencies, languages). |

---

## 4. Common Response Patterns

### 4.1 Error Response Shape (REST)

All REST errors follow the existing `TransformInterceptor` / `HttpExceptionFilter` pattern:
```typescript
// Success
{ success: true, data: T }

// Error (HTTP 4xx/5xx)
{ success: false, error: { code: string, message: string, details?: any } }
```

### 4.2 GraphQL Proxy Error Wrapping

The proxy converts REST errors back to GraphQL `__typename`-based error results:
- REST `{ success: false, error: { code: 'INSUFFICIENT_STOCK', message: '...' } }` → `{ data: { addItemToOrder: { __typename: 'InsufficientStockError', errorCode: 'INSUFFICIENT_STOCK', message: '...' } } }`
- REST `{ success: false, error: { code: 'UNAUTHORIZED', message: '...' } }` → `{ errors: [{ message: '...' }] }` (HTTP 401)

### 4.3 Auth Token Header

The REST endpoints for `login`, `resetPassword`, `verifyAccount`, and `addToCart` must set:
```
vendure-auth-token: <JWT string>
```

The proxy reads this header from the REST response and sets it on the GraphQL response.

---

## 5. Implementation Order

The priority for implementation should follow the frontend's user journey:

| Priority | Domain | Reason |
|----------|--------|--------|
| P0 | Auth endpoints | Required for all authenticated flows |
| P0 | Product search/catalog | Homepage, search, collection, product detail |
| P0 | Cart CRUD | Cart page, add-to-cart |
| P0 | Channel + Countries | Checkout dependencies, navbar |
| P1 | Checkout | Order placement flow |
| P1 | Orders | Order history, order confirmation |
| P1 | Addresses | Account management, checkout |
| P2 | Articles | News section |
| P2 | Brands | (low usage in current frontend) |

---

## 6. Key Design Decisions

### 6.1 Price Field Name

The frontend consistently uses `*WithTax` field names: `priceWithTax`, `subTotalWithTax`, `totalWithTax`, `shippingWithTax`, `linePriceWithTax`, `amountWithTax`. The REST API must use these exact names.

### 6.2 Stock Level as String

The frontend expects `stockLevel: 'IN_STOCK' | 'OUT_OF_STOCK'` on each variant. Computed from `inventory.quantity - inventory.reserved > 0`.

### 6.3 Null vs 404

Many frontend queries expect `null` in response data for not-found entities (product, activeCustomer, orderByCode), not HTTP 404. The proxy must handle this. The REST API can return HTTP 404, but the proxy converts it to null-in-data.

### 6.4 Address Country

The frontend expects `country` as an object `{ id, code, name }` in addresses, but as a plain `string` in order shipping/billing addresses. The proxy must handle both formats.

### 6.5 Currency Pass-Through

All price-bearing endpoints accept `currencyCode` as a query parameter. The backend must convert prices if multi-currency is supported, or return all prices in the default currency.

### 6.6 Channel Token

The frontend sends a `vendure-token` header. For now, the backend can ignore it (single channel). For future multi-tenancy, it could select the active channel configuration.

### 6.7 Language Pass-Through

The `languageCode` query param is used for multi-locale JSONB fields (name, description). The proxy extracts the correct locale from the JSONB object based on `languageCode`.

---

## 7. Size & Complexity Estimate

| Domain | Endpoints | Frontend Operations | Tests Needed |
|--------|-----------|---------------------|-------------|
| Auth | 9 | 9 mutations + 1 query | ~24 |
| Products/Catalog | 7 | 5 queries | ~20 |
| Cart | 7 | 6 mutations + 1 query | ~14 |
| Checkout | 8 | 6 mutations + 2 queries | ~16 |
| Orders | 2 | 2 queries | ~6 |
| Account | 6 | 1 query + 5 mutations | ~12 |
| Content | 4 | 4 queries | ~10 |
| Reference Data | 2 | 2 queries | ~4 |
| **GraphQL Proxy** | 1 | 44 total operations | ~44 integration |
| **Total** | **46** | **44** | **~150** |
