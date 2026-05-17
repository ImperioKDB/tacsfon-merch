# Phase 7 — Order Status Management

## New Files

| File | Purpose |
|------|---------|
| `lib/orders/orderUtils.js` | Updated with full transition map + isValidTransition() |
| `pages/api/admin/orders/[id]/status.js` | PATCH — admin dispatches confirmed order |
| `pages/api/orders/[id]/received.js` | PATCH — student marks dispatched order as received |

## Valid Status Flow

pending_payment → payment_submitted → confirmed → dispatched → received

cancelled is reachable from pending_payment only (by student).

## Test Checklist

```bash
# Admin dispatches a confirmed order
curl -X PATCH http://localhost:3000/api/admin/orders/ORDER_UUID/status \
  -H "Authorization: Bearer ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"status": "dispatched"}'
# Expected: 200, status = "dispatched", notification sent, log written

# Admin tries to dispatch a pending order (should fail)
# Expected: 400 INVALID_STATUS_CHANGE

# Admin tries to set status to "received" (student-only action)
# Expected: 400 INVALID_STATUS_CHANGE

# Student marks dispatched order as received
curl -X PATCH http://localhost:3000/api/orders/ORDER_UUID/received \
  -H "Authorization: Bearer JWT"
# Expected: 200, status = "received"

# Student tries to mark a pending order as received
# Expected: 400 INVALID_STATUS_CHANGE

# Student tries to mark another student's order
# Expected: 404 ORDER_NOT_FOUND
```
