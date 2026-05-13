# Phase 10 — Telegram Notifications

## New Files

| File | Purpose |
|------|---------|
| `lib/telegram/sendTelegram.js` | sendTelegramMessage() + notifyAdmins() |
| `lib/telegram/orderMessage.js` | buildNewOrderMessage() — HTML formatted message |
| `pages/api/orders/index.js` | UPDATED — wires Telegram into order creation |

## Environment Variables Required

Add these to your .env.local and Vercel dashboard:

```
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_CHAT_ID_1=
TELEGRAM_ADMIN_CHAT_ID_2=
```

## How to Get Your Bot Token & Chat IDs

1. Open Telegram → search @BotFather
2. Send /newbot → follow prompts → copy the token
3. Add the bot to your admin group or DM it
4. Visit: https://api.telegram.org/bot{YOUR_TOKEN}/getUpdates
5. Send any message to the bot, then refresh that URL
6. Find "chat":{"id": ...} — that is your chat ID

## Test Checklist

```bash
# Place a new order
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "delivery_method": "delivery",
    "delivery_address": "123 Main St, Lagos",
    "phone": "08012345678"
  }'
# Expected:
# - 201 order created
# - Both admin Telegram chats receive message within ~5 seconds
# - Cart is cleared

# Telegram failure simulation (wrong token in env)
# Expected: order still created, error only logged internally

# Walk-in orders (POST /api/admin/orders/walkin)
# Expected: NO Telegram message sent (walk-ins are in-person)
```

## No new npm packages needed for Phase 10.
## fetch() is available natively in Node.js 18+.
## If on Node 16, add: npm install node-fetch
