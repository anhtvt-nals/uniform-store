# Frontend API Inventory

> **Generated**: 2026-07-14
> **Source**: `storefront/src/`
> **Architecture**: Single GraphQL endpoint → `query()`/`mutate()` in `src/lib/vendure/api.ts`

---

## Architecture Overview

```
Server Action / Component / Route Handler
  └── calls query() or mutate()  ←  src/lib/vendure/api.ts
        └── single fetch() POST  →  VENDURE_SHOP_API_URL
              ├── headers: Authorization (auth token), vendure-token (channel)
              ├── body: { query: <printed GraphQL>, variables }
              ├── response: auth token extracted from vendure-auth-token header
              └── next: { tags: [...] }  ← cache tags for revalidation
```

**Key characteristics:**
- No REST calls from the frontend
- No axios, React Query, SWR, or other HTTP libraries
- Auth token flows through response header `vendure-auth-token` (not response body)
- Channel token in request header `vendure-token`
- Locale/currency as query params on the URL
- Server actions (`'use server'`) use `useAuthToken: true` for auth
- Pages use `useAuthToken: true` or explicit token from `getAuthToken()`

---

## 1. GraphQL Fragments

### `src/lib/vendure/fragments.ts`

| Export | Type | Fields | Used By |
|--------|------|--------|---------|
| `ProductCardFragment` | Fragment on `SearchResult` | productId, productName, slug, productAsset {id, preview}, priceWithTax {__typename ...on PriceRange {min, max} ...on SinglePrice {value}}, currencyCode | `SearchProductsQuery`, `GetCollectionProductsQuery` |
| `ActiveCustomerFragment` | Fragment on `Customer` | id, firstName, lastName, emailAddress | `GetActiveCustomerQuery` |

### `src/lib/graphql/articles.ts`

| Export | Type | Fields | Used By |
|--------|------|--------|---------|
| `ArticleCardFragment` | Fragment on `Article` | id, title, slug, excerpt, author, publishedAt, viewCount, featuredAsset {id,preview,source,width,height,name}, category {id,name,slug}, tags {id,name,slug} | `GetArticlesDocument` |
| `ArticleDetailFragment` | Fragment on `Article` | id, title, slug, excerpt, content, author, publishedAt, viewCount, createdAt, updatedAt, seoTitle, seoDescription, seoKeywords, featuredAsset {...}, assets[...], category {...}, tags[...] | `GetArticleBySlugDocument` |

---

## 2. GraphQL Queries

### 2a. Product Catalog — `src/lib/vendure/queries.ts`

| Query | Variables | Response | Call Sites |
|-------|-----------|----------|------------|
| `GetTopCollectionsQuery` | none | `collections {items {id, name, slug}}` | `cached.ts` → navbar, mobile-nav |
| `SearchProductsQuery` | `$input: SearchInput!` | `search {totalItems, items {...ProductCard}, facetValues[{count, facetValue{id, name, facet{id, name}}}]}` | homepage products section, search results, collection products |
| `GetProductDetailQuery` | `$slug: String!` | `product {id, name, description, slug, assets[...], variants[{id, name, sku, priceWithTax, stockLevel, options[{id, code, name, groupId, group{id, code, name}}]}], optionGroups[{id, code, name, options[{id, code, name}]}], collections[{id, name, slug, parent{id}}]}` | product detail page, quick-view |
| `GetCollectionProductsQuery` | `$slug: String!, $input: SearchInput!` | `collection {id, name, slug, description, featuredAsset{id, preview}}` + `search {totalItems, items {...ProductCard}}` | collection page, featured products, related products |
| `GetActiveChannelQuery` | none | `activeChannel {id, code, defaultLanguageCode, availableLanguageCodes, defaultCurrencyCode, availableCurrencyCodes}` | `cached.ts` → currency/locale config |

### 2b. Cart & Order — `src/lib/vendure/queries.ts`

| Query | Variables | Response | Call Sites |
|-------|-----------|----------|------------|
| `GetActiveOrderQuery` | none | `activeOrder {id, code, state, totalQuantity, subTotal, subTotalWithTax, shipping, shippingWithTax, total, totalWithTax, currencyCode, couponCodes, discounts[{description, amountWithTax}], lines[{id, productVariant{id, name, sku, product{id, name, slug, featuredAsset{id, preview}}}, unitPriceWithTax, quantity, linePriceWithTax}]}` | cart page, navbar cart badge |
| `GetActiveOrderForCheckoutQuery` | none | Same as above + `customer{id,firstName,lastName,emailAddress,phoneNumber}`, `shippingAddress{...}`, `billingAddress{...}`, `shippingLines[{shippingMethod{id,name,description}, priceWithTax}]` | checkout page |
| `GetOrderDetailQuery` | `$code: String!` | `orderByCode {id, code, state, active, createdAt, updatedAt, totalQuantity, subTotal, subTotalWithTax, shipping, shippingWithTax, total, totalWithTax, currencyCode, customer{...}, shippingAddress{...}, billingAddress{...}, shippingLines[...], payments[{id, method, amount, state, transactionId, createdAt}], lines[...], discounts[...]}` | order detail page |
| `GetCustomerOrdersQuery` | `$options: OrderListOptions` | `activeCustomer {orders {totalItems, items[{id, code, state, totalWithTax, currencyCode, createdAt, updatedAt, lines[{id, productVariant{id, name, product{id, name, featuredAsset{id, preview}}}}]}]}}` | orders list page |

### 2c. Customer & Addresses — `src/lib/vendure/queries.ts`

| Query | Variables | Response | Call Sites |
|-------|-----------|----------|------------|
| `GetActiveCustomerQuery` | none | `activeCustomer {...ActiveCustomer}` | `actions.ts` → profile, header |
| `GetCustomerAddressesQuery` | none | `activeCustomer {addresses[{id, fullName, company, streetLine1, streetLine2, city, province, postalCode, country{id, code, name}, phoneNumber, defaultShippingAddress, defaultBillingAddress}]}` | checkout page, addresses page |

### 2d. Checkout Eligibility — `src/lib/vendure/queries.ts`

| Query | Variables | Response | Call Sites |
|-------|-----------|----------|------------|
| `GetEligibleShippingMethodsQuery` | none | `eligibleShippingMethods[{id, name, code, description, priceWithTax}]` | checkout page |
| `GetEligiblePaymentMethodsQuery` | none | `eligiblePaymentMethods[{id, name, code, description, isEligible, eligibilityMessage}]` | checkout page |
| `GetAvailableCountriesQuery` | none | `availableCountries[{id, code, name}]` | checkout page, addresses page |

### 2e. Order Confirmation (inline) — `src/app/[locale]/order-confirmation/[code]/order-confirmation.tsx`

| Query | Variables | Response | Call Site |
|-------|-----------|----------|-----------|
| `GetOrderByCodeQuery` | `$code: String!` | `orderByCode {id, code, state, totalWithTax, currencyCode, lines[{id, productVariant{id, name, product{id, name, slug, featuredAsset{id, preview}}}, quantity, linePriceWithTax}], shippingAddress{fullName, streetLine1, streetLine2, city, province, postalCode, country}}` | order confirmation page |

### 2f. Articles — `src/lib/graphql/articles.ts`

| Query | Variables | Response | Call Site |
|-------|-----------|----------|-----------|
| `GetArticlesDocument` | `$skip: Int, $take: Int, $search: String, $category: String, $tag: String` | `articles {items[...ArticleCard], totalItems}` | blog/news listing |
| `GetArticleBySlugDocument` | `$slug: String!` | `article {...ArticleDetail}` | article detail page |
| `GetArticleCategoriesDocument` | none | `articleCategories {items[{id, name, slug}], totalItems}` | article sidebar/nav |
| `GetArticleTagsDocument` | none | `articleTags {items[{id, name, slug}], totalItems}` | article tag filter |

---

## 3. GraphQL Mutations

### 3a. Auth — `src/lib/vendure/mutations.ts`

| Mutation | Variables | Response | Call Site |
|----------|-----------|----------|-----------|
| `LoginMutation` | `$username: String!, $password: String!` | `login {__typename ...on CurrentUser{id, identifier} ...on ErrorResult{errorCode, message}}` | `sign-in/actions.ts` |
| `LogoutMutation` | none | `logout {__typename ...on Success{success}}` | `sign-in/actions.ts` |
| `RegisterCustomerAccountMutation` | `$input: RegisterCustomerInput!` | `registerCustomerAccount {__typename ...on Success{success} ...on ErrorResult{errorCode, message}}` | `register/actions.ts` |
| `VerifyCustomerAccountMutation` | `$token: String!, $password: String` | `verifyCustomerAccount {__typename ...on CurrentUser{id, identifier} ...on ErrorResult{errorCode, message}}` | `verify/actions.ts` |
| `RequestPasswordResetMutation` | `$emailAddress: String!` | `requestPasswordReset {__typename ...on Success{success} ...on ErrorResult{errorCode, message}}` | `forgot-password/actions.ts` |
| `ResetPasswordMutation` | `$token: String!, $password: String!` | `resetPassword {__typename ...on CurrentUser{id, identifier} ...on ErrorResult{errorCode, message}}` | `reset-password/actions.ts` |
| `UpdateCustomerMutation` | `$input: UpdateCustomerInput!` | `updateCustomer {__typename, id, firstName, lastName, emailAddress}` | `account/profile/actions.ts` |
| `UpdateCustomerPasswordMutation` | `$currentPassword: String!, $newPassword: String!` | `updateCustomerPassword {__typename ...on Success{success} ...on ErrorResult{errorCode, message}}` | `account/profile/actions.ts` |
| `RequestUpdateCustomerEmailAddressMutation` | `$password: String!, $newEmailAddress: String!` | `requestUpdateCustomerEmailAddress {__typename ...on Success{success} ...on ErrorResult{errorCode, message}}` | `account/profile/actions.ts` |

### 3b. Cart — `src/lib/vendure/mutations.ts`

| Mutation | Variables | Response | Call Site |
|----------|-----------|----------|-----------|
| `AddToCartMutation` | `$variantId: ID!, $quantity: Int!` | `addItemToOrder {__typename ...on Order{id, code, totalQuantity, lines[{id, productVariant{id, name}, quantity}]} ...on ErrorResult{errorCode, message}}` | `product/[slug]/actions.ts` |
| `RemoveFromCartMutation` | `$lineId: ID!` | `removeOrderLine {__typename ...on Order{id, code, totalQuantity} ...on ErrorResult{errorCode, message}}` | `cart/actions.ts`, `cart/cart-items.tsx` |
| `AdjustCartItemMutation` | `$lineId: ID!, $quantity: Int!` | `adjustOrderLine {__typename ...on Order{id, code, totalQuantity} ...on ErrorResult{errorCode, message}}` | `cart/actions.ts`, `cart/cart-items.tsx` |
| `ApplyPromotionCodeMutation` | `$couponCode: String!` | `applyCouponCode {__typename ...on Order{id, code, totalWithTax, couponCodes, discounts[{description, amountWithTax}]} ...on ErrorResult{errorCode, message}}` | `cart/actions.ts` |
| `RemovePromotionCodeMutation` | `$couponCode: String!` | `removeCouponCode {id, code, totalWithTax, couponCodes, discounts[{description, amountWithTax}]}` | `cart/actions.ts` |

### 3c. Checkout — `src/lib/vendure/mutations.ts`

| Mutation | Variables | Response | Call Site |
|----------|-----------|----------|-----------|
| `SetOrderShippingAddressMutation` | `$input: CreateAddressInput!` | `setOrderShippingAddress {__typename ...on Order{id, code, shippingAddress{...}} ...on ErrorResult{errorCode, message}}` | `checkout/actions.ts` |
| `SetOrderBillingAddressMutation` | `$input: CreateAddressInput!` | `setOrderBillingAddress {__typename ...on Order{id, code, billingAddress{...}} ...on ErrorResult{errorCode, message}}` | `checkout/actions.ts` |
| `SetOrderShippingMethodMutation` | `$shippingMethodId: [ID!]!` | `setOrderShippingMethod {__typename ...on Order{id, code, shippingWithTax, totalWithTax, shippingLines[{shippingMethod{id,name,description}, priceWithTax}]} ...on ErrorResult{errorCode, message}}` | `checkout/actions.ts` |
| `TransitionOrderToStateMutation` | `$state: String!` | `transitionOrderToState {__typename ...on Order{id, code, state} ...on OrderStateTransitionError{errorCode, message, transitionError, fromState, toState}}` | `checkout/actions.ts` |
| `AddPaymentToOrderMutation` | `$input: PaymentInput!` | `addPaymentToOrder {__typename ...on Order{id, code, state, payments[{id, method, amount, state}]} ...on ErrorResult{errorCode, message}}` | `checkout/actions.ts` |
| `SetCustomerForOrderMutation` | `$input: CreateCustomerInput!` | `setCustomerForOrder {__typename ...on Order{id, code, customer{id,firstName,lastName,emailAddress,phoneNumber}} ...on AlreadyLoggedInError{...} ...on EmailAddressConflictError{...} ...on GuestCheckoutError{...} ...on NoActiveOrderError{...}}` | `checkout/actions.ts` |

### 3d. Addresses — `src/lib/vendure/mutations.ts`

| Mutation | Variables | Response | Call Site |
|----------|-----------|----------|-----------|
| `CreateCustomerAddressMutation` | `$input: CreateAddressInput!` | `createCustomerAddress {id, fullName, company, streetLine1, streetLine2, city, province, postalCode, country{id, code, name}, phoneNumber, defaultShippingAddress, defaultBillingAddress}` | `checkout/actions.ts`, `account/addresses/actions.ts` |
| `UpdateCustomerAddressMutation` | `$input: UpdateAddressInput!` | `updateCustomerAddress {id, fullName, company, streetLine1, streetLine2, city, province, postalCode, country{id, code, name}, phoneNumber, defaultShippingAddress, defaultBillingAddress}` | `account/addresses/actions.ts` |
| `DeleteCustomerAddressMutation` | `$id: ID!` | `deleteCustomerAddress {success}` | `account/addresses/actions.ts` |

### 3e. Email Update — `src/lib/vendure/mutations.ts`

| Mutation | Variables | Response | Call Site |
|----------|-----------|----------|-----------|
| `UpdateCustomerEmailAddressMutation` | `$token: String!` | `updateCustomerEmailAddress {__typename ...on Success{success} ...on ErrorResult{errorCode, message}}` | `account/verify-email/page.tsx` |

---

## 4. Core API Abstraction

### `src/lib/vendure/api.ts`

| Function | Signature | HTTP | Description |
|----------|-----------|------|-------------|
| `query()` | `<TResult, TVariables>(document, variables?, options?) => Promise<{data, token?}>` | POST | Executes any GraphQL query. Reads auth token from `useAuthToken` config or explicit `token` param. Extracts new token from response header `vendure-auth-token`. |
| `mutate()` | Same as `query()` | POST | Delegates to `query()`. Same implementation since GraphQL uses POST for both. |

**Options** (`VendureRequestOptions`): `token?`, `useAuthToken?`, `channelToken?`, `languageCode?`, `currencyCode?`, `fetch?: RequestInit`, `tags?: string[]`

### `src/lib/vendure/cached.ts` — Cached convenience wrappers

| Function | Calls | Cache Strategy | Tags |
|----------|-------|----------------|------|
| `getActiveChannelCached()` | `query(GetActiveChannelQuery)` | `next: {tags: ['channel']}` | `channel` |
| `getAvailableCountriesCached(locale)` | `query(GetAvailableCountriesQuery, undefined, {languageCode: locale})` | `next: {tags: ['countries-' + locale]}` | `countries-${locale}` |
| `getTopCollections(locale)` | `query(GetTopCollectionsQuery, undefined, {languageCode: locale})` | `next: {tags: ['collections-' + locale]}` | `collections-${locale}` |

### `src/lib/vendure/actions.ts` — Server-side wrappers

| Function | Calls | Caching | Description |
|----------|-------|---------|-------------|
| `getActiveCustomer()` | `query(GetActiveCustomerQuery, undefined, {token})` | `React.cache()` | Fetches logged-in customer, reads `ActiveCustomerFragment` |

### `src/lib/actions/articles.ts` — Article data access

| Function | Calls | Tags |
|----------|-------|------|
| `getArticles(params, languageCode?)` | `query(GetArticlesDocument, {skip, take, search, category, tag}, {languageCode})` | gated by caller |
| `getArticleBySlug(slug, languageCode?)` | `query(GetArticleBySlugDocument, {slug}, {languageCode})` | gated by caller |
| `getArticleCategories(languageCode?)` | `query(GetArticleCategoriesDocument, {}, {languageCode})` | gated by caller |

### `src/components/aura/quick-view-actions.ts` — Quick view

| Function | Calls | Description |
|----------|-------|-------------|
| `getProductForQuickView(slug)` | `query(GetProductDetailQuery, {slug})` | Server action for quick-view modal |

### `src/lib/actions/switch-currency.ts` — Currency switch

| Function | Calls | Description |
|----------|-------|-------------|
| `switchCurrency(currencyCode)` | calls `getActiveChannelCached()`, sets cookie | Server action for currency toggle |

---

## 5. Server Actions by Page

### Cart — `src/app/[locale]/cart/actions.ts`
| Action | Mutation | Notes |
|--------|----------|-------|
| `removeFromCart(lineId)` | `RemoveFromCartMutation` | `useAuthToken: true`, revalidates tags |
| `adjustQuantity(lineId, qty)` | `AdjustCartItemMutation` | see above |
| `applyPromotionCode(formData)` | `ApplyPromotionCodeMutation` | see above |
| `removePromotionCode(formData)` | `RemovePromotionCodeMutation` | see above |

### Checkout — `src/app/[locale]/checkout/actions.ts`
| Action | Mutation(s) | Notes |
|--------|-------------|-------|
| `setShippingAddress(addr, useSameForBilling)` | `SetOrderShippingAddressMutation` + optionally `SetOrderBillingAddressMutation` | |
| `setShippingMethod(id)` | `SetOrderShippingMethodMutation` | |
| `createCustomerAddress(addr)` | `CreateCustomerAddressMutation` | |
| `transitionToArrangingPayment()` | `TransitionOrderToStateMutation` | state = `'ArrangingPayment'` |
| `placeOrder(methodCode)` | `AddPaymentToOrderMutation` | methodCode = 'momo', 'cod', etc. |
| `setCustomerForOrder(input)` | `SetCustomerForOrderMutation` | guest checkout |

### Product Detail — `src/app/[locale]/product/[slug]/actions.ts`
| Action | Mutation | Notes |
|--------|----------|-------|
| `addToCart(variantId, quantity)` | `AddToCartMutation` | `useAuthToken: true` |

### Sign In — `src/app/[locale]/sign-in/actions.ts`
| Action | Mutation | Notes |
|--------|----------|-------|
| `loginAction(prevState, formData)` | `LoginMutation` | saves token to cookie |
| `logoutAction()` | `LogoutMutation` | clears token cookie |

### Register — `src/app/[locale]/register/actions.ts`
| Action | Mutation | Notes |
|--------|----------|-------|
| `registerAction(prevState, formData)` | `RegisterCustomerAccountMutation` | |

### Forgot Password — `src/app/[locale]/forgot-password/actions.ts`
| Action | Mutation | Notes |
|--------|----------|-------|
| `requestPasswordResetAction(prevState, formData)` | `RequestPasswordResetMutation` | |

### Reset Password — `src/app/[locale]/reset-password/actions.ts`
| Action | Mutation | Notes |
|--------|----------|-------|
| `resetPasswordAction(prevState, formData)` | `ResetPasswordMutation` | |

### Verify — `src/app/[locale]/verify/actions.ts`
| Action | Mutation | Notes |
|--------|----------|-------|
| `verifyAccountAction(token, password?)` | `VerifyCustomerAccountMutation` | |

### Account Profile — `src/app/[locale]/account/profile/actions.ts`
| Action | Mutation | Notes |
|--------|----------|-------|
| `updatePasswordAction(prevState, formData)` | `UpdateCustomerPasswordMutation` | |
| `updateCustomerAction(prevState, formData)` | `UpdateCustomerMutation` | |
| `requestEmailUpdateAction(prevState, formData)` | `RequestUpdateCustomerEmailAddressMutation` | |

### Account Addresses — `src/app/[locale]/account/addresses/actions.ts`
| Action | Mutation | Notes |
|--------|----------|-------|
| `createAddress(addr)` | `CreateCustomerAddressMutation` | |
| `updateAddress(addr)` | `UpdateCustomerAddressMutation` | |
| `deleteAddress(id)` | `DeleteCustomerAddressMutation` | |
| `setDefaultShippingAddress(id)` | `UpdateCustomerAddressMutation` | sets isDefaultShippingAddress |
| `setDefaultBillingAddress(id)` | `UpdateCustomerAddressMutation` | sets isDefaultBillingAddress |

### Cart Inline — `src/app/[locale]/cart/cart-items.tsx`
| Action | Mutation | Notes |
|--------|----------|-------|
| Inline decrement qty | calls `adjustQuantity(lineId, qty - 1)` | form action |
| Inline increment qty | calls `adjustQuantity(lineId, qty + 1)` | form action |
| Inline remove | calls `removeFromCart(lineId)` | form action |

### Verify Email Page — `src/app/[locale]/account/verify-email/page.tsx`
| Call | Mutation | Notes |
|------|----------|-------|
| Inline | `UpdateCustomerEmailAddressMutation` | called from component with token from searchParams |

---

## 6. Non-GraphQL Endpoint

### `POST /api/revalidate` — Cache Revalidation Webhook

| Property | Value |
|----------|-------|
| **File** | `src/app/api/revalidate/route.ts` |
| **Method** | POST |
| **Auth** | `Authorization: Bearer <REVALIDATION_SECRET>` |
| **Body** | `{ tags: string[] }` |
| **Logic** | Receives tags, expands by locale (and currency for currency-dependent tags), calls `revalidateTag()` |
| **Tag Rules** | `collections`, `blogs`, `blog-*`, `countries`, `featured`, `footer`, `navbar-collections`, `mobile-nav`, `collection-meta-*`, `product-*`, `collection-*`, `related-products-*` |
| **Response** | `{ revalidated: boolean, results: [...], timestamp }` |
| **Note** | Calls `getActiveChannelCached()` internally for currency list |

---

## 7. Call Site Registry (every `query()` / `mutate()` call)

### All `query()` calls (27 sites)

| # | File | Function/Context | Query | Tags |
|---|------|-----------------|-------|------|
| 1 | `src/lib/vendure/cached.ts:5` | `getActiveChannelCached()` | `GetActiveChannelQuery` | `channel` |
| 2 | `src/lib/vendure/cached.ts:10` | `getAvailableCountriesCached(locale)` | `GetAvailableCountriesQuery` | `countries-${locale}` |
| 3 | `src/lib/vendure/cached.ts:15` | `getTopCollections(locale)` | `GetTopCollectionsQuery` | `collections-${locale}` |
| 4 | `src/lib/vendure/actions.ts:12` | `getActiveCustomer()` | `GetActiveCustomerQuery` | — |
| 5 | `src/lib/actions/articles.ts:78` | `getArticles()` | `GetArticlesDocument` | gated by caller |
| 6 | `src/lib/actions/articles.ts:105` | `getArticleBySlug()` | `GetArticleBySlugDocument` | gated by caller |
| 7 | `src/lib/actions/articles.ts:171` | `getArticleCategories()` | `GetArticleCategoriesDocument` | gated by caller |
| 8 | `src/components/aura/products-section.tsx:18` | homepage products | `SearchProductsQuery` | `featured-${locale}-${currency}` |
| 9 | `src/components/aura/featured-category-tabs.tsx:26` | homepage featured tabs | `SearchProductsQuery` | `featured-${locale}-${currency}` |
| 10 | `src/components/aura/quick-view-actions.ts:17` | quick-view modal | `GetProductDetailQuery` | — |
| 11 | `src/components/commerce/related-products.tsx:24` | related products | `GetCollectionProductsQuery` | `related-products-${locale}-${currency}` |
| 12 | `src/components/commerce/featured-products.tsx:21` | featured section | `GetCollectionProductsQuery` | `featured-${locale}-${currency}` |
| 13 | `src/components/layout/navbar/navbar-cart.tsx:12` | nav cart badge | `GetActiveOrderQuery` | — |
| 14 | `src/app/[locale]/cart/cart.tsx:17` | cart page | `GetActiveOrderQuery` | — |
| 15 | `src/app/[locale]/checkout/page.tsx:37` | checkout page | `GetActiveOrderForCheckoutQuery` | — |
| 16 | `src/app/[locale]/checkout/page.tsx:40` | checkout page | `GetCustomerAddressesQuery` | — |
| 17 | `src/app/[locale]/checkout/page.tsx:42` | checkout page | `GetEligibleShippingMethodsQuery` | — |
| 18 | `src/app/[locale]/checkout/page.tsx:43` | checkout page | `GetEligiblePaymentMethodsQuery` | — |
| 19 | `src/app/[locale]/product/[slug]/page.tsx:46` | product detail page | `GetProductDetailQuery` | `product-${slug}-${locale}-${currency}` |
| 20 | `src/app/[locale]/collection/[slug]/page.tsx:39` | collection products | `SearchProductsQuery` | `collection-${slug}-${locale}-${currency}` |
| 21 | `src/app/[locale]/collection/[slug]/page.tsx:54` | collection metadata | `GetCollectionProductsQuery` | `collection-meta-${slug}-${locale}` |
| 22 | `src/app/[locale]/search/search-results.tsx:23` | search results | `SearchProductsQuery` | — |
| 23 | `src/app/[locale]/account/orders/page.tsx:40` | orders list | `GetCustomerOrdersQuery` | — |
| 24 | `src/app/[locale]/account/orders/[code]/page.tsx:26` | order detail | `GetOrderDetailQuery` | — |
| 25 | `src/app/[locale]/account/addresses/page.tsx:20` | addresses list | `GetCustomerAddressesQuery` | — |
| 26 | `src/app/[locale]/account/addresses/page.tsx:21` | countries list | `GetAvailableCountriesQuery` | — |
| 27 | `src/app/[locale]/order-confirmation/[code]/order-confirmation.tsx:62` | order confirmation | `GetOrderByCodeQuery` | — |

### All `mutate()` calls (27 sites)

| # | File | Function | Mutation | Auth |
|---|------|----------|----------|------|
| 1 | `src/app/[locale]/cart/actions.ts:15` | `removeFromCart()` | `RemoveFromCartMutation` | `useAuthToken: true` |
| 2 | `src/app/[locale]/cart/actions.ts:21` | `adjustQuantity()` | `AdjustCartItemMutation` | `useAuthToken: true` |
| 3 | `src/app/[locale]/cart/actions.ts:30` | `applyPromotionCode()` | `ApplyPromotionCodeMutation` | `useAuthToken: true` |
| 4 | `src/app/[locale]/cart/actions.ts:39` | `removePromotionCode()` | `RemovePromotionCodeMutation` | `useAuthToken: true` |
| 5 | `src/app/[locale]/checkout/actions.ts:33` | `setShippingAddress()` | `SetOrderShippingAddressMutation` | `useAuthToken: true` |
| 6 | `src/app/[locale]/checkout/actions.ts:45` | `setShippingAddress()` (when useSameForBilling) | `SetOrderBillingAddressMutation` | `useAuthToken: true` |
| 7 | `src/app/[locale]/checkout/actions.ts:56` | `setShippingMethod()` | `SetOrderShippingMethodMutation` | `useAuthToken: true` |
| 8 | `src/app/[locale]/checkout/actions.ts:71` | `createCustomerAddress()` | `CreateCustomerAddressMutation` | `useAuthToken: true` |
| 9 | `src/app/[locale]/checkout/actions.ts:87` | `transitionToArrangingPayment()` | `TransitionOrderToStateMutation` | `useAuthToken: true` |
| 10 | `src/app/[locale]/checkout/actions.ts:119` | `placeOrder()` | `AddPaymentToOrderMutation` | `useAuthToken: true` |
| 11 | `src/app/[locale]/checkout/actions.ts:164` | `setCustomerForOrder()` | `SetCustomerForOrderMutation` | — |
| 12 | `src/app/[locale]/sign-in/actions.ts:16` | `loginAction()` | `LoginMutation` | — |
| 13 | `src/app/[locale]/sign-in/actions.ts:48` | `logoutAction()` | `LogoutMutation` | `useAuthToken: true` |
| 14 | `src/app/[locale]/register/actions.ts:22` | `registerAction()` | `RegisterCustomerAccountMutation` | — |
| 15 | `src/app/[locale]/forgot-password/actions.ts:16` | `requestPasswordResetAction()` | `RequestPasswordResetMutation` | — |
| 16 | `src/app/[locale]/reset-password/actions.ts:24` | `resetPasswordAction()` | `ResetPasswordMutation` | — |
| 17 | `src/app/[locale]/verify/actions.ts:16` | `verifyAccountAction()` | `VerifyCustomerAccountMutation` | — |
| 18 | `src/app/[locale]/product/[slug]/actions.ts:16` | `addToCart()` | `AddToCartMutation` | `useAuthToken: true` |
| 19 | `src/app/[locale]/account/profile/actions.ts:31` | `updatePasswordAction()` | `UpdateCustomerPasswordMutation` | `useAuthToken: true` |
| 20 | `src/app/[locale]/account/profile/actions.ts:58` | `updateCustomerAction()` | `UpdateCustomerMutation` | `useAuthToken: true` |
| 21 | `src/app/[locale]/account/profile/actions.ts:95` | `requestEmailUpdateAction()` | `RequestUpdateCustomerEmailAddressMutation` | `useAuthToken: true` |
| 22 | `src/app/[locale]/account/addresses/actions.ts:29` | `createAddress()` | `CreateCustomerAddressMutation` | `useAuthToken: true` |
| 23 | `src/app/[locale]/account/addresses/actions.ts:47` | `updateAddress()` | `UpdateCustomerAddressMutation` | `useAuthToken: true` |
| 24 | `src/app/[locale]/account/addresses/actions.ts:76` | `deleteAddress()` | `DeleteCustomerAddressMutation` | `useAuthToken: true` |
| 25 | `src/app/[locale]/account/addresses/actions.ts:92` | `setDefaultShippingAddress()` | `UpdateCustomerAddressMutation` | `useAuthToken: true` |
| 26 | `src/app/[locale]/account/addresses/actions.ts:113` | `setDefaultBillingAddress()` | `UpdateCustomerAddressMutation` | `useAuthToken: true` |
| 27 | `src/app/[locale]/account/verify-email/page.tsx:37` | inline verify email | `UpdateCustomerEmailAddressMutation` | `useAuthToken: true` |

---

## 8. Summary Statistics

| Category | Count |
|----------|-------|
| **GraphQL fragments** | 4 |
| **GraphQL queries** | 19 (14 vendor + 4 article + 1 inline) |
| **GraphQL mutations** | 24 |
| **Unique GraphQL operations** | 47 (4 fragments + 19 queries + 24 mutations) |
| **Direct `fetch()` calls** | 1 (inside `api.ts`) |
| **Server action files** | 13 |
| **Server action functions** | ~25 |
| **API abstraction functions** | 8 (query, mutate, 3 cached, 1 server, 3 article) |
| **`query()` call sites** | 27 |
| **`mutate()` call sites** | 27 |
| **Total call sites** | 54 |
| **Non-GraphQL endpoints** | 1 (`POST /api/revalidate`) |
| **REST/axios/SWR/React Query libraries** | 0 |

---

## 9. Data Shape Compatibility (for REST migration)

| Frontend Pattern | Backend Must Support |
|---|---|
| `priceWithTax` field | Compute as `price * (1 + taxRate/100)` in API |
| `priceWithTax` on SearchResult is Union (`PriceRange` \| `SinglePrice`) | Search aggregation returns `min`/`max` for range, single `value` for identical |
| `stockLevel` string | Map from inventory: `'IN_STOCK'` if available > 0, `'OUT_OF_STOCK'` otherwise |
| `options[].code` + `options[].groupId` | `product_option_groups.code` + `product_options.code` (added in migration 027) |
| `billingAddress` separate from `shippingAddress` | Both stored in `order_addresses` with `type` = 'shipping'/'billing' |
| `shippingLines[{shippingMethod{...}, priceWithTax}]` | Join `orders.shipping_method` → `shipping_methods` |
| `couponCodes: string[]` | Aggregate from `order_discounts.coupon_code` |
| `payments[{method, amount, state, transactionId}]` | Map from `order_payments` |
| `country` as object `{id, code, name}` in addresses | `order_addresses.country_code` → join `countries` table |
| `defaultShippingAddress` / `defaultBillingAddress` as boolean flags | `addresses.is_default_shipping` / `is_default_billing` |
| `RegisterCustomerInput` type | Maps to auth register + user creation |
| `CreateAddressInput` type | Maps to `addresses` table columns |
| `UpdateCustomerInput` type | Maps to `users` table columns |
| `SearchInput` type | Maps to products search with filters, sort, pagination |
| `OrderListOptions` type | Maps to orders query with pagination/sort |
| ErrorResult union pattern | Consistent error shape: `{ __typename, errorCode, message }` |
