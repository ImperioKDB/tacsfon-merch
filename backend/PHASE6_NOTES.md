# Phase 6 — Payment & Proof Upload

## New Files Added

| File | Purpose |
|------|---------|
| `lib/upload/fileValidator.js` | MIME + magic-byte validation for proof files |
| `lib/upload/storageHelpers.js` | Supabase Storage upload + signed URL helpers |
| `lib/admin/adminLogger.js` | `logAdminAction()` utility for all admin routes |
| `lib/notifications/notificationUtils.js` | `createNotification()` — reused in Phases 7–10 |
| `pages/api/orders/[id]/proof.js` | `POST` — student uploads payment proof |
| `pages/api/admin/orders/[id]/proof.js` | `GET` — admin views signed proof URL |
| `pages/api/admin/orders/[id]/payment.js` | `PATCH` — admin confirms/rejects payment |

## Dependency Required

```bash
npm install formidable
```

formidable handles multipart/form-data (file uploads) since Next.js default
body parser doesn't support it.

## Environment Variables (no new ones needed for Phase 6)

All storage goes through `SUPABASE_SERVICE_ROLE_KEY` already configured in Phase 1.

## Supabase Storage Bucket

Create a bucket named `proof-uploads` in your Supabase dashboard:
- **Private** (not public) — access only via signed URLs
- RLS: deny all direct access (backend uses service-role key to bypass)

## Phase 6 Test Checklist

```bash
# 1. Upload valid proof image
curl -X POST http://localhost:3000/api/orders/ORDER_UUID/proof \
  -H "Authorization: Bearer JWT" \
  -F "proof=@/path/to/receipt.jpg"
# Expected: 200 { success: true, data: { proof_url, status: "payment_submitted" } }

# 2. Upload file over 5 MB
# Expected: 400 FILE_TOO_LARGE

# 3. Upload .exe renamed to .jpg
# Expected: 400 INVALID_FILE_TYPE

# 4. Upload proof for another user's order
# Expected: 404 ORDER_NOT_FOUND  (not 403 — don't leak existence)

# 5. Admin views proof
curl http://localhost:3000/api/admin/orders/ORDER_UUID/proof \
  -H "Authorization: Bearer ADMIN_JWT"
# Expected: 200 { signed_url: "https://...", expires_in: 900 }

# 6. Admin confirms payment
curl -X PATCH http://localhost:3000/api/admin/orders/ORDER_UUID/payment \
  -H "Authorization: Bearer ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"payment_status": "paid"}'
# Expected: 200, order.status = "confirmed", notification created, admin log written

# 7. Admin marks incomplete
curl -X PATCH http://localhost:3000/api/admin/orders/ORDER_UUID/payment \
  -H "Authorization: Bearer ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"payment_status": "incomplete"}'
# Expected: 200, notification sent with WhatsApp contact message

# 8. Student hits admin proof endpoint
# Expected: 403 FORBIDDEN
```
