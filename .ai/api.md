# API Reference

## Base URLs

| API | Base URL | Port |
|---|---|---|
| Storefront API | `/api/v1` | 3000 |
| Admin API | `/api/v1/admin` | 3002 |

## Common Headers

| Header | Required | Description |
|---|---|---|
| `Authorization` | For auth-required endpoints | `Bearer <supabase-jwt>` |
| `Accept-Language` | Optional | `vi`, `en`, `de` (default: `en`) |
| `X-Currency-Code` | Optional | Currency code (default: from channel) |
| `X-Session-Id` | For guest cart | UUID for guest session |
| `Content-Type` | For POST/PATCH | `application/json` |

## Common Response Format

```
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 12,
    "totalItems": 100,
    "totalPages": 9
  }
}
```

Error response:

```
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": { ... }
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| VALIDATION_ERROR | 400 | Invalid input |
| UNAUTHORIZED | 401 | Missing or invalid auth token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Duplicate or conflict |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

# Endpoint Summary

## Storefront API (`/api/v1`)

### Authentication
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | /auth/register | Register new customer | No |
| POST | /auth/verify | Verify email with token | No |
| POST | /auth/login | Login (returns JWT session) | No |
| POST | /auth/logout | Invalidate session | Yes |
| POST | /auth/forgot-password | Request password reset email | No |
| POST | /auth/reset-password | Reset password with token | No |
| POST | /auth/change-password | Change current password | Yes |
| POST | /auth/change-email | Request email change | Yes |

### Products
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /products | List/search products with facets | No |
| GET | /products/{slug} | Product detail with variants | No |
| GET | /products/{slug}/variants | Product variants only | No |
| GET | /search | Full-text search with faceted filters | No |

### Categories
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /categories | List category tree | No |
| GET | /categories/{slug} | Category detail | No |
| GET | /categories/{slug}/products | Products in category | No |

### Brands
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /brands | List all active brands | No |
| GET | /brands/{slug} | Brand detail | No |
| GET | /brands/{slug}/products | Products by brand | No |

### Inventory
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /inventory/variants/{variantId} | Check variant stock level | No |

### Cart
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /cart | Get current cart | Session |
| POST | /cart/items | Add item to cart | Session |
| PATCH | /cart/items/{lineId} | Update item quantity | Session |
| DELETE | /cart/items/{lineId} | Remove item from cart | Session |
| POST | /cart/coupons | Apply coupon code | Session |
| DELETE | /cart/coupons/{code} | Remove coupon | Session |

### Checkout
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | /checkout/customer | Set customer for guest | Session |
| POST | /checkout/shipping-address | Set shipping address | Session |
| POST | /checkout/billing-address | Set billing address | Session |
| GET | /checkout/shipping-methods | Get eligible shipping methods | Session |
| POST | /checkout/shipping-method | Select shipping method | Session |
| GET | /checkout/payment-methods | Get eligible payment methods | Session |
| POST | /checkout/payment | Place order | Session |
| GET | /checkout/summary | Checkout summary | Session |

### Orders
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /orders | Customer order history | Yes |
| GET | /orders/{code} | Order detail by code | Yes/Session |

### Account
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /account/profile | Get customer profile | Yes |
| PATCH | /account/profile | Update profile | Yes |
| GET | /account/addresses | List addresses | Yes |
| POST | /account/addresses | Create address | Yes |
| PATCH | /account/addresses/{id} | Update address | Yes |
| DELETE | /account/addresses/{id} | Delete address | Yes |

### Reviews
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /products/{slug}/reviews | List reviews for product | No |
| POST | /products/{slug}/reviews | Create review | Yes |

### Coupons
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | /coupons/validate | Validate a coupon code | No |

### Articles
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /articles | List published articles | No |
| GET | /articles/{slug} | Article detail | No |
| GET | /article-categories | List article categories | No |
| GET | /article-tags | List article tags | No |

### Content
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /banners | List active banners | No |
| GET | /settings/public | Get public settings | No |
| GET | /countries | Get available countries | No |
| GET | /channel | Get active channel info | No |

---

## Admin API (`/api/v1/admin`)

### Authentication
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | /auth/login | Admin login | No |
| POST | /auth/logout | Admin logout | Yes |
| GET | /auth/me | Current admin profile | Yes |

### Products (Full CRUD)
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /products | List all products | Yes |
| POST | /products | Create product | Yes |
| GET | /products/{id} | Get product by ID | Yes |
| PATCH | /products/{id} | Update product | Yes |
| DELETE | /products/{id} | Soft delete product | Yes |
| POST | /products/{id}/variants | Add variant | Yes |
| PATCH | /products/{id}/variants/{variantId} | Update variant | Yes |
| DELETE | /products/{id}/variants/{variantId} | Delete variant | Yes |
| POST | /products/{id}/images | Upload product image | Yes |
| DELETE | /products/{id}/images/{imageId} | Delete product image | Yes |
| POST | /products/{id}/option-groups | Create option group | Yes |
| PATCH | /products/{id}/option-groups/{groupId} | Update option group | Yes |
| DELETE | /products/{id}/option-groups/{groupId} | Delete option group | Yes |

### Categories (Full CRUD)
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /categories | List all categories | Yes |
| POST | /categories | Create category | Yes |
| GET | /categories/{id} | Get category by ID | Yes |
| PATCH | /categories/{id} | Update category | Yes |
| DELETE | /categories/{id} | Soft delete category | Yes |
| POST | /categories/{id}/products | Assign products to category | Yes |
| DELETE | /categories/{id}/products/{productId} | Remove product from category | Yes |

### Brands (Full CRUD)
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /brands | List all brands | Yes |
| POST | /brands | Create brand | Yes |
| GET | /brands/{id} | Get brand by ID | Yes |
| PATCH | /brands/{id} | Update brand | Yes |
| DELETE | /brands/{id} | Soft delete brand | Yes |

### Inventory
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /inventory | List all inventory levels | Yes |
| GET | /inventory/{variantId} | Get variant inventory | Yes |
| PATCH | /inventory/{variantId} | Update inventory settings | Yes |
| POST | /inventory/adjustments | Record manual adjustment | Yes |

### Orders (Management)
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /orders | List all orders | Yes |
| GET | /orders/{id} | Order detail by ID | Yes |
| PATCH | /orders/{id}/status | Update order status | Yes |
| GET | /orders/{id}/history | Order status history | Yes |
| POST | /orders/{id}/notes | Add internal note | Yes |

### Customers
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /customers | List all customers | Yes |
| GET | /customers/{id} | Customer detail | Yes |
| GET | /customers/{id}/orders | Customer order history | Yes |
| GET | /customers/{id}/addresses | Customer addresses | Yes |

### Reviews (Moderation)
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /reviews | List all reviews | Yes |
| PATCH | /reviews/{id} | Approve/reject review | Yes |
| DELETE | /reviews/{id} | Delete review | Yes |

### Coupons & Discounts
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /discounts | List discount rules | Yes |
| POST | /discounts | Create discount rule | Yes |
| PATCH | /discounts/{id} | Update discount rule | Yes |
| DELETE | /discounts/{id} | Delete discount rule | Yes |
| GET | /coupons | List coupon codes | Yes |
| POST | /coupons | Create coupon code | Yes |
| PATCH | /coupons/{id} | Update coupon | Yes |
| DELETE | /coupons/{id} | Delete coupon | Yes |
| GET | /coupons/{id}/usages | Coupon usage history | Yes |

### Articles (Content Management)
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /articles | List all articles | Yes |
| POST | /articles | Create article | Yes |
| GET | /articles/{id} | Get article by ID | Yes |
| PATCH | /articles/{id} | Update article | Yes |
| DELETE | /articles/{id} | Delete article | Yes |
| GET | /article-categories | List article categories | Yes |
| POST | /article-categories | Create article category | Yes |
| PATCH | /article-categories/{id} | Update article category | Yes |
| DELETE | /article-categories/{id} | Delete article category | Yes |
| GET | /article-tags | List article tags | Yes |
| POST | /article-tags | Create article tag | Yes |
| DELETE | /article-tags/{id} | Delete article tag | Yes |

### Uploads
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | /uploads | Upload file (returns presigned URL) | Yes |
| DELETE | /uploads | Delete file by URL | Yes |

### Shipping Methods
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /shipping-methods | List all methods | Yes |
| POST | /shipping-methods | Create method | Yes |
| PATCH | /shipping-methods/{id} | Update method | Yes |
| DELETE | /shipping-methods/{id} | Delete method | Yes |

### Payment Methods
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /payment-methods | List all methods | Yes |
| POST | /payment-methods | Create method | Yes |
| PATCH | /payment-methods/{id} | Update method | Yes |
| DELETE | /payment-methods/{id} | Delete method | Yes |

### Banners
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /banners | List all banners | Yes |
| POST | /banners | Create banner | Yes |
| PATCH | /banners/{id} | Update banner | Yes |
| DELETE | /banners/{id} | Delete banner | Yes |

### Settings
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /settings | List all settings | Yes |
| PATCH | /settings/{key} | Update setting | Yes |

### Dashboard & Statistics
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /dashboard/stats | Overview stats | Yes |
| GET | /dashboard/revenue | Revenue over time | Yes |
| GET | /dashboard/orders | Recent orders | Yes |
| GET | /dashboard/top-products | Top selling products | Yes |
| GET | /dashboard/revenue-summary | Revenue summary (today/week/month/year) | Yes |
| GET | /dashboard/order-stats | Order statistics by status | Yes |
| GET | /dashboard/customer-stats | Customer statistics | Yes |

---

# Request & Response Examples

## Authentication

### Register

**Request:**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "securePass123",
  "firstName": "Nguyen",
  "lastName": "Van A",
  "phone": "+84912345678"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "message": "Account created. Please verify your email."
  }
}
```

**Error (409):**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Email already registered"
  }
}
```

### Login

**Request:**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "securePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "email": "customer@example.com",
      "firstName": "Nguyen",
      "lastName": "Van A",
      "phone": "+84912345678",
      "avatarUrl": "",
      "createdAt": "2026-01-15T08:30:00.000Z"
    },
    "expiresAt": "2026-07-14T08:30:00.000Z"
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password"
  }
}
```

---

## Products

### List Products

**Request:**
```http
GET /api/v1/products?page=1&pageSize=12&search=ao%20thun&sort=price-asc&categorySlug=ao-thun
Accept-Language: vi
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "name": { "en": "T-Shirt", "vi": "Áo Thun", "de": "T-Shirt" },
        "slug": "ao-thun-cotton-100",
        "basePrice": 150000,
        "isFeatured": true,
        "primaryImage": "https://storage.example.com/products/ao-thun-1.jpg",
        "category": {
          "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
          "name": { "en": "T-Shirts", "vi": "Áo Thun", "de": "T-Shirts" },
          "slug": "ao-thun"
        },
        "brand": {
          "id": "d4e5f6a7-b8c9-0123-defa-234567890123",
          "name": { "en": "Minh An", "vi": "Minh An", "de": "Minh An" },
          "slug": "minh-an"
        }
      }
    ],
    "facets": [
      {
        "groupName": "Size",
        "values": [
          { "id": "e5f6a7b8-...", "name": "M", "count": 12 },
          { "id": "f6a7b8c9-...", "name": "L", "count": 8 }
        ]
      }
    ]
  },
  "meta": {
    "page": 1,
    "pageSize": 12,
    "totalItems": 45,
    "totalPages": 4
  }
}
```

### Get Product Detail

**Request:**
```http
GET /api/v1/products/ao-thun-cotton-100
Accept-Language: vi
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "name": { "en": "Premium Cotton T-Shirt", "vi": "Áo Thun Cotton Cao Cấp", "de": "Premium Baumwoll-T-Shirt" },
    "slug": "ao-thun-cotton-100",
    "description": {
      "en": "100% premium cotton t-shirt, comfortable and breathable.",
      "vi": "Áo thun 100% cotton cao cấp, thoải mái và thoáng mát.",
      "de": "100% Premium-Baumwoll-T-Shirt, bequem und atmungsaktiv."
    },
    "basePrice": 150000,
    "taxRate": 10,
    "isActive": true,
    "isFeatured": true,
    "weight": 200,
    "category": { "id": "...", "name": { "en": "T-Shirts", "vi": "Áo Thun" }, "slug": "ao-thun" },
    "brand": { "id": "...", "name": { "en": "Minh An", "vi": "Minh An" }, "slug": "minh-an" },
    "images": [
      { "id": "...", "url": "https://storage.example.com/products/ao-thun-1.jpg", "alt": { "en": "Front view", "vi": "Mặt trước" }, "sortOrder": 0 }
    ],
    "variants": [
      {
        "id": "...",
        "name": { "en": "White / M", "vi": "Trắng / M" },
        "sku": "ATC-WHT-M",
        "price": 150000,
        "comparePrice": 180000,
        "stock": 50,
        "isActive": true,
        "options": [
          { "id": "...", "name": { "en": "White", "vi": "Trắng" }, "groupId": "..." },
          { "id": "...", "name": { "en": "M", "vi": "M" }, "groupId": "..." }
        ]
      }
    ],
    "optionGroups": [
      {
        "id": "...",
        "name": { "en": "Color", "vi": "Màu sắc" },
        "sortOrder": 0,
        "options": [
          { "id": "...", "name": { "en": "White", "vi": "Trắng" }, "value": { "en": "#FFFFFF" }, "sortOrder": 0 }
        ]
      },
      {
        "id": "...",
        "name": { "en": "Size", "vi": "Kích thước" },
        "sortOrder": 1,
        "options": [
          { "id": "...", "name": { "en": "M", "vi": "M" }, "sortOrder": 0 },
          { "id": "...", "name": { "en": "L", "vi": "L" }, "sortOrder": 1 }
        ]
      }
    ],
    "createdAt": "2026-01-15T08:30:00.000Z",
    "updatedAt": "2026-07-10T14:22:00.000Z"
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product with slug 'non-existent' not found"
  }
}
```

---

## Categories

### List Category Tree

**Request:**
```http
GET /api/v1/categories
Accept-Language: vi
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "name": { "en": "T-Shirts", "vi": "Áo Thun", "de": "T-Shirts" },
      "slug": "ao-thun",
      "description": { "en": "All kinds of t-shirts", "vi": "Tất cả các loại áo thun" },
      "imageUrl": "https://storage.example.com/categories/ao-thun.jpg",
      "isActive": true,
      "sortOrder": 0,
      "parentId": null,
      "productCount": 24,
      "children": [
        {
          "id": "...",
          "name": { "en": "Polo Shirts", "vi": "Áo Polo" },
          "slug": "ao-polo",
          "productCount": 8,
          "children": []
        }
      ],
      "createdAt": "2026-01-10T08:00:00.000Z"
    }
  ]
}
```

---

## Brands

### List Brands

**Request:**
```http
GET /api/v1/brands
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "d4e5f6a7-b8c9-0123-defa-234567890123",
      "name": { "en": "Minh An Uniform", "vi": "Minh An Uniform", "de": "Minh An Uniform" },
      "slug": "minh-an",
      "description": { "en": "Premium corporate uniform manufacturer", "vi": "Nhà sản xuất đồng phục cao cấp" },
      "logoUrl": "https://storage.example.com/brands/minh-an.png",
      "websiteUrl": "https://minhanuniform.com",
      "isActive": true,
      "sortOrder": 0,
      "productCount": 32,
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Inventory

### Check Stock Level

**Request:**
```http
GET /api/v1/inventory/variants/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "f1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "variantId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "quantity": 100,
    "reserved": 5,
    "available": 95,
    "lowStockLevel": 10,
    "trackInventory": true,
    "allowBackorder": false,
    "updatedAt": "2026-07-13T06:00:00.000Z"
  }
}
```

**Out-of-stock:**
```json
{
  "success": true,
  "data": {
    "variantId": "a1b2c3d4-...",
    "quantity": 3,
    "reserved": 3,
    "available": 0,
    "trackInventory": true,
    "allowBackorder": false
  }
}
```

---

## Cart

### Get Cart

**Request:**
```http
GET /api/v1/cart
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cart-uuid",
    "status": "active",
    "items": [
      {
        "id": "line-uuid",
        "variantId": "variant-uuid",
        "variant": {
          "id": "variant-uuid",
          "name": { "en": "White / M" },
          "sku": "ATC-WHT-M",
          "price": 150000,
          "stock": 50
        },
        "product": {
          "id": "product-uuid",
          "name": { "en": "Premium Cotton T-Shirt", "vi": "Áo Thun Cotton Cao Cấp" },
          "slug": "ao-thun-cotton-100",
          "basePrice": 150000,
          "primaryImage": "https://storage.example.com/products/ao-thun-1.jpg"
        },
        "quantity": 2,
        "unitPrice": 150000,
        "linePrice": 300000
      }
    ],
    "coupons": [],
    "subtotal": 300000,
    "discountTotal": 0,
    "grandTotal": 300000,
    "itemCount": 2,
    "createdAt": "2026-07-13T10:00:00.000Z"
  }
}
```

### Add Item to Cart

**Request:**
```http
POST /api/v1/cart/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "variantId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "quantity": 2
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { "...cart with new item..." }
}
```

**Error - Insufficient Stock (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Insufficient stock. Available: 1, Requested: 5"
  }
}
```

### Apply Coupon

**Request:**
```http
POST /api/v1/cart/coupons
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "WELCOME10"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "...": "...",
    "coupons": [{ "code": "WELCOME10", "discountAmount": 15000 }],
    "discountTotal": 15000,
    "grandTotal": 285000
  }
}
```

---

## Checkout

### Set Customer for Guest

**Request:**
```http
POST /api/v1/checkout/customer
X-Session-Id: guest-session-uuid
Content-Type: application/json

{
  "email": "guest@example.com",
  "firstName": "Tran",
  "lastName": "Van B",
  "phone": "+84987654321"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Customer set for order"
  }
}
```

### Set Shipping Address

**Request:**
```http
POST /api/v1/checkout/shipping-address
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Nguyen Van A",
  "company": "Minh An Uniform",
  "streetLine1": "123 Nguyen Hue Street",
  "streetLine2": "District 1",
  "city": "Ho Chi Minh City",
  "province": "HCMC",
  "postalCode": "700000",
  "countryCode": "VN",
  "phone": "+84912345678"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Shipping address set"
  }
}
```

### Get Shipping Methods

**Request:**
```http
GET /api/v1/checkout/shipping-methods
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "ship-uuid-1",
      "name": { "en": "Standard Shipping", "vi": "Giao hàng tiêu chuẩn" },
      "code": "standard",
      "description": { "en": "Delivery in 5-7 business days", "vi": "Giao trong 5-7 ngày" },
      "price": 30000
    },
    {
      "id": "ship-uuid-2",
      "name": { "en": "Express Shipping", "vi": "Giao hàng nhanh" },
      "code": "express",
      "description": { "en": "Delivery in 1-2 business days", "vi": "Giao trong 1-2 ngày" },
      "price": 80000
    }
  ]
}
```

### Place Order

**Request:**
```http
POST /api/v1/checkout/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethodCode": "cod",
  "paymentMetadata": {}
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "code": "MA-20260713-0001",
    "status": "confirmed",
    "currencyCode": "VND",
    "subtotal": 300000,
    "shippingTotal": 30000,
    "discountTotal": 15000,
    "taxTotal": 0,
    "grandTotal": 315000,
    "customer": {
      "id": "user-uuid",
      "email": "customer@example.com",
      "firstName": "Nguyen",
      "lastName": "Van A"
    },
    "items": [
      {
        "id": "order-item-uuid",
        "sku": "ATC-WHT-M",
        "productName": { "en": "Premium Cotton T-Shirt" },
        "variantName": { "en": "White / M" },
        "quantity": 2,
        "unitPrice": 150000,
        "linePrice": 300000,
        "productSlug": "ao-thun-cotton-100",
        "productImage": "https://storage.example.com/products/ao-thun-1.jpg"
      }
    ],
    "payments": [
      { "method": "cod", "amount": 315000, "status": "pending", "transactionId": "" }
    ],
    "createdAt": "2026-07-13T10:30:00.000Z",
    "updatedAt": "2026-07-13T10:30:00.000Z"
  }
}
```

**Error - Payment Failed (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "No shipping method selected"
  }
}
```

---

## Orders

### Order History

**Request:**
```http
GET /api/v1/orders?page=1&pageSize=10
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "order-uuid",
        "code": "MA-20260713-0001",
        "status": "confirmed",
        "grandTotal": 315000,
        "currencyCode": "VND",
        "items": [
          { "id": "...", "productName": { "en": "T-Shirt" }, "quantity": 2, "linePrice": 300000 }
        ],
        "createdAt": "2026-07-13T10:30:00.000Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 5,
    "totalPages": 1
  }
}
```

### Order Detail

**Request:**
```http
GET /api/v1/orders/MA-20260713-0001
Authorization: Bearer <token>
```

**Response (200) — Full order object with shipping address, billing address, payments, discounts, and status history.**

---

## Uploads

### Upload File

**Request:**
```http
POST /api/v1/admin/uploads
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="product.jpg"
Content-Type: image/jpeg

[binary data]
--boundary
Content-Disposition: form-data; name="folder"

products
--boundary--
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "asset-uuid",
    "url": "https://storage.example.com/products/product.jpg",
    "presignedUrl": "https://storage.example.com/products/product.jpg?X-Amz-Signature=...",
    "expiresAt": "2026-07-14T10:30:00.000Z"
  }
}
```

---

## Reviews

### List Product Reviews

**Request:**
```http
GET /api/v1/products/ao-thun-cotton-100/reviews?page=1&pageSize=10&sort=newest
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "review-uuid",
        "productId": "product-uuid",
        "rating": 5,
        "title": "Great quality!",
        "content": "The fabric is very soft and comfortable. Highly recommend.",
        "isVerified": true,
        "isApproved": true,
        "helpfulCount": 3,
        "user": { "firstName": "Nguyen", "lastName": "Van A" },
        "createdAt": "2026-07-01T08:00:00.000Z"
      }
    ],
    "stats": {
      "averageRating": 4.5,
      "totalReviews": 12,
      "distribution": { "1": 0, "2": 1, "3": 1, "4": 3, "5": 7 }
    }
  },
  "meta": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 12,
    "totalPages": 2
  }
}
```

### Create Review

**Request:**
```http
POST /api/v1/products/ao-thun-cotton-100/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "title": "Excellent product",
  "content": "Very satisfied with the purchase."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "new-review-uuid",
    "rating": 5,
    "title": "Excellent product",
    "content": "Very satisfied with the purchase.",
    "isVerified": true,
    "isApproved": false,
    "helpfulCount": 0,
    "createdAt": "2026-07-13T10:30:00.000Z"
  }
}
```

---

## Coupons

### Validate Coupon

**Request:**
```http
POST /api/v1/coupons/validate
Content-Type: application/json

{
  "code": "WELCOME10",
  "orderAmount": 300000
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "discount": {
      "id": "discount-uuid",
      "name": { "en": "Welcome 10% Off" },
      "type": "percentage",
      "value": 10,
      "minOrderAmount": 0,
      "maxDiscount": 50000
    },
    "message": "Coupon applied: 10% off (max 50,000 VND)"
  }
}
```

**Invalid coupon:**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "discount": null,
    "message": "Coupon code 'INVALID' not found or expired"
  }
}
```

---

## Account — Address Management

### Create Address

**Request:**
```http
POST /api/v1/account/addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Nguyen Van A",
  "company": "Minh An Uniform",
  "streetLine1": "123 Nguyen Hue",
  "streetLine2": "District 1",
  "city": "Ho Chi Minh City",
  "province": "HCMC",
  "postalCode": "700000",
  "countryCode": "VN",
  "phone": "+84912345678",
  "isDefaultShipping": true,
  "isDefaultBilling": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "address-uuid",
    "fullName": "Nguyen Van A",
    "streetLine1": "123 Nguyen Hue",
    "city": "Ho Chi Minh City",
    "countryCode": "VN",
    "countryName": "Vietnam",
    "isDefaultShipping": true,
    "isDefaultBilling": true,
    "createdAt": "2026-07-13T10:30:00.000Z"
  }
}
```

---

## Admin

### Admin Login

**Request:**
```http
POST /api/v1/admin/auth/login
Content-Type: application/json

{
  "email": "admin@minhan.com",
  "password": "adminPass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": {
      "id": "admin-uuid",
      "email": "admin@minhan.com",
      "role": "admin"
    }
  }
}
```

### Create Product (Admin)

**Request:**
```http
POST /api/v1/admin/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": { "en": "New Uniform Shirt", "vi": "Áo Sơ Mi Mới", "de": "Neues Uniformhemd" },
  "slug": "new-uniform-shirt",
  "description": { "en": "High quality uniform shirt", "vi": "Áo sơ mi đồng phục chất lượng cao" },
  "categoryId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "brandId": "d4e5f6a7-b8c9-0123-defa-234567890123",
  "taxRate": 10,
  "weight": 250,
  "isFeatured": false
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "new-product-uuid",
    "name": { "en": "New Uniform Shirt", "vi": "Áo Sơ Mi Mới" },
    "slug": "new-uniform-shirt",
    "isActive": true,
    "createdAt": "2026-07-13T10:30:00.000Z"
  }
}
```

### Update Order Status (Admin)

**Request:**
```http
PATCH /api/v1/admin/orders/order-uuid/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "shipped",
  "note": "Shipped via GHN Express. Tracking: GHN123456789"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "code": "MA-20260713-0001",
    "status": "shipped",
    "updatedAt": "2026-07-13T10:30:00.000Z"
  }
}
```

**Error - Invalid transition (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Cannot transition from 'cancelled' to 'shipped'",
    "details": {
      "fromStatus": "cancelled",
      "toStatus": "shipped",
      "allowedTransitions": ["pending", "confirmed", "processing", "shipped", "delivered"]
    }
  }
}
```

### Approve Review (Admin)

**Request:**
```http
PATCH /api/v1/admin/reviews/review-uuid
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "isApproved": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "review-uuid",
    "isApproved": true,
    "updatedAt": "2026-07-13T10:30:00.000Z"
  }
}
```

---

## Dashboard & Statistics

### Dashboard Stats

**Request:**
```http
GET /api/v1/admin/dashboard/stats
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 150000000,
    "totalOrders": 1250,
    "totalCustomers": 890,
    "totalProducts": 340,
    "averageOrderValue": 120000,
    "ordersToday": 15,
    "revenueToday": 4500000,
    "pendingOrders": 8,
    "lowStockCount": 12
  }
}
```

### Revenue Over Time

**Request:**
```http
GET /api/v1/admin/dashboard/revenue?period=monthly&from=2026-01-01&to=2026-07-13
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "data": [
      { "date": "2026-01", "revenue": 20000000, "orders": 180 },
      { "date": "2026-02", "revenue": 22000000, "orders": 195 },
      { "date": "2026-03", "revenue": 25000000, "orders": 210 },
      { "date": "2026-04", "revenue": 23000000, "orders": 200 },
      { "date": "2026-05", "revenue": 28000000, "orders": 240 },
      { "date": "2026-06", "revenue": 30000000, "orders": 260 },
      { "date": "2026-07", "revenue": 2000000, "orders": 15 }
    ]
  }
}
```

### Top Products

**Request:**
```http
GET /api/v1/admin/dashboard/top-products?period=month&limit=5
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "product-uuid-1",
      "name": { "en": "Premium Cotton T-Shirt", "vi": "Áo Thun Cotton Cao Cấp" },
      "slug": "ao-thun-cotton-100",
      "totalSold": 150,
      "totalRevenue": 22500000,
      "image": "https://storage.example.com/products/ao-thun-1.jpg"
    },
    {
      "id": "product-uuid-2",
      "name": { "en": "Executive Dress Shirt", "vi": "Áo Sơ Mi Cao Cấp" },
      "slug": "executive-dress-shirt",
      "totalSold": 85,
      "totalRevenue": 17000000,
      "image": "https://storage.example.com/products/somi-1.jpg"
    }
  ]
}
```

---

# Error Responses Reference

## Validation Error (400)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "property": "email",
      "constraints": {
        "isEmail": "email must be a valid email address"
      }
    }
  }
}
```

## Unauthorized (401)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authentication token"
  }
}
```

## Forbidden (403)
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions to access this resource"
  }
}
```

## Not Found (404)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product with slug 'non-existent' not found"
  }
}
```

## Conflict (409)
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "A resource with this slug already exists"
  }
}
```

## Rate Limited (429)
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later."
  }
}
```

## Internal Error (500)
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

---

# OpenAPI Specification

The complete OpenAPI 3.0.3 specification is available in:

```
.ai/openapi.yaml
```

Import into Swagger UI, Postman, or any OpenAPI-compatible tool for interactive exploration.
