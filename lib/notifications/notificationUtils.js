/**
 * lib/notifications/notificationUtils.js
 *
 * Creates notification rows for students.
 * Phase 8 will expand this; Phase 6 uses it already for payment events.
 *
 * Design rule: NEVER throws — catches internally and logs.
 * A notification failure must never break order flow.
 *
 * @param {string} userId   - the student's user id
 * @param {string} message  - human-readable message shown in-app
 */
import { supabaseAdmin } from '../supabase.js'

export async function createNotification(userId, message) {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id:    userId,
        message,
        is_read:    false,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error(JSON.stringify({
        level:   'error',
        event:   'notification_insert_failed',
        userId,
        message,
        error:   error.message,
      }))
    }
  } catch (err) {
    console.error(JSON.stringify({
      level:   'error',
      event:   'notification_unexpected_error',
      userId,
      message,
      error:   err.message,
    }))
  }
}
