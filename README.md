# TACSFON Merch Store — Backend API

**Stack:** Next.js API Routes · Supabase (PostgreSQL) · Render · Telegram Bot  
**Deployment:** Vercel (API routes) + Render (heavy tasks)

---

## Phase Build Status

| Phase | Name | Status |
|-------|------|--------|
| 1 | Foundation | ✅ Done |
| 2 | Auth | ✅ Done |
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

## Phase 2 Test

```bash
# 1. Get session (with valid token)
curl http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer YOUR_JWT"
# Expected: { success: true, data: { id, email, full_name, role, ... } }

# 2. Sign out
curl -X POST http://localhost:3000/api/auth/signout \
  -H "Authorization: Bearer YOUR_JWT"
# Expected: { success: true, message: "Signed out successfully." }

# 3. Hit session without token
curl http://localhost:3000/api/auth/session
# Expected: 401 { success: false, error: { code: "UNAUTHORIZED", ... } }

# 4. OAuth callback — test by initiating Google OAuth from frontend
# On success: redirects to /
# On failure: redirects to /login?error=oauth_failed
```

## Architecture

```
lib/
  supabase.js              — anon + service-role Supabase clients
  requestId.js             — UUID request ID attachment
  responseFormatter.js     — standard success/error envelope
  errorCodes.js            — Postgres → API error code map
  errorHandler.js          — central error handler + ApiError class
  validate.js              — UUID validation, method guards
  auth/
    profileUtils.js        — getProfile(), isAdmin() helpers
  middleware/
    logger.js              — structured JSON logging
    cors.js                — CORS with origin allowlist
    auth.js                — JWT validation via Supabase
    roleGuard.js           — admin role check via is_admin() RPC
    withMiddleware.js      — middleware stack composer

pages/api/
  health.js                — GET /api/health (Phase 1 smoke test)
  auth/
    session.js             — GET  /api/auth/session
    signout.js             — POST /api/auth/signout
    callback.js            — GET  /api/auth/callback (Google OAuth redirect)
```
