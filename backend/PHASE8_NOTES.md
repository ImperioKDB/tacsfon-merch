# Phase 8 — Notifications

## New Files

| File | Purpose |
|------|---------|
| `lib/notifications/notificationUtils.js` | Updated — adds NotificationMessages templates |
| `pages/api/notifications/index.js` | GET — fetch student notifications |
| `pages/api/notifications/[id]/read.js` | PATCH — mark single notification as read |
| `pages/api/notifications/read-all.js` | PATCH — mark all notifications as read |

## Notification Trigger Points (already wired in previous phases)

| Event | Phase | Message |
|-------|-------|---------|
| Payment confirmed | Phase 6 | "Your order #XXXXXX has been confirmed!" |
| Payment incomplete | Phase 6 | "Your payment seems incomplete. Contact admin." |
| Order dispatched | Phase 7 | "Your order #XXXXXX is on its way." |

## Supabase Realtime (Frontend concern — no API route needed)

The frontend subscribes directly to the notifications table via Supabase Realtime:

```js
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // show toast / badge
  })
  .subscribe()
```

## Test Checklist

```bash
# Fetch all notifications
curl http://localhost:3000/api/notifications \
  -H "Authorization: Bearer JWT"
# Expected: 200 { notifications: [...], total: N, unread: N }

# Fetch unread only
curl http://localhost:3000/api/notifications?unread_only=true \
  -H "Authorization: Bearer JWT"

# Mark single notification as read
curl -X PATCH http://localhost:3000/api/notifications/NOTIF_UUID/read \
  -H "Authorization: Bearer JWT"
# Expected: 200, is_read = true

# Mark another user's notification (should fail)
# Expected: 404 NOT_FOUND

# Mark all as read
curl -X PATCH http://localhost:3000/api/notifications/read-all \
  -H "Authorization: Bearer JWT"
# Expected: 200

# Trigger a notification by confirming payment in Phase 6
# Then fetch notifications — new row should appear
# Expected: notification with correct message and is_read = false
```

## No new npm packages needed for Phase 8.
