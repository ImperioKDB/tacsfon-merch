# TACSFON Merch Store — Backend API

**Stack:** Next.js API Routes · Supabase (PostgreSQL) · Render · Telegram Bot  
**Deployment:** Vercel (API routes) + Render (heavy tasks)

---

## Phase Build Status

| Phase | Name | Status |
|-------|------|--------|
| 1 | Foundation | ✅ Done |
| 2 | Auth | ✅ Done |
| 3 | Products & Catalogue | ✅ Done |
| 4 | Cart | ✅ Done |
| 5 | Orders | ✅ Done |
| 6 | Payment & Proof Upload | ⬜ Pending |
| 7 | Order Status Management | ⬜ Pending |
| 8 | Notifications | ⬜ Pending |
| 9 | Receipts | ⬜ Pending |
| 10 | Telegram | ⬜ Pending |
| 11 | Admin Operations | ⬜ Pending |
| 12 | Hardening | ⬜ Pending |

---

## Phase 5 Tests

```bash
# Create an order
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{ "variant_id": "UUID", "quantity": 2 }],
    "delivery_method": "pickup"
  }'
# Expected: 201 { success: true, data: { id, status: "pending_payment", total_amount, ... } }

# List orders
curl http://localhost:3000/api/orders \
  -H "Authorization: Bearer JWT"

# Get single order
curl http://localhost:3000/api/orders/ORDER_UUID \
  -H "Authorization: Bearer JWT"

# Cancel order (pending_payment only)
curl -X DELETE http://localhost:3000/api/orders/ORDER_UUID \
  -H "Authorization: Bearer JWT"
# Expected: { success: true, data: { status: "cancelled" } }

# Try cancelling a confirmed order (should fail)
# Expected: 400 INVALID_STATUS_CHANGE
```

## Architecture

```
lib/
  orders/
    orderUtils.js          — getOrderWithItems(), calculateOrderTotal(),
                             assertValidTransition(), VALID_TRANSITIONS

pages/api/
  orders/
    index.js               — GET /api/orders · POST /api/orders
    [id].js                — GET /api/orders/:id · DELETE /api/orders/:id
```
