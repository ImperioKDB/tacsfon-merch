/**
 * lib/notifications/notificationUtils.js
 *
 * Central utility for creating in-app notifications.
 *
 * Design rule: NEVER throws — catches internally and logs.
 * A notification failure must never break order flow.
 */
import { supabaseAdmin } from '../supabase.js'

/**
 * Inserts a notification row for a student.
 *
 * @param {string} userId   - the student's user id
 * @param {string} message  - human-readable message shown in-app
 */
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

/**
 * Notification message templates.
 * Call these helpers so message wording stays consistent across phases.
 */
export const NotificationMessages = {
  /**
   * Payment confirmed — order is now being prepared.
   * Triggered in: Phase 6 PATCH /api/admin/orders/:id/payment (paid)
   */
  orderConfirmed: (shortId) =>
    `Your order #${shortId} has been confirmed! We're preparing your merch.`,

  /**
   * Order dispatched — merch is on its way.
   * Triggered in: Phase 7 PATCH /api/admin/orders/:id/status (dispatched)
   */
  orderDispatched: (shortId) =>
    `Great news! Your order #${shortId} is on its way. Expected within 48 hours.`,

  /**
   * Payment incomplete — student needs to contact admin.
   * Triggered in: Phase 6 PATCH /api/admin/orders/:id/payment (incomplete)
   */
  paymentIncomplete: (shortId) =>
    `Your payment for order #${shortId} seems incomplete. Please contact admin on WhatsApp.`,

  proofReceived: (shortId) =>
    `Your payment proof for order #${shortId} has been received. We will confirm your payment shortly.`,
};