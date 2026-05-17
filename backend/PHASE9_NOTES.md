# Phase 9 — Receipts

## New Files

| File | Purpose |
|------|---------|
| `lib/receipts/generateReceipt.js` | PDF generation using pdfkit |
| `lib/receipts/receiptStorage.js` | Supabase Storage + receipts table helpers |
| `lib/receipts/index.js` | Orchestrator — buildAndStoreReceipt(), getOrCreateReceiptUrl() |
| `pages/api/orders/[id]/receipt.js` | GET — student fetches their receipt |
| `pages/api/admin/orders/[id]/receipt.js` | GET — admin fetches/regenerates any receipt |
| `pages/api/admin/orders/[id]/payment.js` | UPDATED — now calls real receipt generator |

## New npm Package Required

```bash
npm install pdfkit
```

## Supabase Storage Bucket

Create a bucket named `receipts` in your Supabase dashboard:
- Private (not public)
- RLS: deny all direct access (backend uses service-role key)

## Test Checklist

```bash
# Confirm payment (triggers receipt generation automatically)
curl -X PATCH http://localhost:3000/api/admin/orders/ORDER_UUID/payment \
  -H "Authorization: Bearer ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"payment_status": "paid"}'
# Expected: receipt generated async in background

# Student fetches receipt
curl http://localhost:3000/api/orders/ORDER_UUID/receipt \
  -H "Authorization: Bearer JWT"
# Expected: 200 { signed_url: "https://...", expires_in: 3600 }

# Fetch receipt before payment confirmed
# Expected: 400 PAYMENT_NOT_CONFIRMED

# Student fetches another student's receipt
# Expected: 404 ORDER_NOT_FOUND

# Admin fetches receipt
curl http://localhost:3000/api/admin/orders/ORDER_UUID/receipt \
  -H "Authorization: Bearer ADMIN_JWT"
# Expected: 200 with signed URL

# Admin regenerates receipt
curl http://localhost:3000/api/admin/orders/ORDER_UUID/receipt?regenerate=true \
  -H "Authorization: Bearer ADMIN_JWT"
# Expected: 200 { regenerated: true }

# Fetch receipt twice — same file served, no duplicate generation
# Expected: both calls return working signed URLs
```
