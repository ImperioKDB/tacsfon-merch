# TACSFON Merch Store — Backend API

**Stack:** Next.js API Routes · Supabase (PostgreSQL) · Render · Telegram Bot  
**Deployment:** Vercel (API routes) + Render (heavy tasks)

---

## Phase Build Status

| Phase | Name | Status |
|-------|------|--------|
| 1 | Foundation | ✅ Done |
| 2 | Auth | ⬜ Pending |
| 3 | Products & Catalogue | ⬜ Pending |
| 4 | Cart | ⬜ Pending |
| 5 | Orders | ⬜ Pending |
| 6 | Payment & Proof Upload | ⬜ Pending |
| 7 | Order Status Management | ⬜ Pending |
| 8 | Notifications | ⬜ Pending |
| 9 | Receipts | ⬜ Pending |
| 10 | Telegram | ⬜ Pending |
| 11 | Admin Operations | ⬜ Pending |
| 12 | Hardening | ⬜ Pending |

---

## Local Setup

```bash
npm install
cp .env.example .env.local
# Fill in .env.local with your Supabase keys
npm run dev
```

## Phase 1 Test

```bash
curl http://localhost:3000/api/health
# Expected: { success: true, data: { status: "ok", database: "connected" } }
# Expected header: X-Request-ID: <uuid>
```

## Architecture

```
lib/
  supabase.js          — anon + service-role Supabase clients
  requestId.js         — UUID request ID attachment
  responseFormatter.js — standard success/error envelope
  errorCodes.js        — Postgres → API error code map
  errorHandler.js      — central error handler + ApiError class
  validate.js          — UUID validation, method guards
  middleware/
    logger.js          — structured JSON logging
    cors.js            — CORS with origin allowlist
    auth.js            — JWT validation via Supabase
    roleGuard.js       — admin role check via is_admin() RPC
    withMiddleware.js  — middleware stack composer

pages/api/
  health.js            — GET /api/health (Phase 1 smoke test)
```
