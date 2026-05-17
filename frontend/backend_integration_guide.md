# TACSFON Merch Store — Backend Integration Guide
**Audience:** Backend Engineer (Node.js / Next.js)
**DB:** Supabase (PostgreSQL) | **Region:** eu-west-1
**Version:** 1.0

---

## Connection

Use the **service-role key** for all backend operations. It bypasses RLS, so you have full read/write access to every table.

```
SUPABASE_URL=https://cxixgqthomhjtirnbxrl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<from Supabase Dashboard → Settings → API>
SUPABASE_ANON_KEY=<share this with frontend only>
```

Never expose the service-role key to the frontend or client-side code.

---

## Tables Reference

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Matches `auth.users.id` exactly |
| full_name | text | NOT NULL |
| email | text | NOT NULL, UNIQUE |
| phone | text | nullable |
| role | text | `'student'` or `'admin'` — CHECK constraint enforced |
| created_at | timestamptz | auto |

**Never INSERT manually.** The `on_auth_user_created` trigger handles this on every new auth signup. To promote a user to admin, UPDATE their `role` directly.

---

### `categories`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | NOT NULL, UNIQUE |
| created_at | timestamptz | auto |

---

### `products`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | NOT NULL |
| description | text | nullable |
| base_price | numeric(10,2) | NOT NULL, >= 0 |
| category_id | uuid | FK → categories, SET NULL on delete |
| image_url | text | URL to product-assets bucket |
| model_url | text | URL to .glb in product-assets bucket |
| is_available | boolean | Default true. Set false to hide from frontend |
| stock_type | text | `'stock'`, `'preorder'`, or `'both'` |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto-updated by trigger on every UPDATE |

---

### `product_variants`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| product_id | uuid | FK → products, CASCADE on delete |
| size | text | e.g. `'S'`, `'M'`, `'L'`, `'XL'`, `'One Size'` |
| color | text | e.g. `'Black'`, `'White'` |
| stock_qty | integer | Default 0, >= 0 |
| price_override | numeric(10,2) | nullable — if NULL, use product's base_price |
| created_at | timestamptz | auto |

---

### `carts`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users, UNIQUE, CASCADE on delete |
| created_at | timestamptz | auto |

One cart per user. Create on first add-to-cart if it doesn't exist.

---

### `cart_items`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| cart_id | uuid | FK → carts, CASCADE on delete |
| product_id | uuid | FK → products, CASCADE on delete |
| variant_id | uuid | FK → product_variants, SET NULL on delete — nullable |
| quantity | integer | > 0, CHECK constraint |
| created_at / updated_at | timestamptz | updated_at auto-updated by trigger |

UNIQUE constraint on `(cart_id, product_id, variant_id)` — use UPSERT when adding items.

---

### `orders`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users, SET NULL on delete — nullable (walk-in orders have no user) |
| type | text | `'online'` or `'walkin'` |
| status | text | `'pending'` → `'confirmed'` → `'dispatched'` → `'received'` |
| total | numeric(10,2) | >= 0 |
| delivery_address | text | nullable |
| phone | text | nullable |
| payment_status | text | `'unpaid'`, `'paid'`, `'incomplete'` |
| customer_name | text | nullable — for walk-in orders |
| proof_url | text | nullable — storage path to proof-uploads file |
| created_at / updated_at | timestamptz | updated_at auto-updated by trigger |

---

### `order_items`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| order_id | uuid | FK → orders, CASCADE on delete |
| product_id | uuid | FK → products, SET NULL on delete |
| variant_id | uuid | FK → product_variants, SET NULL on delete |
| quantity | integer | > 0 |
| unit_price | numeric(10,2) | Snapshot of price at time of order — do NOT recalculate from products table later |
| created_at | timestamptz | auto |

Always snapshot `unit_price` from `COALESCE(variant.price_override, product.base_price)` at order creation time.

---

### `receipts`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| order_id | uuid | FK → orders, CASCADE on delete, UNIQUE |
| receipt_url | text | Storage path to receipts bucket |
| created_at | timestamptz | auto |

Only your backend (service-role) can INSERT. Immutable — UPDATE and DELETE are RLS-blocked even for service-role as a safeguard.

---

### `notifications`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users, CASCADE on delete |
| message | text | NOT NULL |
| is_read | boolean | Default false |
| created_at | timestamptz | auto |

Only your backend inserts notifications. Frontend subscribes via Realtime.

---

### `admin_logs`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| admin_id | uuid | FK → auth.users, SET NULL on delete |
| action | text | e.g. `'UPDATE_ORDER_STATUS'`, `'DELETE_PRODUCT'` |
| details | jsonb | Flexible payload, e.g. `{ "order_id": "...", "old_status": "pending", "new_status": "confirmed" }` |
| created_at | timestamptz | auto |

Immutable — UPDATE and DELETE are blocked. INSERT on every admin action.

---

## Enum Values (CHECK Constraints)

| Table | Column | Allowed Values |
|-------|--------|----------------|
| profiles | role | `'student'`, `'admin'` |
| products | stock_type | `'stock'`, `'preorder'`, `'both'` |
| orders | type | `'online'`, `'walkin'` |
| orders | status | `'pending'`, `'confirmed'`, `'dispatched'`, `'received'` |
| orders | payment_status | `'unpaid'`, `'paid'`, `'incomplete'` |

Sending any other value will throw Postgres error `23514` — return `400` to the client.

---

## RPC Functions

### `is_admin(user_id uuid) → boolean`
Quick role check. Call via RPC before any admin-only operation.

```js
const { data } = await supabase.rpc('is_admin', { user_id: decodedJwt.sub })
if (!data) return res.status(403).json({ error: 'Forbidden' })
```

### `get_cart_total(cart_id uuid) → numeric`
Returns the total price of all items in a cart, using `price_override` where set.

```js
const { data } = await supabase.rpc('get_cart_total', { cart_id })
// data = 27500.00
```

---

## Admin Role Enforcement Pattern

The service-role key gives DB access but does NOT verify who the caller is. Always:

1. Extract the JWT from the `Authorization: Bearer <token>` header
2. Decode it (or call `supabase.auth.getUser(token)`)
3. Call `is_admin(user_id)` via RPC
4. Reject with `403` if not admin

Never trust a `role` field sent from the client in the request body.

---

## Error Codes Your Handler Must Catch

| Postgres Code | Cause | Return to Client |
|---------------|-------|-----------------|
| `23514` | CHECK constraint violation (bad enum value, negative price, zero quantity) | `400 Bad Request` |
| `23503` | Foreign key violation (e.g. invalid category_id, product_id) | `400 Bad Request` |
| `23505` | UNIQUE violation (duplicate email, duplicate cart item) | `409 Conflict` |
| `42501` / empty result | RLS blocked the operation | `403 Forbidden` |
| Storage error | Upload/download failed | `500` with details |

---

## Storage — Signed URLs

For private buckets (`proof-uploads`, `receipts`) never return the raw storage path to the frontend. Generate a signed URL server-side:

```js
const { data } = await supabase.storage
  .from('proof-uploads')
  .createSignedUrl(`${userId}/${filename}`, 3600) // 1hr expiry
```

For `receipts`, use the `order_id` as the folder:
```js
const { data } = await supabase.storage
  .from('receipts')
  .createSignedUrl(`${orderId}/receipt.pdf`, 3600)
```

---

## Realtime Channels (Frontend — for your reference)

Frontend subscribes to these — you trigger them by inserting rows:

| Channel | Table | Event | Filter |
|---------|-------|-------|--------|
| New notification | `notifications` | INSERT | `user_id = eq.{current_user_id}` |
| Order status change | `orders` | UPDATE | `id = eq.{order_id}` |

Insert a `notifications` row whenever order status changes so the frontend gets an instant push.

---

## Storage URL Patterns

```
Product image:  {SUPABASE_URL}/storage/v1/object/public/product-assets/images/{product_id}/main.webp
3D model:       {SUPABASE_URL}/storage/v1/object/public/product-assets/models/{product_id}/model.glb
Proof upload:   Signed URL — generate server-side (path: {user_id}/{filename})
Receipt:        Signed URL — generate server-side (path: {order_id}/receipt.pdf)
```

---

## Do Not Touch

- `auth.users` — use Supabase Auth SDK only
- `profiles` INSERT — handled by trigger only
- `receipts` INSERT/UPDATE/DELETE — INSERT via service-role only; UPDATE/DELETE blocked
- `admin_logs` UPDATE/DELETE — blocked entirely; logs are append-only
