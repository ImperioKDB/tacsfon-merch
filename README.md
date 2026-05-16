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
| 6 | Payment & Proof Upload | ✅ Done |
| 7 | Order Status Management | ✅ Done |
| 8 | Notifications | ✅ Done |
| 9 | Receipts | ✅ Done |
| 10 | Telegram | ✅ Done |
| 11 | Admin Operations | ✅ Done |
| 12 | Hardening | ⬜ Pending |

---

## Phase 5 Tests

```bash
# Create an order (cart must have items first)
# Body: delivery_address and phone are optional
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "delivery_address": "123 Main St, Lagos",
    "phone": "08012345678"
  }'
# Expected: 201 { success: true, data: { id, status: "pending_payment", total, ... } }

# List current user's orders
curl http://localhost:3000/api/orders \
  -H "Authorization: Bearer JWT"

# Get single order
curl http://localhost:3000/api/orders/ORDER_UUID \
  -H "Authorization: Bearer JWT"

# Cancel order (only allowed when status = pending_payment)
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
    [id]/
      proof.js             — POST /api/orders/:id/proof
      receipt.js           — GET  /api/orders/:id/receipt
      received.js          — PATCH /api/orders/:id/received
```

---

## Order Status Flow

```
pending_payment
    │
    ▼  (student uploads proof)
payment_submitted
    │
    ▼  (admin confirms payment)
confirmed
    │
    ▼  (admin dispatches)
dispatched
    │
    ▼  (student marks received)
received

pending_payment ──► cancelled  (student cancels before paying)
payment_submitted ──► cancelled  (admin rejects / admin cancels)
```

---

## Environment Variables

See `.env.example` for the full list. Required at minimum:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_CHAT_ID_1=
TELEGRAM_ADMIN_CHAT_ID_2=
```
